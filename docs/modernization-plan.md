# Spacelift.online — 2026 Modernization Plan

Derived from [`modernization-baseline.md`](./modernization-baseline.md).
Findings are classified by what they cost the business, not by how interesting they are.

**The governing fact:** a first visit on a phone over a normal mobile connection transfers
**13.17 MB** and does not reach Largest Contentful Paint for **45 seconds**. Everything in
P0 exists to fix that. Nothing else on this list matters as much.

---

## P0 — must fix

### P0-1 · Mobile page weight and LCP
*13.17 MB / 45.6 s LCP on production mobile.*

Four independent causes, all fixable:

1. **All 40 gallery photographs load eagerly.** 39 of them are off-screen. → `loading="lazy"`
   on everything below the fold; never on the hero.
2. **Density-only `srcSet`.** `srcSet="{1x} 1x, {2x} 2x"` gives the browser no way to
   consider layout width, so a 393 px phone fetches a 1286–2300 px image. → width (`w`)
   descriptors plus an accurate `sizes` attribute.
3. **JPEG only.** `imagetools` emits no AVIF or WebP. → `<picture>` with AVIF → WebP → JPEG.
4. **The LCP element is a CSS `background-image`.** It is discovered late and cannot carry
   `fetchpriority`. → render the hero as a real `<img>` with `fetchpriority="high"`,
   `decoding="async"`, and no lazy attribute.

### P0-2 · Quality gates are red
`pnpm test` fails on an untouched boilerplate test asserting a "Welcome!" heading that has
never existed on this site. `pnpm run lint` fails on 5 warnings under `--max-warnings=0`.
A repository whose gates are red has no regression safety net — and this engagement is
about to change a great deal of code.

### P0-3 · Critical dependency advisories
3 critical + 34 high. All are build/test-time and none reach the browser, but "not exposed
today" is not the same as "resolved". Upgrade `vitest`/`happy-dom` past the RCE advisories
and refresh the toolchain, deliberately and one axis at a time — no `--force`.

### P0-4 · `/safari-pinned-tab.svg` 404s in production
`index.html` links an asset that has never existed in `public/`. Confirmed 404 on the live
site.

---

## P1 — in scope for this engagement

### Performance & assets
- **P1-1** Explicit `width`/`height` (or `aspect-ratio`) on the 69 `<img>` elements that
  have neither, to reserve space before decode.
- **P1-2** Convert the remaining CSS `background-image` section backgrounds
  (`couch`, `cta-bg`, `biography-bg`, `contact-bg`, `process/*-bg`) to responsive,
  format-negotiated assets. `couch.png` alone is **1.79 MB** — the single largest transfer
  on the page — and needs no alpha channel it cannot get from a JPEG/WebP.
- **P1-3** Font loading: add `preconnect` to `fonts.gstatic.com`, cut the requested Lato
  weights to those actually used, and load with `display=swap` (already present) plus a
  non-blocking strategy.
- **P1-4** Strip EXIF/ICC from generated derivatives.
- **P1-5** Remove `lodash`, `react-confetti`, `@responsive-image/core`,
  `@responsive-image/vite-plugin` from `dependencies`; remove `svgo` and
  `vite-plugin-image-optimizer` from `devDependencies`. None is imported anywhere.

### Correctness & QA
- **P1-6** Duplicate `<h1>` — render the tagline once.
- **P1-7** Add a `<main>` landmark.
- **P1-8** FAQ accordions: real `<button>` with `aria-expanded`/`aria-controls`, keyboard
  operable. Currently `tabIndex={-1}` makes them unreachable by keyboard entirely.
- **P1-9** Process step selectors: `<div tabIndex={0}>` → `<button>` with pressed state.
- **P1-10** Carousel "next" arrow logs `direction: 'previous'` to Analytics. Fix.
- **P1-11** 320 px: fixed logo overlaps the hero `<h1>`.
- **P1-12** Honour `prefers-reduced-motion` — the page runs ~20 scroll/viewport animations.
- **P1-13** Visible focus indicators on interactive elements.

### SEO / metadata
- **P1-14** Canonical URL (`https://spacelift.online/`), Open Graph, Twitter Card, and a
  real social share image.
- **P1-15** `sitemap.xml` + `Sitemap:` in `robots.txt`.
- **P1-16** Branded `404.html` (GitHub Pages serves its own default today).
- **P1-17** Remove the dead `msapplication-TileColor` meta and the placeholder
  `nonce="randomNonce"`; drop the `<meta http-equiv="X-Content-Type-Options">` that browsers
  ignore in favour of a real response header (see P1-21).

### Maintainability
- **P1-18** Split the 1,411-line `App.tsx` into per-section components plus a single
  declarative image manifest. This is the precondition for doing the image work without
  hand-editing forty near-identical import lines.
- **P1-19** Replace the stale boilerplate test with focused tests covering the areas this
  engagement changes: image loading attributes, FAQ keyboard behaviour, heading structure.
- **P1-20** Rewrite `README.md` for this project; delete `src/assets/_OLD/` and
  `src/assets/spaces/_Removed Photos/` (28 unused files, 220 MB) and the four unused
  root-level PNGs. Fix `predeploy`'s `npm` → `pnpm`. Delete the stale root `CNAME`.

### Infrastructure
- **P1-21** Security headers. GitHub Pages cannot set response headers at all, so this
  requires an edge. See [`hosting-architecture-decision.md`](./hosting-architecture-decision.md).
- **P1-22** Cache policy. GitHub Pages serves `cache-control: max-age=600` for *everything*,
  including content-hashed immutable assets, and offers **gzip only — no Brotli, no HTTP/3**
  (verified). An edge fixes both.
- **P1-23** GitHub Actions deploy workflow replacing the manual `gh-pages` push, gated on
  typecheck + lint + test. Removes "it built on my laptop" from the release path.

---

## P2 — if time permits

- **P2-1** Code-split `motion`; ~104 kB gzip in one chunk for a static marketing page.
- **P2-2** ESLint 9 flat-config migration.
- **P2-3** Self-host fonts (removes a third-party origin from the critical path entirely).
- **P2-4** Downscale the 499 MB of source originals to sane archival masters
  (e.g. long edge 3000 px), keeping originals outside the repo.
- **P2-5** `LocalBusiness` structured data — genuinely applicable to this business.

## P3 — explicitly out of scope

- Migrating hosting to Cloudflare Pages or Workers (evaluated and rejected — see ADR).
- Any paid image transformation service.
- Tailwind v4 migration.
- Rebuilding on a meta-framework (Astro/Next) for prerendering.
- Redesign of the visual identity.
- Spam protection on the contact form (reCAPTCHA groundwork exists, commented out) —
  a product decision for the owner, not a modernization task.

---

## Sequencing

1. Green the gates (P0-2, P0-3) so later changes are verifiable.
2. Restructure `App.tsx` (P1-18) — nothing else in the image work is tractable without it.
3. Image pipeline (P0-1, P1-1, P1-2, P1-4).
4. Correctness, a11y, SEO (P0-4, P1-6…P1-17).
5. Dependency pruning and repo hygiene (P1-5, P1-20).
6. Deployment and edge (P1-23, P1-21, P1-22) — DNS is the only step requiring approval.
7. Re-measure with the identical harness; compare.
