# Cache policy (Cloudflare Cache Rules)

GitHub Pages returns `cache-control: max-age=600` for every response — verified
against production on 2026-08-27, including for content-hashed asset filenames
that could safely be cached for a year. That is the single easiest performance
win available at the edge, and it costs nothing.

The whole policy rests on one property of the build: **every file under
`/assets/` has a content hash in its name.** Change the file, and the name
changes; the old URL is never re-used with different bytes. That is what makes a
one-year immutable cache safe rather than reckless.

---

## Rules, in order

### 1. Fingerprinted build output

**When:** `starts_with(http.request.uri.path, "/assets/")`
**Then:**
- Cache eligibility: **Eligible for cache**
- Edge TTL: **1 year**, ignore origin cache-control
- Browser TTL: **1 year**

Effective header: `cache-control: public, max-age=31536000, immutable`

`immutable` tells the browser not to revalidate even on a reload, which matters
because a marketing site gets a lot of reloads. A stale asset is impossible: a
new build produces new filenames and a new `index.html` that references them.

This covers the JS bundle, the CSS bundle, all 649 generated image variants and
all five webfonts.

### 2. The HTML entry points

**When:** `http.request.uri.path in {"/" "/index.html" "/404.html"}`
**Then:**
- Cache eligibility: **Bypass cache**
- Browser TTL: **no-cache** (revalidate every time)

Effective header: `cache-control: public, max-age=0, must-revalidate`

The HTML is the only file whose URL does not change between deployments, so it
is the only one that can go stale — and staleness here is not cosmetic.

Publishing replaces the entire `gh-pages` branch, so the previous build's
content-hashed assets stop existing at the origin. If an edge is still holding
the old `index.html`, it hands visitors markup that references files the origin
no longer has; any PoP that does not already have those bytes cached returns
404s and the page is broken. GitHub Pages sends `max-age=600` on HTML, so
**"respect origin" would give the edge a ten-minute window to do exactly that
after every deploy.** Setting only the *browser* TTL to no-cache does not help:
it makes the browser ask, and the edge answers from its own stale copy.

Bypassing the edge for these three paths removes the failure mode entirely. The
cost is one origin fetch per HTML request — 2.5 kB from a Fastly-backed origin,
while Cloudflare still terminates TLS at the edge and every asset the page
references is still served from cache.

*If the origin fetch ever proves to matter, the alternative is an Edge TTL
override of a few seconds plus a deploy-time purge of `/`, `/index.html` and
`/404.html`. Do not simply lengthen it.*

### 3. Stable brand assets and site metadata

**When:** `http.request.uri.path in {"/og-image.jpg" "/wordmark.png" "/favicon.ico" "/favicon.svg" "/apple-touch-icon.png" "/site.webmanifest" "/android-chrome-192x192.png" "/android-chrome-512x512.png"}`
**Then:** Edge TTL **1 week**, Browser TTL **1 week**

These deliberately have un-hashed names — `og-image.jpg` because social
platforms cache the URL, `wordmark.png` because `404.html` is served without the
bundle — so they cannot be cached forever. A week bounds how long a change takes
to propagate while still keeping them out of the request path.

### 4. Crawler files

**When:** `http.request.uri.path in {"/robots.txt" "/sitemap.xml"}`
**Then:** Edge TTL **1 hour**, Browser TTL **1 hour**

Small, rarely read, and occasionally worth changing quickly.

---

## What deploying looks like under this policy

1. CI builds and publishes. New `/assets/*` filenames appear; `index.html` is
   rewritten to point at them, and the previous build's assets stop existing at
   the origin.
2. The next visitor's HTML request goes to the origin — the edge does not cache
   it — so they get the new markup immediately and request the new asset URLs.
   Nothing they already have cached is stale, because nothing they have cached
   was replaced.
3. No cache purge is required. If one is ever wanted — say a change to
   `og-image.jpg` needs to be visible immediately — purge that single URL rather
   than the zone.

## Verifying after rollout

```sh
# HTML: must not be held at the edge
curl -sI https://spacelift.online/ | grep -i 'cache-control\|cf-cache-status'
#   expect cf-cache-status: BYPASS (or DYNAMIC), never HIT

# A fingerprinted asset: must be immutable and a year
ASSET=$(curl -s https://spacelift.online/ | grep -o '/assets/index-[^"]*\.js' | head -1)
curl -sI "https://spacelift.online$ASSET" | grep -i 'cache-control\|cf-cache-status'

# Brotli must now be negotiated (GitHub Pages alone returns it uncompressed)
curl -sI -H 'Accept-Encoding: br' "https://spacelift.online$ASSET" | grep -i 'content-encoding'
```

Expect `cf-cache-status: HIT` on the second request for an *asset*,
`BYPASS` on the HTML, and `content-encoding: br`.

The deploy-staleness case is worth testing once deliberately: deploy, then
immediately request `/` from a PoP that had traffic before the deploy, and
confirm the returned HTML references assets that resolve.

## What is deliberately not done

- **No "Cache Everything" on HTML with a long edge TTL.** It is the fastest way
  to make a deployment look like it did not happen — and, because publishing
  removes the previous build's hashed assets, the fastest way to serve a page
  whose scripts 404.
- **No Cloudflare minification.** Vite already minifies; Cloudflare's HTML
  minifier would rewrite output that has been shaped deliberately, including the
  preload tags the build injects.
- **No Rocket Loader.** It reorders script execution and is a well-known source
  of breakage in client-rendered applications.
