# Spacelift

Marketing site for **[spacelift.online](https://spacelift.online)** — Spacelift
transforms indoor and outdoor spaces on southern Vancouver Island: decluttering,
organizing, painting, cleaning, staging and merchandising for homes, businesses
and real estate.

A single static page. React renders it, Vite builds it, GitHub Pages serves it.

---

## Getting started

Requires Node (see `.nvmrc`) and pnpm (see `packageManager` in `package.json`).

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

| Script                       | What it does                                               |
| ---------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                   | Dev server with HMR                                        |
| `pnpm build`                 | Typecheck, then build to `dist/`                           |
| `pnpm serve`                 | Preview the production build                               |
| `pnpm verify`                | typecheck + lint + format check + tests — what CI runs     |
| `pnpm test`                  | Vitest in watch mode                                       |
| `pnpm test:run`              | Vitest once                                                |
| `pnpm lint` / `pnpm format`  | ESLint (flat config) / Prettier                            |
| `pnpm check:links`           | Verify every reference in `dist/` resolves                 |
| `pnpm generate:brand-assets` | Regenerate `public/og-image.jpg` and `public/wordmark.png` |

**A first build takes about 50 seconds** because it encodes every image variant
in AVIF, WebP and JPEG. After that `vite-imagetools` caches by content hash in
`node_modules/.cache/imagetools` and rebuilds take about a second.

---

## How it is put together

```
index.html                  document shell; the build injects preload tags into it
src/
  index.tsx                 mounts the app
  images.ts                 every image asset, declared once, with its display widths
  components/
    App.tsx                 composition root
    Picture.tsx             <picture> renderer, and the CSS image-set() helper
    analytics.ts            thin gtag wrapper
    sections/               one file per section of the page
    ui/                     shared class strings, links, the carousel scroll helper
  styles/fonts.css          self-hosted @font-face plus metric-matched fallbacks
  types/                    ambient declarations for the image pipeline
  assets/                   original photographs and fonts
tools/
  vite-plugin-preload-critical.ts   emits <link rel=preload> for the LCP image and fonts
  generate-social-image.mjs         regenerates the two un-hashed brand assets
  check-links.mjs                   post-build reference checker
public/                     files copied verbatim: icons, robots, sitemap, 404
infra/cloudflare/           edge configuration — staged, not live
docs/                       modernization baseline, plan, ADR, results, work log
```

### Images

This is the part worth understanding before changing anything.

Every photograph is declared once in **`src/images.ts`**, with the widths it is
actually displayed at and the formats to generate. `vite-imagetools` resizes and
re-encodes at build time from the originals in `src/assets/` — nothing is
committed pre-optimized and nothing is hand-edited, so the output is
reproducible from the sources.

`<Picture>` renders a `<picture>` offering AVIF, then WebP, then the original
format, with **width descriptors** and a `sizes` attribute so the browser can
choose a candidate that suits both the viewport and the device pixel ratio. It
always emits intrinsic `width`/`height`, which is what keeps layout shift at
essentially zero.

Two rules when you touch this:

1. **`sizes` and the generated widths have to agree.** They live next to each
   other in `src/images.ts` for that reason. If a section's layout changes, both
   change.
2. **Exactly one image is `priority`** — the hero, which is the Largest
   Contentful Paint element. Everything else lazy-loads.

The originals are large (up to 42 megapixels). That is deliberate: they are
archival masters, and the build downsizes from them. Do not commit pre-resized
replacements.

### Fonts

Besley and Lato are **self-hosted** from `src/assets/fonts/`, latin subset only,
only the weights the site renders. `src/styles/fonts.css` also defines
`Besley Fallback` and `Lato Fallback` — local system faces with `size-adjust`
and metric overrides measured against the real fonts, so the swap from fallback
to webfont barely moves anything. Removing those fallback faces reintroduces a
0.13 layout shift on its own.

---

## Deployment

`main` → GitHub Actions → GitHub Pages → `spacelift.online`.

`.github/workflows/deploy.yml` runs typecheck, lint, format check, tests and a
production dependency audit; then builds, verifies no reference in `dist/` is
broken, and publishes. Pull requests run everything except the publish step.

The domain is registered at **GoDaddy** and stays there. See
`docs/hosting-architecture-decision.md` for why GitHub Pages remains the origin,
and `infra/cloudflare/` for the edge configuration that is staged but not yet
live.

> **Before touching DNS**, read `infra/cloudflare/dns-inventory.md`. The zone
> carries the business's Microsoft 365 email as well as the website.

---

## Documentation

| Document                                                                         |                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`docs/modernization-baseline.md`](docs/modernization-baseline.md)               | Measured state before the 2026 modernization            |
| [`docs/modernization-plan.md`](docs/modernization-plan.md)                       | Findings, classified P0–P3                              |
| [`docs/hosting-architecture-decision.md`](docs/hosting-architecture-decision.md) | Why GitHub Pages + Cloudflare, and not Pages or Workers |
| [`docs/modernization-results.md`](docs/modernization-results.md)                 | What changed, and the before/after numbers              |
| [`docs/worklog-2026-modernization.md`](docs/worklog-2026-modernization.md)       | Engineering work log                                    |

---

## Licence

MIT — see [`LICENSE`](LICENSE). Photographs and the Spacelift wordmark are not
covered by it and remain the property of the owner.
