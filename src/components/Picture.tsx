import type { ImgHTMLAttributes } from 'react'
import type { PictureData } from 'types/images'

type BaseProps = {
  alt: string
  /**
   * How wide the image will actually be laid out. Without this the browser
   * assumes `100vw` and picks a candidate far larger than it needs.
   */
  sizes: string
  className?: string
  /**
   * Marks the Largest Contentful Paint element: eager, `fetchpriority="high"`,
   * synchronous decode. **Exactly one image on the page may set this** — a
   * second high-priority image competes with the LCP request for bandwidth on
   * precisely the connections where it matters most.
   */
  priority?: boolean
  /**
   * Above the fold but not the LCP element. Loads eagerly — lazy-loading
   * something already in the viewport only delays it — but leaves fetch
   * priority at the browser's own judgement.
   */
  eager?: boolean
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'sizes' | 'alt' | 'loading'
>

type PictureProps = BaseProps & {
  /** Build-time generated sources — see `src/images.ts`. */
  picture: PictureData
  /**
   * Optional art direction: each entry is offered ahead of `picture` and is
   * chosen by the first matching media query, exactly as `<picture>` specifies.
   */
  media?: { media: string; picture: PictureData }[]
}

/**
 * The `<source>` elements for one `PictureData`. Exported for the few places
 * that must own the `<img>` themselves — for instance when it is animated and
 * therefore has to be a `motion.img`.
 */
export const sourcesFor = (
  { sources }: PictureData,
  sizes: string,
  media?: string
) =>
  (Object.keys(sources) as (keyof typeof sources)[]).map((format) => (
    <source
      key={`${media ?? ''}-${format}`}
      type={`image/${format}`}
      srcSet={sources[format]}
      sizes={sizes}
      media={media}
    />
  ))

/**
 * Renders a `<picture>` that offers AVIF and WebP ahead of the original format,
 * with width descriptors so the browser can pick a candidate that suits both the
 * viewport and the device pixel ratio.
 *
 * `width`/`height` are always emitted from the generated asset's intrinsic size,
 * which reserves the correct aspect ratio before the bytes arrive and keeps the
 * image from contributing to layout shift.
 */
export const Picture = ({
  picture,
  media,
  alt,
  sizes,
  className,
  priority = false,
  eager = false,
  ...imgProps
}: PictureProps) => {
  const { img } = picture

  return (
    // `display: contents` keeps the wrapper out of layout entirely, so the
    // <img> sizes against the real parent. Without it, utilities such as
    // `size-full` on the <img> would resolve against an inline, zero-sized
    // <picture> box.
    <picture className="contents">
      {media?.flatMap((entry) => sourcesFor(entry.picture, sizes, entry.media))}
      {sourcesFor(picture, sizes)}
      <img
        {...imgProps}
        src={img.src}
        sizes={sizes}
        width={img.w}
        height={img.h}
        alt={alt}
        className={className}
        loading={priority || eager ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  )
}

/**
 * CSS `image-set()` value, for the few decorative backgrounds that must stay
 * backgrounds because they rely on `background-attachment`, `background-repeat`
 * or `background-blend-mode`.
 *
 * Backgrounds cannot use width descriptors, so these assets are generated at a
 * single width and the browser only chooses a *format*. Order matters: the first
 * `type()` a browser can decode wins. Pair it with a plain `url()` fallback in
 * the same declaration block for engines without `image-set()`.
 */
export const imageSet = ({ sources }: PictureData): string =>
  `image-set(${(Object.keys(sources) as (keyof typeof sources)[])
    .map((format) => {
      const largest = sources[format]!.split(',').pop()!.trim().split(' ')[0]
      return `url("${largest}") type("image/${format}")`
    })
    .join(', ')})`
