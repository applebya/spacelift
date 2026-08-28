/**
 * `sizes` attributes for every responsive image on the page.
 *
 * These live in their own module, free of image imports, because
 * `vite.config.ts` needs `hero` too: the preload tag the build injects carries
 * an `imagesizes` attribute that **must** match the one the rendered `<img>`
 * uses, or the browser preloads one candidate and then requests a different
 * one. Duplicating the string in two files was an invitation to let them drift.
 *
 * Each value has to agree with the widths generated for it in `src/images.ts`
 * and with the actual Tailwind layout in `src/components/sections/`. Getting it
 * wrong is silent: the page still renders, it just downloads the wrong file.
 * The values below were verified by measuring the rendered element across
 * viewports rather than read off the class names.
 */

export const SIZES = {
  /**
   * Hero photograph.
   *
   * Full width below `md`. From `md` it shares a flex row with the text column,
   * which is `md:flex-[2] xl:flex-1` — so the photograph is **one third** of the
   * viewport from 768px to 1279px, and one half from 1280px up. Measured at
   * 768/900/1024/1279/1280/1440/1920, it is 29/33/33/33/50/50/50 %; 34vw covers
   * the middle band with a small margin.
   */
  hero: '(min-width: 1280px) 50vw, (min-width: 768px) 34vw, 100vw',

  /**
   * The four captioned galleries sit in a `max-w-6xl` (1152px) two-column grid
   * with a 96px gutter and 48px of page padding from `sm` up.
   */
  gallery:
    '(min-width: 1248px) 528px, (min-width: 768px) calc((100vw - 144px) / 2), 100vw',

  /** The "Any Space" gallery spans the full `max-w-6xl` container. */
  galleryWide: '(min-width: 1152px) 1152px, 100vw',

  /** Full-bleed section backgrounds. */
  fullBleed: '100vw',

  /** Contact form photograph: one third of the split, desktop only. */
  contact: '(min-width: 768px) 34vw, 0px',

  /** Cut-out couch illustration, sized by height in the About section. */
  couch: '(min-width: 768px) 640px, 526px',

  /** Founder signature, capped at 128px tall. */
  signature: '456px',

  /** Wordmark: 420px at rest on desktop, 200px on mobile. */
  logo: '(min-width: 768px) 420px, 200px'
} as const
