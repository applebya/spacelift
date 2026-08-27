# Spacelift.online — 2026 Modernization Work Log

Contemporaneous record of actual engineering time on the modernization engagement.
Only active project work is counted. All times are America/Vancouver.

---

## Session 1 — 2026-08-27

**12:55 – 15:00 · 2.1 h · Audit, baseline and plan**

- Repository inspection: git history/remotes/branches, full file tree, package manifests,
  `vite.config.ts`, `tsconfig.json`, Tailwind/PostCSS/ESLint config, `index.html`,
  the 1,411-line `App.tsx`, `App.css`, public assets, `.github/`.
- Determined the live deployment topology end to end: manual `gh-pages` push → `gh-pages`
  branch → legacy GitHub Pages build → `spacelift.online`. Confirmed via the Pages API and
  by matching the locally built bundle hash (`index-DL5kc3Ut.js`) to the asset served in
  production — establishing that `main` and production are identical.
- Probed production directly: DNS (GoDaddy NS, apex A-records, `www` CNAME → 301),
  TLS, response headers, cache policy, compression negotiation (gzip only; **no Brotli,
  no HTTP/3**), `/safari-pinned-tab.svg` (404), `/sitemap.xml` (404).
- Clean `pnpm install --frozen-lockfile`; ran typecheck (pass), lint (**fail**),
  tests (**fail**), production build (pass). Recorded dist composition and
  raw/gzip/brotli sizes.
- Built a reusable Playwright measurement harness (LCP/CLS/FCP via `PerformanceObserver`,
  byte accounting via Resource Timing) under a fixed emulation profile, and captured
  baselines for production-mobile, local-mobile and local-desktop.
- Image inventory across all 63 active source files: dimensions, format, alpha channel,
  metadata presence, byte size. Identified the 220 MB of unreferenced archived assets.
- `pnpm audit` triage: classified all 3 critical and 34 high advisories by whether they
  reach the browser (none do) and whether a safe upgrade exists.
- QA sweep at 320/390/768/1440/1920 px: overflow check, heading structure, landmarks,
  alt text, image sizing ratios, form labelling, keyboard reachability, link/`rel` audit,
  metadata completeness.

Outcome: `docs/modernization-baseline.md` and `docs/modernization-plan.md` written and
committed. Headline finding: 13.17 MB / 45.6 s LCP on production mobile.

Branch `modernize-2026` created off `main` @ `df71777`.
Commit: `23e48af`
