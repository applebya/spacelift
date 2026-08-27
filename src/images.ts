/**
 * Central image manifest.
 *
 * Every photographic asset in the site is declared here once, with the widths it
 * will actually be displayed at. `vite-imagetools` resizes and re-encodes at
 * build time; nothing is committed pre-optimized and nothing is hand-edited, so
 * regenerating from the originals is deterministic.
 *
 * ## Conventions
 *
 * - `format=avif;webp;<original>` — AVIF is offered first because at the quality
 *   used here it is both the smallest and the most faithful of the three (see
 *   `docs/modernization-results.md`). The original format survives as a fallback.
 * - `quality=50` for photographs. Measured against the source across several
 *   images, this is the point where AVIF stays smaller than WebP *and* has the
 *   lowest reconstruction error; pushing higher inverts that ordering and would
 *   make the AVIF candidate the most expensive one.
 * - `quality=88`, WebP only, for the logo and signature. These are flat line art
 *   with hard edges and a large transparent area: AVIF's alpha handling makes it
 *   *larger* than WebP here (81 kB vs 12 kB for the wordmark), so it is not
 *   offered for them.
 * - Widths are chosen from the element's real layout width across the supported
 *   viewport range, doubled once for high-DPR screens. They are not a
 *   combinatorial ladder.
 * - EXIF/ICC metadata is dropped by the encoder, which is the default and is
 *   what we want: the originals carry full camera metadata.
 *
 * The matching `sizes` attribute for each group lives in `SIZES` below, next to
 * the widths it has to agree with. If one changes, the other must.
 */

import type { PictureData } from 'types/images'

/* -------------------------------------------------------------------------- */
/* sizes                                                                       */
/* -------------------------------------------------------------------------- */

export const SIZES = {
  /**
   * Hero photograph. Full width below `md`, the right-hand half of the split
   * layout above it.
   */
  hero: '(min-width: 768px) 50vw, 100vw',

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

/* -------------------------------------------------------------------------- */
/* directive presets                                                           */
/* -------------------------------------------------------------------------- */

// Kept as literal strings rather than composed at runtime: imagetools parses the
// import specifier statically, so the query must be visible in the import.

/* -------------------------------------------------------------------------- */
/* hero                                                                        */
/* -------------------------------------------------------------------------- */

export { default as hero } from 'assets/hero-1.jpg?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'

/* -------------------------------------------------------------------------- */
/* brand marks and line art                                                    */
/* -------------------------------------------------------------------------- */

export { default as logo } from 'assets/spacelift-logo-transparent.png?format=webp;png&w=240;420;840&quality=88&as=picture'
export { default as logoWatermark } from 'assets/spacelift-logo-transparent.png?format=webp;png&w=1200&quality=80&as=picture'
export { default as signature } from 'assets/rosemarie-root.png?format=webp;png&w=456;912&quality=88&as=picture'

export { default as check } from 'assets/icons/check.png'
export { default as facebook } from 'assets/icons/facebook.svg'
export { default as instagram } from 'assets/icons/instagram.svg'
export { default as arrowDown } from 'assets/icons/arrow-down.svg'
export { default as star } from 'assets/icons/star.svg'

/* -------------------------------------------------------------------------- */
/* about section                                                               */
/* -------------------------------------------------------------------------- */

export { default as couch } from 'assets/couch.png?format=avif;webp;png&w=400;640;900&quality=45&as=picture'
// Two decorative backgrounds stay as CSS backgrounds: a 5px gradient strip that
// stretches across the section, and a fixed-attachment island watermark.
export { default as couchBg } from 'assets/couch-bg.png'
// Displayed at a fixed 450px height (about 1060px wide) as a background, so
// it is generated once at 2x that width — backgrounds cannot use `sizes`.
export { default as vanIsle } from 'assets/van-isle.png?format=avif;webp;png&w=2120&quality=60&as=picture'

/* -------------------------------------------------------------------------- */
/* process                                                                     */
/* -------------------------------------------------------------------------- */

export { default as clean } from 'assets/process/clean.png?format=webp;png&w=160&quality=90&as=picture'
export { default as declutter } from 'assets/process/declutter.png?format=webp;png&w=160&quality=90&as=picture'
export { default as paint } from 'assets/process/paint.png?format=webp;png&w=160&quality=90&as=picture'
export { default as merchandise } from 'assets/process/merchandise.png?format=webp;png&w=160&quality=90&as=picture'
export { default as stage } from 'assets/process/stage.png?format=webp;png&w=160&quality=90&as=picture'
export { default as organize } from 'assets/process/organize.png?format=webp;png&w=160&quality=90&as=picture'

export { default as cleanBg } from 'assets/process/clean-bg.jpg?format=avif;webp;jpg&w=640;1024;1600;2048&quality=50&as=picture'
export { default as declutterBg } from 'assets/process/declutter-bg.jpg?format=avif;webp;jpg&w=640;1024;1600;2048&quality=50&as=picture'
export { default as paintBg } from 'assets/process/paint-bg.jpg?format=avif;webp;jpg&w=640;1024;1600;2048&quality=50&as=picture'
export { default as merchandiseBg } from 'assets/process/merchandise-bg.jpg?format=avif;webp;jpg&w=640;1024;1600;2048&quality=50&as=picture'
export { default as stageBg } from 'assets/process/stage-bg.jpg?format=avif;webp;jpg&w=640;1024;1600;2048&quality=50&as=picture'
export { default as organizeBg } from 'assets/process/organize-bg.jpg?format=avif;webp;jpg&w=640;1024;1600;2048&quality=50&as=picture'

/* -------------------------------------------------------------------------- */
/* other section backgrounds                                                   */
/* -------------------------------------------------------------------------- */

export { default as ctaBg } from 'assets/cta-bg.jpg?format=avif;webp;jpg&w=640;1024;1600&quality=50&as=picture'
export { default as biographyBg } from 'assets/biography-bg.jpg?format=avif;webp;jpg&w=1024;1600;2048&quality=50&as=picture'
export { default as biographyBgMobile } from 'assets/biography-bg-mobile.jpg?format=avif;webp;jpg&w=480;768;1024&quality=50&as=picture'
export { default as contactBg } from 'assets/contact-bg.jpg?format=avif;webp;jpg&w=400;640;900&quality=50&as=picture'

/* -------------------------------------------------------------------------- */
/* galleries                                                                   */
/* -------------------------------------------------------------------------- */

import homeSpace1 from 'assets/spaces/home-1.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace2 from 'assets/spaces/home-2.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace3 from 'assets/spaces/home-3.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace4 from 'assets/spaces/home-4.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace5 from 'assets/spaces/home-5.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace6 from 'assets/spaces/home-6.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace7 from 'assets/spaces/home-7.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import homeSpace8 from 'assets/spaces/home-8.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'

import businessSpace1 from 'assets/spaces/business-1.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import businessSpace2 from 'assets/spaces/business-2.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
// This original is stored rotated 90° from how it should be displayed.
import businessSpace3 from 'assets/spaces/business-3.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&rotate=90&as=picture'
import businessSpace4 from 'assets/spaces/business-4.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import businessSpace5 from 'assets/spaces/business-5.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import businessSpace6 from 'assets/spaces/business-6.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import businessSpace7 from 'assets/spaces/business-7.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import businessSpace8 from 'assets/spaces/business-8.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'

import realEstateSpace1 from 'assets/spaces/real-estate-1.png?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace2 from 'assets/spaces/real-estate-2.png?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace3 from 'assets/spaces/real-estate-3.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace4 from 'assets/spaces/real-estate-4.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace5 from 'assets/spaces/real-estate-5.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace6 from 'assets/spaces/real-estate-6.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace7 from 'assets/spaces/real-estate-7.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import realEstateSpace8 from 'assets/spaces/real-estate-8.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'

import storeDisplaysSpace1 from 'assets/spaces/store-displays-1.png?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace2 from 'assets/spaces/store-displays-2.png?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace3 from 'assets/spaces/store-displays-3.png?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace4 from 'assets/spaces/store-displays-4.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace5 from 'assets/spaces/store-displays-5.png?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace6 from 'assets/spaces/store-displays-6.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace7 from 'assets/spaces/store-displays-7.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'
import storeDisplaysSpace8 from 'assets/spaces/store-displays-8.jpg?format=avif;webp;jpg&w=400;560;800;1120&quality=50&as=picture'

import anySpace1 from 'assets/spaces/any-space-1.jpg?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace2 from 'assets/spaces/any-space-2.png?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace3 from 'assets/spaces/any-space-3.png?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace4 from 'assets/spaces/any-space-4.jpg?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace5 from 'assets/spaces/any-space-5.png?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace6 from 'assets/spaces/any-space-6.jpg?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace7 from 'assets/spaces/any-space-7.jpg?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'
import anySpace8 from 'assets/spaces/any-space-8.jpg?format=avif;webp;jpg&w=640;960;1280;1920&quality=50&as=picture'

export const galleries: Record<string, PictureData[]> = {
  home: [
    homeSpace1,
    homeSpace2,
    homeSpace3,
    homeSpace4,
    homeSpace5,
    homeSpace6,
    homeSpace7,
    homeSpace8
  ],
  business: [
    businessSpace1,
    businessSpace2,
    businessSpace3,
    businessSpace4,
    businessSpace5,
    businessSpace6,
    businessSpace7,
    businessSpace8
  ],
  realEstate: [
    realEstateSpace1,
    realEstateSpace2,
    realEstateSpace3,
    realEstateSpace4,
    realEstateSpace5,
    realEstateSpace6,
    realEstateSpace7,
    realEstateSpace8
  ],
  storeDisplays: [
    storeDisplaysSpace1,
    storeDisplaysSpace2,
    storeDisplaysSpace3,
    storeDisplaysSpace4,
    storeDisplaysSpace5,
    storeDisplaysSpace6,
    storeDisplaysSpace7,
    storeDisplaysSpace8
  ],
  anySpace: [
    anySpace1,
    anySpace2,
    anySpace3,
    anySpace4,
    anySpace5,
    anySpace6,
    anySpace7,
    anySpace8
  ]
}
