import sharp from 'sharp'
import type { OutputAsset, OutputBundle, Plugin } from 'rolldown'

type Options = {
  /**
   * Basename (without extension) of the source image that is the page's Largest
   * Contentful Paint element, e.g. `hero-1`.
   */
  lcpImage: string
  /** The `sizes` attribute the rendered `<img>` uses. Must match exactly. */
  lcpSizes: string
  /** Basenames of woff2 files needed for above-the-fold text. */
  fonts: string[]
}

const MIME: Record<string, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png'
}

const isAsset = (
  entry: OutputBundle[string]
): entry is OutputAsset & { source: Uint8Array | string } =>
  entry.type === 'asset'

const sourceNames = (asset: OutputAsset): string[] => [
  ...(asset.originalFileNames ?? []),
  ...(asset.names ?? [])
]

/**
 * Injects `<link rel="preload">` for the assets that decide first render.
 *
 * The site is client-rendered, so nothing the app references is visible to the
 * browser's preload scanner: the hero image and the webfonts are only requested
 * after the bundle has downloaded, parsed and executed. On a slow connection
 * that is most of a second of dead time before the LCP element is even
 * requested.
 *
 * Filenames are content-hashed, so the tags cannot be written by hand. This
 * plugin reads them out of the finished bundle instead. Variant widths are
 * recovered by decoding each emitted image rather than by parsing filenames,
 * which keeps the generated `imagesrcset` correct no matter how the image
 * pipeline is configured.
 */
export const preloadCritical = ({
  lcpImage,
  lcpSizes,
  fonts
}: Options): Plugin => ({
  name: 'preload-critical',
  apply: 'build',
  enforce: 'post',

  async generateBundle(_options, bundle) {
    const html = Object.values(bundle).find(
      (entry): entry is OutputAsset =>
        entry.type === 'asset' && entry.fileName.endsWith('.html')
    )
    if (!html || typeof html.source !== 'string') return

    /* ----------------------------------------------------------------- LCP */

    const byFormat = new Map<string, { url: string; width: number }[]>()

    for (const entry of Object.values(bundle)) {
      if (!isAsset(entry)) continue

      const extension = entry.fileName.split('.').pop()!
      if (!(extension in MIME) || extension === 'png') continue
      if (!sourceNames(entry).some((n) => n.includes(lcpImage))) continue

      const buffer = Buffer.from(entry.source as Uint8Array)
      const { width } = await sharp(buffer).metadata()
      if (!width) continue

      const list = byFormat.get(extension) ?? []
      list.push({ url: `/${entry.fileName}`, width })
      byFormat.set(extension, list)
    }

    const tags: string[] = []

    // Only the most modern format is preloaded. `type` makes browsers that
    // cannot decode it ignore the hint entirely rather than fetch bytes they
    // will not use, and preloading every format would defeat the purpose.
    const preferred = ['avif', 'webp', 'jpg', 'jpeg'].find((f) =>
      byFormat.has(f)
    )

    if (preferred) {
      const variants = byFormat
        .get(preferred)!
        .sort((a, b) => a.width - b.width)
      const srcset = variants.map((v) => `${v.url} ${v.width}w`).join(', ')

      tags.push(
        `<link rel="preload" as="image" type="${MIME[preferred]}" ` +
          `imagesrcset="${srcset}" imagesizes="${lcpSizes}" fetchpriority="high">`
      )
    } else {
      this.warn(`preload-critical: no emitted variants matched "${lcpImage}"`)
    }

    /* --------------------------------------------------------------- fonts */

    for (const font of fonts) {
      const asset = Object.values(bundle).find(
        (entry): entry is OutputAsset =>
          entry.type === 'asset' &&
          entry.fileName.endsWith('.woff2') &&
          sourceNames(entry).some((n) => n.includes(font))
      )

      if (!asset) {
        this.warn(`preload-critical: no emitted font matched "${font}"`)
        continue
      }

      tags.push(
        `<link rel="preload" as="font" type="font/woff2" ` +
          `href="/${asset.fileName}" crossorigin>`
      )
    }

    html.source = html.source.replace(
      '</head>',
      `  ${tags.join('\n    ')}\n  </head>`
    )
  }
})
