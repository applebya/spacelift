/**
 * Shape of the build-time image pipeline's output (`vite-imagetools`).
 *
 * Every photographic asset is imported with `&as=picture`, which yields one
 * `srcset` string per generated format plus the largest fallback — the latter
 * supplies both the `<img>` element's `src` and, crucially, its intrinsic
 * `width`/`height`.
 */

/** Keys are MIME subtypes, so `image/${key}` is always a valid `type`. */
export type PictureFormat = 'avif' | 'webp' | 'jpeg' | 'png'

export type PictureSources = Partial<Record<PictureFormat, string>>

export interface PictureData {
  sources: PictureSources
  img: { src: string; w: number; h: number }
}
