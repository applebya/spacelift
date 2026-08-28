# ADR: Hosting and edge architecture for spacelift.online

**Status:** Accepted (2026-08-27) · **Decision:** Option A — keep GitHub Pages, put Cloudflare in front
**Implementation status:** **Not applied.** The owner elected on 2026-08-27 to hold
the nameserver change rather than move the zone — and therefore the business's
Microsoft 365 email — as part of a website engagement. The configuration is
staged in `infra/cloudflare/` and the decision below stands whenever it is
wanted; nothing else in the modernization depends on it.

---

## Current architecture

```
developer laptop → gh-pages branch → GitHub Pages (legacy build) → spacelift.online
                                          ↑
                            GoDaddy DNS (ns25/26.domaincontrol.com)
                            apex  A → 185.199.108–111.153
                            www   CNAME → applebya-wm.github.io  (301 → apex)
```

Deployment is a manual `pnpm run deploy` from a workstation. HTTPS is enforced and
the certificate covers both hosts. There is no CI.

### What is actually wrong with it

Measured against production on 2026-08-27, not assumed:

| Deficiency | Evidence |
|---|---|
| No custom response headers | GitHub Pages does not support them at all. No CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy` are present. |
| Cache policy is wrong for hashed assets | `cache-control: max-age=600` is returned for *everything*, including content-hashed immutable files that could be cached for a year. |
| gzip only | `Accept-Encoding: br` and `zstd` both return uncompressed. Brotli is ~12% smaller than gzip on this bundle. |
| No HTTP/3 | No `alt-svc` header on any response. |
| Release path is unverified | Nothing runs typecheck, lint or tests before `gh-pages` force-pushes `dist/`. |

Note that **none of the first four is a build problem** — they are all edge
concerns, and none of them requires moving where the site is built or stored.

---

## Options considered

### Option A — GitHub Pages stays the origin; Cloudflare becomes DNS + proxy

Nameservers move from GoDaddy to Cloudflare (**registration stays at GoDaddy**);
the apex and `www` records are recreated as proxied records pointing at GitHub
Pages. Cloudflare then supplies response headers (Transform Rules), cache rules,
Brotli/zstd, HTTP/3 and TLS.

- **Reliability** — two well-run networks in series. Cloudflare's proxy failing
  open is not a thing, but rollback is a single toggle: grey-cloud the records
  and traffic goes straight to GitHub Pages again, or repoint nameservers at
  GoDaddy. Both are reversible within a TTL.
- **Simplicity** — no change to how the site is built, stored or released.
- **Performance** — fixes every measured deficiency above.
- **Migration cost** — DNS records and a handful of rules. Hours, not days.
- **Cost** — free tier is sufficient.

### Option B — Cloudflare Pages builds from the GitHub repository

- Buys per-branch preview deployments and instant rollback, which are genuinely
  useful — but this is a single-page marketing site with one contributor and no
  staging audience.
- Requires granting Cloudflare access to the repository, reproducing the build
  (pnpm, Node version, ~50 s of AVIF encoding per cold build — note that
  `vite-imagetools`' disk cache lives in `node_modules/.cache` and would need
  explicit CI caching or every deploy pays the full encode).
- Replaces a deployment path that demonstrably works with one that has to be
  re-proven, in exchange for benefits that Option A also delivers (headers,
  caching, Brotli, HTTP/3) plus previews we do not currently need.

### Option C — Cloudflare Workers with static assets

- Workers is the right answer when there is server-side logic at the edge:
  routing, auth, personalization, API composition. **This site has none.** It is
  one HTML file, one JS bundle, one stylesheet and a folder of images.
- Adds a runtime, a `wrangler.jsonc`, and a deployment binary to a project whose
  entire value is that it is static.
- Being the newer platform is not a reason.

---

## Decision

**Option A.** Keep GitHub Pages as the origin and introduce Cloudflare as
authoritative DNS, CDN and security edge.

The reasoning follows the stated priority order directly. Every measured problem
with the current setup is an *edge* problem, and Option A fixes all of them
without touching the origin, the repository, or the release process. Options B
and C both migrate the part that is working in order to fix the part that is
not.

The one real gap Option A leaves — an unverified release path — is a CI problem,
not a hosting problem, and is addressed separately by
`.github/workflows/deploy.yml`, which now gates deployment on typecheck, lint
and tests.

### What this does *not* change

- The domain stays registered at GoDaddy, paid on the owner's own card.
- No transfer of domain ownership to Appleby Web Services.
- `github.com/applebya/spacelift` remains the canonical source repository.
- The site continues to be built by Vite and served from the `gh-pages` branch.

---

## Configuration to be applied at the edge

Prepared in `infra/cloudflare/` and **not yet live** — the DNS cutover requires
explicit approval.

### Caching

| Path | Policy | Why |
|---|---|---|
| `/assets/*` | `public, max-age=31536000, immutable` | Every filename is content-hashed by Vite. A new build produces new names, so a year is safe and a stale asset is impossible. |
| `/index.html`, `/404.html` | `public, max-age=0, must-revalidate` + edge cache with revalidation | The entry point must never be stale, or a deploy appears not to have happened. Cloudflare still serves it from cache, but revalidates. |
| `/og-image.jpg`, `/wordmark.png`, icons | `public, max-age=604800` | Stable URLs by necessity, changed rarely. A week bounds the staleness. |
| `/sitemap.xml`, `/robots.txt` | `public, max-age=3600` | Cheap to re-fetch; no reason to pin. |

### Security headers

Applied as a Cloudflare Transform Rule. Conservative by design — a CSP that
breaks the site is worse than no CSP.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  connect-src 'self' https://www.google-analytics.com
              https://region1.google-analytics.com https://formcarry.com;
  img-src 'self' data: https://www.google-analytics.com
          https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  form-action 'self' https://formcarry.com;
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
```

`'unsafe-inline'` in `script-src` is required by the inline `gtag()` bootstrap in
`index.html`. It could be removed with a nonce, but nonces need a server that can
generate one per response — a static origin cannot. Hashing the inline block is
possible and is recorded as a P3 follow-up. `style-src 'unsafe-inline'` is
required because several components set `style={{...}}` for background layers.

`Strict-Transport-Security` is *not* set with `preload`: preloading is
effectively irreversible for the domain and is the owner's decision, not ours.

### Proxy settings

- Both apex and `www` **proxied** (orange cloud).
- SSL/TLS mode: **Full (strict)** — GitHub Pages presents a valid certificate.
- Always Use HTTPS: on. Automatic HTTPS Rewrites: on.
- Brotli: on. HTTP/3: on. 0-RTT: off.
- Minification: **off** — Vite already minifies, and Cloudflare's HTML minifier
  would rewrite output we have deliberately shaped.
- Email Obfuscation / Rocket Loader: **off**. Rocket Loader reorders script
  execution and is a known source of hydration bugs.

---

## Rollback

| Failure | Response | Time |
|---|---|---|
| Site broken behind the proxy | Grey-cloud the apex and `www` records — traffic goes direct to GitHub Pages | < 1 min, propagation immediate |
| A header or cache rule breaks something | Disable that single rule | < 1 min |
| Cloudflare DNS itself is wrong | Repoint nameservers back to `ns25/ns26.domaincontrol.com` at GoDaddy | Minutes to hours, bounded by registry TTL |

The pre-cutover record inventory is captured in `infra/cloudflare/dns-inventory.md`
so the existing zone can be recreated exactly.

## Operational implications

- One more system in the path that someone must know about. Documented here and
  in `infra/cloudflare/README.md`.
- DNS changes now happen in Cloudflare, not GoDaddy. GoDaddy remains where the
  domain is renewed and paid for.
- Cache rules mean a deploy is visible immediately for HTML but assets are
  pinned for a year — which is correct precisely because their names change.
- Cloudflare's free plan has no contractual SLA. Neither does GitHub Pages.
