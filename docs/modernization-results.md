# Spacelift.online — 2026 Modernization Results

**Branch:** `modernize-2026` (12 commits off `main` @ `df71777`)
**Completed:** 2026-08-27

---

## Summary

A first visit to spacelift.online on a phone transferred **13.17 MB** and did
not reach Largest Contentful Paint for **45.6 seconds**. It now transfers
**0.88 MB** and reaches LCP in **1.85 s**.

Getting there meant fixing four independent causes rather than one, and the work
around it — a red test suite, 65 dependency advisories, an FAQ that no keyboard
user could open, a manual deploy with no gate in front of it — turned out to
matter as much as the headline number.

|                        | Before                             | After                                                  |                   |
| ---------------------- | ---------------------------------- | ------------------------------------------------------ | ----------------- |
| **Transfer (mobile)**  | 13.17 MB                           | **0.88 MB**                                            | −93%              |
| **LCP (mobile)**       | 45.6 s¹                            | **1.85 s**                                             | target < 2.5 s ✅ |
| **CLS (mobile)**       | 0.028                              | **0.0003**                                             | target < 0.1 ✅   |
| **Transfer (desktop)** | 6.78 MB                            | **0.87 MB**                                            | −87%              |
| **LCP (desktop)**      | 0.20 s                             | **0.08 s**                                             | ✅                |
| Requests               | 66                                 | 42                                                     |                   |
| Image bytes            | 13.06 MB / 60 reqs                 | **0.66 MB / 32 reqs**                                  | −95%              |
| Dependency advisories  | 3 critical, 34 high, 24 mod, 4 low | **0**                                                  |                   |
| `pnpm test`            | ✗ fails (1 stale test)             | ✓ **14 pass**                                          |                   |
| `pnpm lint`            | ✗ fails (5 warnings)               | ✓ passes                                               |                   |
| Deploy gate            | none                               | typecheck + lint + format + tests + audit + link check |                   |

¹ Production, over the network. The same build served locally measured 11.6 s;
the difference is real-world latency on 60 image requests. Both are cited in
`modernization-baseline.md`.

**Method.** Playwright + Chromium 151. LCP and CLS from `PerformanceObserver`,
byte accounting from Resource Timing. Mobile profile: Pixel 5 (393×851, DPR 2),
Slow-4G (1.6 Mbps, 150 ms RTT), 4× CPU throttle, median of three runs. Desktop:
1440×900, DPR 1, unthrottled. Before and after use the identical harness and the
identical gzip-serving preview server, so the numbers are comparable. Lighthouse
was deliberately not used — see _Known limitations_.

---

## What was done

### 1. Image delivery

Four separate defects, all of which had to go:

| Defect                                                                                                                                                         | Fix                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| All 40 gallery photographs loaded eagerly; 39 are off-screen                                                                                                   | `loading="lazy"` on everything below the fold, explicitly **not** on the hero                                   |
| `srcset` used density descriptors only (`1x`/`2x`), so a 390 px phone at DPR 2 fetched a 1286 px — in the wide gallery, 2300 px — candidate for a ~350 px slot | Width (`w`) descriptors plus a `sizes` attribute derived from each element's real layout width                  |
| JPEG only                                                                                                                                                      | `<picture>` offering AVIF → WebP → original format                                                              |
| The LCP element was a `<div>` with a CSS `background-image` — discovered late, cannot carry `fetchpriority`, cannot be preloaded                               | A real `<img>` with `fetchpriority="high"`, plus a build-injected `<link rel="preload" as="image" imagesrcset>` |

**On quality.** Encoder quality is 50 across all three formats. That is not a
guess: encoding several source images at 45/50/55/60 and measuring both file
size and mean absolute error against the source showed that at 50, AVIF is
simultaneously the smallest _and_ the most faithful of the three. Above it the
ordering inverts — at quality 72, AVIF is 40% **larger** than WebP — which would
make the format offered first the most expensive one.

The wordmark and signature are the exception: flat line art with large
transparent areas, where AVIF's alpha handling produced an **81 kB** file
against WebP's 12 kB. They ship as WebP with a PNG fallback and no AVIF.

**On the preload.** The site is client-rendered, so nothing it references is
visible to the browser's preload scanner; the hero was only requested after the
bundle had downloaded, parsed and executed. `tools/vite-plugin-preload-critical.ts`
emits the preload tags into the built HTML, recovering each variant's true pixel
width by **decoding the emitted asset** rather than parsing content-hashed
filenames — so the generated `imagesrcset` stays correct however the pipeline is
configured.

**Reproducibility.** No image is committed pre-optimized and none is hand-edited.
`src/images.ts` declares every asset once with its display widths; the build
regenerates all 645 variants from the originals. A cold build takes ~51 s; after
that `vite-imagetools` caches by content hash and rebuilds take ~1 s.

### 2. Fonts

Besley and Lato moved from a render-blocking `fonts.googleapis.com` stylesheet to
self-hosting: latin subset only, only the weights the site renders, 124 kB across
five woff2 files, fingerprinted and immutably cacheable. Two DNS lookups and TLS
handshakes leave the critical path, and visitors' IPs stop going to a third party.

More importantly, `Besley Fallback` and `Lato Fallback` were added — local system
faces carrying `size-adjust`, `ascent-override` and `descent-override` measured
in Chromium against the real fonts. Besley sets **21% wider than Times New
Roman**, so when the webfont replaced the fallback the hero heading re-wrapped
and pushed everything below it down: a single **0.131** layout shift that was the
entire page's CLS. With the overrides, CLS is 0.0003.

Incidentally: the old request asked for Lato 200 and 900. Lato has no 200 weight,
and nothing on the site uses 900, so `font-thin` and `font-extralight` were
already resolving to the 300 face. That behaviour is preserved exactly.

### 3. Security

`pnpm audit`: **65 advisories → 0.**

- ESLint 8 → 10 with a flat config, plus typescript-eslint 8 and
  eslint-plugin-react-hooks 7. That alone cleared the
  minimatch/brace-expansion/flatted/js-yaml chain ESLint 8 dragged in.
- Vitest 1 → 4 and happy-dom 15 → 20 cleared all three criticals (two Vitest
  RCEs and a happy-dom VM context escape).
- The residual 16 highs were transitive DoS/ReDoS findings in build-time glob and
  pattern libraries, reachable only through `tailwindcss@3 → sucrase`,
  `eslint-plugin-react`, `gh-pages` and `vite-imagetools`. Resolved with pnpm
  overrides pinning each to the patched release **within its existing major**, so
  no consumer sees an API change. No `--force`, no uncontrolled major upgrades.

Every advisory was triaged individually for whether it reached a browser. None
did — the only one touching a production `dependencies` entry was `lodash`, which
was imported nowhere and has been removed.

Also: `trackEvent('submit_form', formData)` was sending the visitor's **name,
email, phone number and free-text message to Google Analytics** as event
parameters. The payload is gone; the event remains.

Response headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `frame-ancestors`) are written and **verified** but not yet
live — GitHub Pages cannot set headers, so they require the Cloudflare edge. See
_Not yet live_ below.

### 4. Bugs fixed

|                                                                                                                                                       |                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Two `<h1>` elements** with identical text                                                                                                           | Tagline rendered once; the two visible copies (mobile/desktop layouts) are presentational                                                                                                                                                    |
| **FAQ unreachable by keyboard** — questions were `<h3 tabIndex={-1} onClick>`, and a negative tabindex removes an element from the tab order entirely | `<button>` inside the heading, with `aria-expanded`/`aria-controls`                                                                                                                                                                          |
| Process selectors were `<div tabIndex={0}>` wrapping an `<h3>` — a heading nested inside a control                                                    | `<button>` with `aria-pressed`                                                                                                                                                                                                               |
| Carousel **"next" arrow reported `direction: 'previous'`** to Analytics, making the event data unusable                                               | Fixed                                                                                                                                                                                                                                        |
| **`/safari-pinned-tab.svg` 404'd in production**, linked from `index.html` since March                                                                | Link removed                                                                                                                                                                                                                                 |
| At **320 px the fixed logo overlapped the hero heading**                                                                                              | Heading scales down below `sm`; logo height reduced                                                                                                                                                                                          |
| 69 of 91 images had **no `width`/`height`**                                                                                                           | All 96 now do                                                                                                                                                                                                                                |
| `<h5>` nested under `<h3>` in an FAQ answer — skipped heading level                                                                                   | `<p class="font-bold">`                                                                                                                                                                                                                      |
| No `<main>` landmark                                                                                                                                  | Added                                                                                                                                                                                                                                        |
| `prefers-reduced-motion` ignored by ~20 animations                                                                                                    | `MotionConfig reducedMotion="user"`, and `marginLeft`/`marginTop` animations converted to transforms — Motion only suppresses transforms, which is why the config alone was not enough. Animating margin also forced a layout on every frame |
| No visible focus indicator                                                                                                                            | `focus-visible` ring on every interactive element                                                                                                                                                                                            |
| Process carousel could compute an index one past the last step and select `undefined`                                                                 | Clamped                                                                                                                                                                                                                                      |
| `NodeJS.Timeout` referenced in browser code                                                                                                           | `ReturnType<typeof setTimeout>`                                                                                                                                                                                                              |
| `predeploy` ran `npm run build` in a pnpm repository                                                                                                  | Fixed                                                                                                                                                                                                                                        |
| Root `CNAME` said `www.spacelift.online`; the build writes `spacelift.online`, and production confirms the apex is canonical                          | Stale file deleted                                                                                                                                                                                                                           |
| `<meta http-equiv="X-Content-Type-Options">` — ignored by browsers in that form                                                                       | Removed; set as a real header at the edge                                                                                                                                                                                                    |
| `<script nonce="randomNonce">` — a placeholder with no CSP to consume it                                                                              | Removed                                                                                                                                                                                                                                      |
| `msapplication-TileColor` referencing a non-existent `browserconfig.xml`                                                                              | Removed                                                                                                                                                                                                                                      |

### 5. SEO and metadata

Added: canonical URL, full Open Graph and Twitter Card tags, a generated social
share image, `sitemap.xml` with a `Sitemap:` directive in `robots.txt`, and a
standalone branded `404.html` (GitHub Pages was serving its own default). The
meta description was rewritten to name the service area.

`og-image.jpg` and `wordmark.png` are produced by
`tools/generate-social-image.mjs` from the source assets — they need un-hashed
filenames, so they are committed, but they are generated rather than hand-made
and can be regenerated with `pnpm generate:brand-assets`.

No structured data was added. `LocalBusiness` markup is genuinely applicable and
is recorded as a P2 suggestion, but it needs the owner to confirm service area,
hours and contact details rather than have a developer invent them.

### 6. Maintainability

`App.tsx` went from **1,411 lines to 43**, split into eleven section components
plus a shared `Picture`, a `src/images.ts` manifest, and small shared modules for
button styles, links and the carousel scroll helper. Forty `// @ts-expect-error`
comments above image imports were replaced by ambient module declarations in
`src/types/`.

This was not tidying for its own sake — it was the precondition for the image
work. Forty near-identical import lines with query strings embedded in them
cannot be given consistent widths, formats and `sizes` by hand.

Dependencies: **9 → 3** production, and six declared-but-unimported packages
removed (`lodash`, `react-confetti`, `@responsive-image/core`,
`@responsive-image/vite-plugin`, `svgo`, `vite-plugin-image-optimizer`).

Also removed: 28 unreferenced image files totalling 220 MB
(`src/assets/_OLD/`, `src/assets/spaces/_Removed Photos/`) and four unused
root-level PNGs. The objects remain in git history, so this does not shrink an
existing clone — it stops them being checked out.

### 7. Testing and deployment

The single test file was **untouched boilerplate**, asserting a "Welcome!"
heading that has never existed on this site, so `pnpm test` had never passed. It
is now 14 cases covering exactly what this engagement changed: single `h1`, no
skipped heading levels, `main` landmark, alt text and intrinsic dimensions on
every image, lazy gallery with an eager prioritized hero, AVIF-before-WebP-before-
JPEG ordering, width-not-density descriptors, FAQ keyboard operation, process
button state, and distinct carousel arrow labels.

Deployment was a manual `gh-pages -d dist` from a workstation with nothing
verifying anything first. `.github/workflows/deploy.yml` now gates publication on
typecheck, lint, format check, tests and a production-dependency audit, then
builds, runs `tools/check-links.mjs` against `dist/`, and publishes.
`check-links.mjs` verifies every local `href`, `src`, `imagesrcset` candidate and
CSS `url()` resolves to a file that was actually emitted — it would have caught
the `safari-pinned-tab.svg` 404 the day it appeared.

---

## Hosting decision

**Keep GitHub Pages as the origin; add Cloudflare as DNS, CDN and security edge.**
Full reasoning in [`hosting-architecture-decision.md`](./hosting-architecture-decision.md).

Every measured deficiency in the current hosting is an _edge_ concern — no
custom headers (GitHub Pages has no mechanism at all), `max-age=600` on
content-hashed immutable assets, gzip only with no Brotli, no HTTP/3. None
requires moving where the site is built or stored. Cloudflare Pages and Workers
were both evaluated and rejected: they migrate the part that works in order to
fix the part that does not, and Workers in particular is the right tool for edge
_logic_, of which this site has none.

Brotli alone would cut the compressible payload a further **13.9%** (109.6 kB →
94.4 kB).

---

## Not yet live — awaiting approval

Two production changes are prepared but deliberately not executed:

1. **GitHub Pages source → GitHub Actions.** The repository is on the legacy
   `gh-pages`-branch build type. The workflow is written and tested locally, but
   switching the source is a repository settings change.
2. **Nameservers → Cloudflare** (registration stays at GoDaddy).

The second needs care beyond the usual. Capturing the zone from the authoritative
nameservers turned up something not mentioned in the brief: **`spacelift.online`
carries a full Microsoft 365 mail configuration** — MX, SPF, `autodiscover`,
Lync/Teams CNAMEs and SRV records. Moving nameservers moves the business's email
along with the website. `infra/cloudflare/dns-inventory.md` records every record
verbatim, and `cutover-runbook.md` verifies mail with real inbound and outbound
messages _before_ anyone looks at the site.

The proposed CSP is not theoretical. It was served in front of the real
production build and the site exercised end to end — every section scrolled, an
FAQ disclosure opened, a process selector and a carousel arrow clicked, the
contact endpoint reached. **Zero violations, zero console errors, all five
webfonts loaded.** Enforcement was confirmed positively by checking that a
request to a disallowed origin _is_ refused, so a silently inert policy would
have been caught. It still ships as `Report-Only` for 48 hours first.

---

## Verification performed

- Clean `node_modules`, `pnpm install --frozen-lockfile` — clean
- Cold production build (~51 s) — no warnings
- `pnpm run typecheck` — clean
- `pnpm run lint` — clean (ESLint 10 flat config)
- `pnpm run format:check` — clean
- `pnpm run test:run` — 14/14
- `pnpm run check:links` — no broken references; verified the checker itself
  fails on an injected broken reference
- `pnpm audit` — no known vulnerabilities
- Rendering compared against the pre-change build at 320 / 390 / 768 / 1440 /
  1920 px; no horizontal overflow at any of them
- Every section screenshot-compared, including against live production for the
  process section
- Browser console clean on load and after interaction
- CSP verified enforcing, and verified not to break the site
- `prefers-reduced-motion` verified with Chromium emulation, before and after
- Reduced-motion, keyboard operation of FAQ and process controls, carousel
  arrows, and contact-form submission all exercised in a real browser
- 404 page rendered and checked
- `git status` clean; no credentials or secrets added (`gtag` measurement ID and
  the Formcarry endpoint are public-by-design identifiers and were already
  present)

---

## Remaining suggestions

### P2 — worth doing, not done here

- **Code-split `motion`.** 101 kB gzip in one chunk for a static marketing page.
  Deferring the animation library behind the fold would cut the critical path
  further.
- **Prerender the HTML at build time** (`renderToString` + `hydrateRoot`, ~30
  lines, no framework change). The page is client-rendered, so first paint waits
  on the bundle and the page is blank without JavaScript. This is now the single
  largest remaining performance lever — worth perhaps another second of FCP on
  mobile — and would also make the content crawlable without JS execution.
- **`LocalBusiness` structured data.** Genuinely applicable; needs the owner to
  confirm service area, hours and contact details.
- **Downscale the archival masters.** `src/assets/` is still 499 MB of
  full-resolution originals (up to 42 megapixels). A 3000 px long edge would keep
  every current output identical while making the repository usable; the true
  originals belong in the owner's own storage, not in git.
- **Replace `'unsafe-inline'` in `script-src`** by hashing the inline `gtag`
  bootstrap.
- **Tailwind 3 → 4**, which would also unblock `eslint-plugin-tailwindcss` v4
  (its ESLint 10-compatible line requires Tailwind 4).

### P3 — deliberately out of scope

- Migrating hosting to Cloudflare Pages or Workers.
- Any paid image transformation service.
- Rebuilding on a meta-framework.
- Redesigning the visual identity.
- Spam protection on the contact form. Commented-out reCAPTCHA groundwork
  existed and was removed as dead code; whether the form needs protection is a
  product decision for the owner.
- DKIM and DMARC records. The zone has neither — a real gap in the mail
  configuration, worth raising, but an email decision rather than a website one.

---

## Known limitations

- **Lighthouse was not used.** Scores from an unthrottled developer laptop are
  not reproducible enough to quote to a client. LCP, CLS and FCP were measured
  directly under a fixed, documented emulation profile with the identical harness
  before and after, which is a stronger comparison than two Lighthouse runs
  taken months apart on different hardware.
- **INP was not measured.** The page has no input-driven work heavy enough to
  sample meaningfully in an automated pass. Interaction cost was assessed
  structurally instead: main-thread JS is unchanged in size, and the animations
  that previously forced a layout on every frame are now composited transforms.
- **Safari was not automated.** No Safari automation is available in this
  environment. Safari-specific behaviour was reasoned about from source. One
  known item: `background-attachment: fixed` on the About section's island
  watermark is not honoured by iOS Safari, which treats it as `scroll`. That was
  already true before this work and is cosmetic.
- **CI has not executed.** The workflow is written and every step was run
  locally, but GitHub Actions cannot be triggered from here. Its first real run
  will be the first push of this branch.
- **The Cloudflare configuration is unapplied**, so its headers and cache
  behaviour are verified locally but not in production.
- **The 220 MB of deleted assets remain in git history.** Removing them from
  history would require a rewrite, which is explicitly out of bounds for this
  engagement — and rightly so.
- **The repository is public**, not private as the brief assumed
  (`gh api repos/applebya/spacelift` → `"private": false`). Flagged for the
  owner; no action taken.
