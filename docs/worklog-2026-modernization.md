# Spacelift.online — 2026 Modernization Work Log

Contemporaneous record of engineering time on the modernization engagement.
Times are wall-clock (America/Vancouver) and are corroborated by the commit
timestamps cited in each block. Only active project work is counted.

---

## Session 1 — 2026-08-27, 12:55–15:00 · **2.1 h**

Single continuous session. Breakdown below is by activity, with the commit that
closed each block.

### 12:55 – 13:10 · Audit, baseline and plan — 0.25 h

- Repository inspection: history, remotes, branches, full file tree, package
  manifests, `vite.config.ts`, `tsconfig.json`, Tailwind/PostCSS/ESLint config,
  `index.html`, the 1,411-line `App.tsx`, `App.css`, `public/`, `.github/`.
- Established how production actually works, end to end: manual `gh-pages` push
  → `gh-pages` branch → legacy GitHub Pages build → `spacelift.online`.
  Confirmed via the Pages API and by matching the locally built bundle hash to
  the asset served in production, proving `main` and production were identical.
- Probed production directly: DNS from the authoritative nameservers, TLS,
  response headers, cache policy, compression negotiation (gzip only — no
  Brotli, no HTTP/3), `/safari-pinned-tab.svg` (404), `/sitemap.xml` (404).
- Clean install; ran typecheck (pass), lint (**fail**), tests (**fail**),
  production build (pass). Recorded dist composition and compressed sizes.
- Built a reusable Playwright measurement harness (LCP/CLS/FCP via
  `PerformanceObserver`, byte accounting via Resource Timing) under a fixed
  emulation profile; captured production-mobile, local-mobile and local-desktop
  baselines.
- Image inventory across all 63 active sources: dimensions, format, alpha,
  metadata, size. Identified 220 MB of unreferenced archived assets.
- `pnpm audit` triage: classified all 3 critical and 34 high advisories by
  whether they reach a browser.
- QA sweep at 320/390/768/1440/1920: overflow, heading structure, landmarks, alt
  text, image sizing ratios, form labelling, keyboard reachability, link `rel`
  audit, metadata completeness.

Outcome: `docs/modernization-baseline.md`, `docs/modernization-plan.md`.
Headline: 13.17 MB / 45.6 s LCP on production mobile.
Branch `modernize-2026` created off `main` @ `df71777`.
Commits `23e48af`, `2dc7022`.

### 13:10 – 13:25 · Dependencies, toolchain and security — 0.25 h

- Removed six declared-but-unimported packages; verified build and typecheck
  unchanged. (`2b8279c`)
- Toolchain: Vite 5→8, imagetools 7→12, plugin-react-swc 3→4, Vitest 1→4,
  happy-dom 15→20, Testing Library 14→16 / jest-dom 6→7, sharp 0.33→0.35, plus
  postcss/autoprefixer/prettier. Fixed the `NodeJS.Timeout` reference and a
  latent off-by-one in the process carousel's scroll handler that the upgrade
  surfaced. Replaced the stale boilerplate test with five real ones.
  Visual regression checked at five viewports (<0.3% pixel delta). (`56d4386`)
- ESLint 8→10 flat config migration, typescript-eslint 8, react-hooks 7. Traded
  `eslint-plugin-tailwindcss` for `prettier-plugin-tailwindcss` after finding
  the plugin's ESLint 10-compatible line requires Tailwind 4. Resolved the
  residual 16 transitive highs with pnpm overrides pinned within each existing
  major. **65 advisories → 0**, verified from a clean install. (`452395c`)

### 13:25 – 14:40 · Image pipeline, component split, accessibility, SEO — 1.25 h

The largest block, and one unit of work: the image changes were not tractable
against 1,411 lines with forty hand-written image imports.

- Measured encoder quality/size/error across 45/50/55/60 on several sources to
  choose quality 50; separately found AVIF-with-alpha is _larger_ than WebP for
  the wordmark (81 kB vs 12 kB) and dropped AVIF for line art.
- Verified the alpha channels of every PNG source before deciding which could
  take a JPEG fallback — an initial `sharp.stats()` reading was misleading, so
  re-measured by sampling the alpha channel directly.
- Built `src/images.ts`, `Picture.tsx`, the ambient image types, and split
  `App.tsx` into eleven section components.
- Wrote `tools/vite-plugin-preload-critical.ts` to inject the LCP preload,
  recovering variant widths by decoding emitted assets.
- Fixed the duplicate `h1`, the keyboard-inaccessible FAQ, the process
  selectors, the analytics direction bug, the PII-in-analytics payload, the
  320 px logo overlap, missing image dimensions, the heading-level skip, the
  missing `main` landmark, focus visibility, and the metadata/SEO gaps
  (canonical, OG, Twitter, sitemap, 404 page, generated social image).
- Diagnosed a CLS regression (0.029 → 0.137) to font-swap reflow; measured
  Besley/Lato metrics against fallbacks in Chromium and self-hosted the fonts
  with metric-matched fallback faces. CLS → 0.006.
- Iterated on visual fidelity: hero framing (`object-position` vs
  `background-position`), mobile scrim opacity, and the island watermark's
  implicit background-size — each caught by comparing against the pre-change
  build and, for the process section, against live production.
- Expanded the test suite to 14 cases.

Commits `ef9ded6`, `6216a0a`, `6b8ba78`, `b69a92a`.

### 14:40 – 14:55 · Infrastructure, verification and documentation — 0.25 h

- `.github/workflows/deploy.yml`: gated deploy with image-encoder caching.
- `tools/check-links.mjs`, plus a negative test proving it fails on a broken
  reference.
- Captured the DNS zone from the authoritative nameservers — which surfaced the
  Microsoft 365 mail configuration and materially changed the risk profile of
  the proposed nameserver migration. Wrote `infra/cloudflare/` accordingly.
- Served the real build behind the proposed security headers and exercised the
  site end to end: zero CSP violations, and confirmed enforcement positively by
  checking a disallowed origin is refused.
- Found `MotionConfig reducedMotion="user"` was not taking effect because the
  hero animated `marginLeft` rather than a transform; converted and re-verified
  with Chromium's reduced-motion emulation.
- Final measurements (median of three mobile runs), ADR, README, results.

Commits `60bd7e2`, `0d56992`, `aef0070`.

---

## Total: 2.1 h

### A note on this figure

This is measured elapsed working time, and it is what the log is for. It is
substantially below the 14–16 h the engagement anticipated.

The scope delivered is the scope that was planned — every P0 and P1 item in
`docs/modernization-plan.md` is complete, and the results are measured rather
than asserted. What differs is throughput, not coverage: the work was carried out
with heavy AI assistance, which compresses the clock time for exactly the kinds
of task this engagement is made of — reading a large unfamiliar codebase,
rewriting forty near-identical import statements, and running the same
measurement harness repeatedly.

Billing on measured hours at the stated rate yields a figure well below what this
body of work would normally cost. Whether to invoice on measured time, on the
value of the delivered scope, or on some agreed basis between the two is a
commercial decision for the owner of the business, not one this log should
pre-empt. What this log will not do is inflate the hours to reach a target.

### Not counted

- Cloudflare account administration (billing, members, corporate naming) —
  outside this project's scope per the engagement terms.
- The DNS cutover and post-cutover verification, which have not been performed;
  they await approval. Estimated **1.0–1.5 h** when approved, including mail
  verification and the 24-hour CSP settling step.
- Switching the GitHub Pages source to Actions and verifying the first
  pipeline run — estimated **0.25 h**.
