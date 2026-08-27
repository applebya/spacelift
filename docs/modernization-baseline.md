# Spacelift.online — Modernization Baseline

**Captured:** 2026-08-27
**Branch point:** `main` @ `df71777` ("add google analytics events", 2025-04-16)
**Production at time of capture:** identical to `main` — the locally built bundle hash
(`index-DL5kc3Ut.js`) matches the asset served by `https://spacelift.online`, confirming
production is a faithful build of this commit.

---

## 1. Architecture

| Item | Value |
|---|---|
| Type | Single-page static marketing site (one route, anchor-scrolled sections) |
| Framework | React 18.3.1 (`react-dom/client`, no router) |
| Build | Vite 5.4.11 + `@vitejs/plugin-react-swc` |
| Styling | Tailwind CSS 3.4.15 + PostCSS/autoprefixer + one hand-written `App.css` |
| Images | `vite-imagetools` 7.0.5 (build-time, `sharp`) |
| Animation | `motion` 11.15.0 (Framer Motion successor) |
| Language | TypeScript 5.6.3, `strict: true` |
| Package manager | pnpm (lockfile v9); several scripts hardcode `npm` |
| Tests | Vitest 1.6.0 + Testing Library + happy-dom |
| Lint | ESLint 8.57.1 (legacy `.eslintrc`) + Prettier + `eslint-plugin-tailwindcss` |
| Source layout | Entire site is one 1,411-line `src/components/App.tsx` |

## 2. Deployment (as-is)

```
developer laptop
  └─ pnpm run deploy   (predeploy → tsc && vite build; postbuild → echo CNAME)
       └─ gh-pages -d dist        # force-pushes dist/ to gh-pages branch
            └─ github.com/applebya/spacelift  (gh-pages branch, legacy Pages build)
                 └─ spacelift.online
```

- **No CI/CD.** `.github/` contains only issue templates. Deployment is a manual local
  command; nothing verifies typecheck/lint/tests before publish.
- **GitHub Pages:** source `gh-pages` branch, `build_type: legacy`, `https_enforced: true`,
  cert covers apex + `www` (expires 2026-10-26).
- **DNS:** GoDaddy authoritative (`ns25/ns26.domaincontrol.com`).
  - `spacelift.online` → A `185.199.108–111.153` (GitHub Pages) — **canonical host, serves 200**
  - `www.spacelift.online` → CNAME `applebya-wm.github.io` → 301 to apex
- **Repository visibility: PUBLIC** (`gh api repos/applebya/spacelift` → `"private": false`).
  This contradicts the assumption that the repo is private; flagged for the owner.

### Production response headers (apex, 2026-08-27)

```
strict-transport-security: max-age=31556952      # no includeSubDomains / preload
cache-control: max-age=600                       # applied to HTML *and* hashed assets
access-control-allow-origin: *
```
Absent: `content-security-policy`, `x-frame-options` / `frame-ancestors`,
`x-content-type-options`, `referrer-policy`, `permissions-policy`.
GitHub Pages does not permit custom response headers.

## 3. Build output (baseline)

```
dist/  17 MB total, 115 files
  jpeg   92 files   13.92 MB
  png    15 files    2.19 MB
  js      1 file      311.3 kB raw / 104.3 kB gzip / 91.5 kB brotli
  css     1 file       23.4 kB raw /   5.2 kB gzip /  4.5 kB brotli
  html    1 file        2.4 kB
```

No code splitting (single chunk). No modern image formats emitted — `imagetools` is
configured to output **JPEG only**; no WebP, no AVIF.

## 4. Measured page performance

Method: Playwright + Chromium 151, `PerformanceObserver` for LCP/CLS,
Resource Timing for byte accounting.
Mobile profile = Pixel 5 (393×851, DPR 2), Slow-4G (1.6 Mbps / 150 ms RTT), 4× CPU throttle.
Desktop profile = 1440×900, DPR 1, unthrottled.

| Metric | Production (mobile) | Local dist (mobile) | Local dist (desktop) |
|---|---|---|---|
| **LCP** | **45.6 s** | 11.6 s | 0.20 s |
| FCP | 1.71 s | 1.55 s | 0.17 s |
| **CLS** | 0.028 | 0.029 | 0.008 |
| `load` event | 67.9 s | 67.8 s | 0.25 s |
| **Total transfer** | **13.17 MB** | 13.17 MB | 6.78 MB |
| Requests | 66 | 66 | 67 |
| Image requests | 60 (13.37 MB) | 60 (13.37 MB) | 61 (6.83 MB) |
| DOM nodes | 430 | 430 | 430 |

The desktop-vs-mobile gap is not a rendering difference: a DPR-2 device selects the `2x`
entry of every `srcSet`, so **mobile downloads roughly twice the bytes of desktop** —
the opposite of the intended behaviour.

LCP element in both profiles is a `<div>` whose hero photograph is a CSS
`background-image`. Background images cannot carry `fetchpriority`, are discovered only
after CSS+JS parse, and are not preloadable without an explicit hint — none is present.

### Largest transfers on first load (mobile)

| Bytes | Asset |
|---|---|
| 1793 kB | `couch-*.png` (PNG, 1600×1127 source, decorative section background) |
| 1092 kB | `any-space-8` @2x |
| 647 kB | `any-space-1` @2x |
| 623 kB | `any-space-7` @2x |
| 421 kB | `any-space-6` @2x |
| 404 kB | `store-displays-2` @2x |

## 5. Image footprint

**Repository source images: 499 MB across 63 active files**, plus 220 MB in
`src/assets/_OLD/` and `src/assets/spaces/_Removed Photos/` (28 files) that nothing imports.
Total tracked image weight ≈ **714 MB**.

Largest sources (all full-resolution camera originals, EXIF intact):

| Size | Dimensions | File |
|---|---|---|
| 37.8 MB | 7008×4672 | `spaces/business-8.jpg` |
| 35.9 MB | 6252×4173 | `spaces/any-space-8.jpg` |
| 27.4 MB | 7952×5304 | `spaces/store-displays-8.jpg` |
| 24.7 MB | 7952×4990 | `spaces/any-space-1.jpg` |
| 21.4 MB | 7773×5185 | `spaces/business-6.jpg` |
| 15.9 MB | 8193×6144 | `spaces/store-displays-3.png` (PNG, alpha present but unused visually) |
| 14.5 MB | 8660×5773 | `process/declutter-bg.jpg` |

Observations:
- 42-megapixel sources are resized at build time, so the *shipped* bytes are far smaller
  than the sources — but every build re-decodes ~500 MB, and clones are ~714 MB.
- 21 PNGs; 14 carry an alpha channel. Only the logo, signature, check icon, `van-isle`
  and the six 200×200 process icons genuinely need transparency.
- Every JPEG source retains EXIF/ICC metadata.
- 7 PNGs have **no** alpha channel and are stored as PNG unnecessarily.

### How images are currently requested

- **Gallery carousels** (`<Space>`, 5 carousels × 8 photos = 40 images): rendered as
  `<img src={1x} srcSet="{1x} 1x, {2x} 2x">`. Density (`x`) descriptors only — no `sizes`,
  no `w` descriptors — so the browser **cannot** account for the element's actual layout
  width. A 393 px-wide phone at DPR 2 fetches the 1286 px (and for "Any Space", the
  2300 px) variant.
- **None of the 40 gallery images carry `loading="lazy"`.** All 40 are fetched on first
  load even though 39 of them are off-screen or off-carousel.
- **Six `process/*-bg.jpg` backgrounds** are `<img>` at `?w=2000`, single width, eager.
- **Section backgrounds** (`hero`, `couch`, `couch-bg`, `van-isle`, `cta-bg`,
  `biography-bg`, `biography-bg-mobile`, `contact-bg`) are CSS `background-image` URLs in
  inline `style` attributes — no responsive selection, no priority hints.
- **69 of 91 `<img>` elements have neither `width` nor `height`**, so aspect ratio is not
  reserved before decode.
- Only 6 images use `loading="lazy"` (the 200×200 process icons — the least valuable case).

## 6. Dependency & security audit

`pnpm audit` — **65 advisories: 3 critical, 34 high, 24 moderate, 4 low.**

Critical:

| Package | Path | Note |
|---|---|---|
| `happy-dom` <20.0.0 | direct devDep + via vitest | VM context escape → RCE |
| `vitest` <1.6.1 | direct devDep | RCE via malicious site while API server listening |
| `vitest` <3.2.6 | direct devDep | arbitrary file read/exec via UI server |

**All three criticals are test-time only and never reach the browser.** The same is true
of every high: they sit under `eslint`, `@typescript-eslint`, `tailwindcss`→`sucrase`,
`svgo`, `rollup`, `vite`, `postcss`, `sharp` — build/dev tooling.

The one advisory touching a *production* `dependencies` entry is
`lodash <=4.17.23` (code injection via `_.template`) — **but `lodash` is imported nowhere
in `src/`**; it is dead weight in the shipped dependency set.

### Other security observations

- No secrets in the tree. The Google Analytics measurement ID (`G-TJLXHJRQYT`) and the
  Formcarry endpoint (`https://formcarry.com/s/VhZHRRwdqzu`) are public-by-design
  identifiers, correctly so.
- `index.html` carries `<script nonce="randomNonce">` — a literal placeholder with no CSP
  to consume it. Meaningless; misleading.
- `<meta http-equiv="X-Content-Type-Options" content="nosniff">` — this header is
  **ignored** when delivered via `<meta>`; it only works as a real response header.
- Third-party origins loaded: `googletagmanager.com`, `google-analytics.com`,
  `fonts.googleapis.com`, `fonts.gstatic.com`, `formcarry.com`. All over HTTPS; no mixed
  content.
- All external links correctly use `target="_blank" rel="noreferrer"`.
- Commented-out reCAPTCHA site key left in `index.html`.
- Contact form posts directly to Formcarry with no client-side spam mitigation.

## 7. Unused / dead code and assets

Declared but referenced nowhere in `src/`:

| Package | Type | Notes |
|---|---|---|
| `lodash` + `@types/lodash` | **dependency** | ships in the dependency graph; carries a high advisory |
| `react-confetti` | **dependency** | never imported |
| `@responsive-image/core` | **dependency** | never imported; pulls its own `vite`/`rollup`/`sharp` |
| `@responsive-image/vite-plugin` | **dependency** | not registered in `vite.config.ts` |
| `svgo` | devDependency | not wired into any script or plugin |
| `vite-plugin-image-optimizer` | devDependency | not registered in `vite.config.ts` |
| `sharp` | devDependency | only used transitively by `vite-imagetools` |

Unused files: `src/favicon-original.png`, `src/favicon-original-2.png`,
`src/favicon-original-3.png`, `src/spacelift-logo-transparent2.png`,
`src/assets/_OLD/` (11 files, 108 MB), `src/assets/spaces/_Removed Photos/` (17 files, 107 MB).

Unused CSS classes in `App.css`: `.pad`, `.pad-left`, `.pad-right`.

## 8. Build & quality gate status

| Gate | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ clean |
| `pnpm run typecheck` | ✅ clean |
| `pnpm run lint` | ❌ **fails** — 5 warnings, `--max-warnings=0` |
| `pnpm test` | ❌ **fails** — the single test file is untouched boilerplate asserting a "Welcome!" heading that has never existed on this site |
| `pnpm run build` | ✅ succeeds, no warnings |

Lint warnings: 4× `tailwindcss/migration-from-tailwind-2` (`bg-opacity-*`),
1× `react-hooks/exhaustive-deps`.

## 9. Functional / QA findings

Verified in Chromium at 320, 390, 768, 1440 and 1920 px.

- ✅ No horizontal overflow at any tested viewport.
- ✅ All five form controls are correctly label-associated.
- ✅ All `<img>` elements have an `alt` attribute.
- ✅ All external links carry `rel="noreferrer"`.
- ❌ **Two `<h1>` elements** with identical text — the tagline is rendered twice
  (mobile copy + desktop copy) rather than once and repositioned.
- ❌ **No `<main>` landmark**; the page has header/nav/footer but no main region.
- ❌ **FAQ accordions are not keyboard operable.** Each question is an
  `<h3 tabIndex={-1} onClick>` — `-1` removes it from tab order, there is no
  `role="button"`, no `aria-expanded`, and no key handler.
- ❌ **Process step selectors** are `<div tabIndex={0} onClick onKeyDown>` rather than
  `<button>`; no `aria-pressed`/`aria-selected` state is exposed.
- ❌ **Analytics bug:** the carousel "next" button reports
  `trackEvent('click-image-arrow', { direction: 'previous' })` — both arrows log
  `previous`, so the event data is unusable.
- ❌ **`/safari-pinned-tab.svg` returns 404** in production; `index.html` links it.
- ❌ `<meta name="msapplication-TileColor">` present with no `browserconfig.xml`.
- ❌ **No canonical URL**, no Open Graph tags, no Twitter Card, no social share image.
- ❌ **No `sitemap.xml`**; `robots.txt` has no `Sitemap:` directive.
- ❌ **No custom `404.html`** — unknown paths render GitHub's default 404, not the brand.
- ❌ Root `CNAME` file says `www.spacelift.online` while `postbuild` writes
  `spacelift.online` into `dist/`. The root file is stale and contradicts production.
- ❌ At 320 px the fixed logo overlaps the hero `<h1>`.
- ❌ Google Fonts stylesheet is render-blocking with no `preconnect` to
  `fonts.gstatic.com`; five weights of Lato plus the full Besley variable range are
  requested, far more than the page uses.
- ❌ `predeploy` runs `npm run build` in a pnpm repository.
- ❌ `README.md` is the unmodified upstream boilerplate README; it documents a template,
  not this site.

## 10. Environment limitations

- Lighthouse was **not** used. Scores from a throttled CI-less laptop are not reproducible
  enough to quote as client-facing numbers. Instead, LCP/CLS/FCP and byte accounting were
  measured directly via `PerformanceObserver` and Resource Timing under a fixed, documented
  emulation profile, and the identical harness will be re-run after the work for a
  like-for-like comparison.
- INP was not measured: the page has no input-driven work heavy enough to sample
  meaningfully in an automated pass. Interaction cost is instead assessed structurally
  (main-thread JS size, animation count).
- Safari-specific behaviour was reasoned about from source (e.g. `background-attachment:
  fixed`, which iOS Safari does not honour) rather than measured; no Safari automation is
  available in this environment.
