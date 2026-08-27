# Response headers (Cloudflare Transform Rule)

GitHub Pages cannot set response headers, so the site currently ships with none
of the following. These are applied at the edge as a single **Response Header
Transform Rule** matching all requests to the zone.

**Status: verified locally, not yet live.** The policy below was served in front
of the real production build and the site was exercised end to end — full scroll
of every section, an FAQ disclosure, a process-step selector, a carousel arrow,
and a request to the contact form endpoint. Result: **zero CSP violations, zero
console errors, all five webfonts loaded.** Enforcement was confirmed positively
by checking that a request to a disallowed origin *is* refused, so a silently
inert policy would have been caught.

---

## Rule: `Security headers`

**When:** `(true)` — all incoming requests
**Then:** set the following static response headers.

### Content-Security-Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com
            https://region1.google-analytics.com
            https://analytics.google.com
            https://stats.g.doubleclick.net
            https://formcarry.com;
img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline';
font-src 'self';
form-action 'self' https://formcarry.com;
frame-ancestors 'none';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests
```

Written as one line when entered into Cloudflare.

| Directive | Why it is what it is |
|---|---|
| `default-src 'self'` | Everything not named below is same-origin only. |
| `script-src … 'unsafe-inline'` | Required by the inline `gtag()` bootstrap in `index.html`. A nonce would be better but needs a server that can mint one per response; a static origin cannot. Hashing the inline block is the realistic upgrade and is recorded as a P3 follow-up. |
| `script-src … googletagmanager.com` | Loads `gtag.js`. |
| `connect-src` | Google Analytics posts to `google-analytics.com` and to a regional endpoint that varies by visitor (`region1.` for Europe/Canada); `analytics.google.com` and `stats.g.doubleclick.net` are used by some GA4 configurations. `formcarry.com` receives the contact form, which is sent with `fetch()` and so is governed by `connect-src`, not `form-action`. |
| `img-src … data:` | The build inlines small SVG icons as `data:` URIs below `assetsInlineLimit`. |
| `style-src 'unsafe-inline'` | Several components set `style={{ backgroundImage: … }}` for decorative layers, and `motion` writes inline transforms on every animated element. |
| `font-src 'self'` | Fonts are self-hosted now. No third-party font origin needs to be allowed — this directive would have needed `fonts.gstatic.com` before that change. |
| `form-action` | Belt and braces: the form is submitted via `fetch`, but if it ever falls back to a native submit this bounds where it can go. |
| `frame-ancestors 'none'` | Clickjacking protection. Supersedes `X-Frame-Options` in every browser that supports CSP Level 2. |
| `base-uri 'self'` | Stops an injected `<base>` from re-pointing every relative URL. |
| `object-src 'none'` | No plugins; closing an entire attack class costs nothing. |
| `upgrade-insecure-requests` | Belt and braces given HTTPS is enforced. Note this makes the policy untestable over plain `http://localhost`, so the local verification run omitted this one directive and nothing else. |

**Rollout:** ship first as `Content-Security-Policy-Report-Only` for 48 hours and
watch, then switch to enforcing. The local verification is strong evidence but it
is one browser on one machine; real traffic includes browser extensions, older
engines, and whatever else the internet does.

### The rest

| Header | Value | Why |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | GitHub Pages already sends `max-age=31556952` with no `includeSubDomains`. Two years plus subdomains is the normal posture. **`preload` is deliberately omitted** — submitting to the preload list is effectively irreversible for the domain and is the owner's call, not ours, particularly with mail subdomains in the zone. |
| `X-Content-Type-Options` | `nosniff` | `index.html` previously tried to set this via `<meta http-equiv>`, which browsers ignore. This is the form that works. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Matches the `<meta name="referrer">` already in the document; as a header it also covers non-document requests. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | The site uses none of these. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates the browsing context. Safe here: nothing opens or is opened by a cross-origin window that needs a handle back. |

`X-XSS-Protection` is **not** set. It is dead in every current browser and, in
the versions that did implement it, introduced its own vulnerabilities.

## Verifying after rollout

```sh
curl -sI https://spacelift.online/ | grep -iE \
  'content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy|cross-origin'
```

Then load the site with devtools open and confirm the console is clean. A CSP
that is present but violated on every page load is worse than no CSP, because it
trains everyone to ignore the console.
