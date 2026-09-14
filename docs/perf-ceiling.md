# Why spacelift.online is at 99, not 100

Investigated 2026-09-13 as part of the Lighthouse-100 mission.

## Where it stands

Lighthouse 13.4.1, mobile preset, **fresh Chrome profile per run**, against
the deployed origin:

| Category       | Score |
| -------------- | ----- |
| Performance    | 99    |
| Accessibility  | 100   |
| Best practices | 100   |
| SEO            | 100   |

Five consecutive runs returned 99/99/99/99/99. A separate session measuring
the same site the same way got 98. Treat the honest figure as **98–99**.

## What the last point is made of

The performance score is five weighted metrics and nothing else. Three are
already perfect:

| Metric | Value | Score | Weight | Points lost |
| ------ | ----- | ----- | ------ | ----------- |
| Total Blocking Time | 1 ms | 100 | 30 | 0 |
| Cumulative Layout Shift | 0 | 100 | 25 | 0 |
| Speed Index | ~1400 ms | 100 | 10 | 0 |
| First Contentful Paint | ~1400 ms | 97 | 10 | 0.30 |
| Largest Contentful Paint | ~2050 ms | 96–97 | 25 | 0.75–1.00 |

Total lost: **1.05–1.30**, which rounds to 99.

Almost all of it is LCP. For the total to round to 100 it must stay under
about 0.5, which needs LCP at roughly **1555 ms** — a reduction of ~500 ms.

## What that would take, and why it was not done

**The LCP is bandwidth-bound on images, not on JavaScript.** The deployed
page requests **35 images totalling 582 KB**, and nearly all of them start
within a few milliseconds of each other. On the simulated Slow-4G link
Lighthouse models (1.6 Mbps), 582 KB is about three seconds of transfer,
and the hero competes with all of it.

This is not a case of unoptimised images. `Picture.tsx` already emits AVIF
and WebP with width descriptors and correct `sizes`, sets `width`/`height` on
every image, marks exactly one image as the LCP element, and lazy-loads the
rest. The previous modernisation pass did this work properly. What remains is
simply that Chrome's native lazy-loading threshold grows on slow connections,
so images well below the fold are fetched anyway.

Closing the gap means cutting how many image bytes load during first paint —
fewer images in and near the first viewport, or smaller mobile variants. That
is a design and content decision about what the page shows, not a build
setting, so it is recorded here rather than taken unilaterally.

## Three things that were tried and did not work

Measured with an A/B harness that serves both builds on one port, alternates
which goes first, gzips like a real host, and was validated with a
same-build control before use.

1. **Deferring Google Analytics to after `load`.** `gtag.js` is 171 KB —
   larger than this site's entire JavaScript bundle — and the comment in
   `index.html` claiming `async` keeps it clear of first paint is wrong:
   `async` defers execution, not the download, and the request starts
   alongside the app bundle. Deferring it properly changed nothing
   measurable (median 94 either way). Worth knowing before someone else
   assumes it is free headroom.

2. **Prerendering the app to static HTML with inlined critical CSS.** Built
   and working — `renderToString` at build time, `hydrateRoot` on the client,
   no hydration errors — but it measured no better than the current build and
   usually worse (median 87 against 93). The theory was sound for a
   JS-gated first paint; it does not help here because the constraint is
   image bandwidth, which prerendering does not touch, and the prerendered
   document carries all 95 `<img>` tags into the initial parse. Reverted.

3. **Reordering inlined CSS relative to preload hints.** A real effect, and a
   mistake worth recording: inlining the stylesheet where the `<link>` had
   been pushed the hero image's preload 24 KB further down the byte stream,
   and the preload scanner reads in document order. Preload hints belong
   before bulk inlined CSS, always.

## The measurement itself

A single Lighthouse run is not a measurement of this site. The first run of
any batch is consistently the slowest — a cold DNS, TLS and CDN path — and
single-run tooling always takes that first run. This site measured 78 on one
cold sample and 99 on five warm ones the same evening. Anything published
should be a median of at least five.
