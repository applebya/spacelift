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

## What that would take — and a correction

**An earlier version of this document blamed image bandwidth. That was wrong,
and the correction is the useful part.**

The claim was that the page loads 35 images totalling 582 KB, nearly all at
once, starving the hero. Lighthouse's network audit does report that. But
measured in a real throttled browser (Pixel 5, Slow-4G, 4x CPU), first paint
costs **5 images and 56 KB**, and it is still 5 images six seconds later with
no scrolling. Only scrolling the whole page pulls in the rest — which is
exactly what Lighthouse does at the end of a run to capture its full-page
screenshot, well after the metrics are taken. The hero AVIF completes at
**~350 ms**. It is not queued behind anything.

The real finding is stranger and more useful:

**The LCP penalty does not correspond to anything a visitor experiences.** In
a real throttled browser this page reports exactly one LCP candidate, painted
at the same millisecond as First Contentful Paint — a gap of **0 ms**,
reproducible across runs. The same is true of celery.info and
goodgradients.com. Lighthouse, using simulated (Lantern) throttling, reports
LCP 250-600 ms *after* FCP on all three.

Lantern does not replay the page; it models the request graph under a
synthetic network. For a client-rendered app it puts the JavaScript bundle in
the LCP element's dependency chain, so LCP lands a bundle-download after FCP
by construction. A real browser paints the element as soon as React renders
it, which is the same moment first paint happens.

So the ~1 point this site is missing is not a defect to fix. tifftodo.com
scores 100 because its content ships in the HTML (a 15 KB document), which
gives Lantern a shorter dependency chain for its LCP element — not because it
is faster for a person.

What *is* real, and the only place with genuine headroom, is FCP itself:
~1400-1900 ms observed, gated on downloading and executing the bundle before
anything can paint. Closing that means materially less JavaScript on the
critical path, or true server rendering. Neither is a small change, and
prerendering was tried (below) and measured worse.

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
   no hydration errors — but it measured worse, not better. Re-tested
   afterwards on the FCP-to-LCP gap specifically, which is the thing it should
   have closed: 1523 ms without it, 1739 ms with it. The prerendered document
   carries all 95 `<img>` tags and 24 KB of inlined CSS into the initial
   parse, and on a 4x-throttled CPU that costs more than the round trip it
   saves. Reverted.

4. **Deprioritising the lazy images** with `fetchpriority="low"`, so the hero
   could not be queued behind them. No effect, for the reason above: the hero
   already completes at ~350 ms and only five images load before first paint.
   Measured directly rather than through the score, because the score's
   run-to-run spread (LCP 2130-3593 ms for an identical build) is far wider
   than the effect being looked for.

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
