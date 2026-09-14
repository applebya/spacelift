# Showcase readiness — spacelift

Follow-ups before spacelift.online is highlighted on the corp site. The
cross-project list lives in `~/dev/.missions/showcase-readiness.md`; this is
the spacelift-specific slice.

Verified in a browser 2026-09-13: hero renders, all nine sections present, no
broken images, the process step buttons scroll the detail panel, the carousel
is keyboard-focusable, and the contact form posts to a live formcarry
endpoint. No console errors. Deployed scores: perf 99, accessibility 100,
best practices 100, SEO 100.

This is a **client-facing business site**, not a portfolio toy — a broken
contact form or a stale deploy costs Rosemarie real enquiries, so the deploy
item below matters more here than anywhere else in the set.

## Blocking

- [ ] **Decide how this deploys, and remove the other path.** `git push
      origin main` does not publish: Pages is `build_type: legacy` serving the
      `gh-pages` branch, while `.github/workflows/deploy.yml` uses
      `upload-pages-artifact`/`deploy-pages`, which only publish under
      `build_type: workflow`. The deploy job goes green having uploaded an
      artifact nothing consumes. The site was two days stale before this was
      noticed. Full detail and both fixes in `deploy.md`.
      **Leaving both paths in place is the one option that should not
      persist** — a green check that means nothing is worse than no check.

## Correctness

- [ ] **Test the contact form end to end at least once.** It posts to
      formcarry and the endpoint answers 200, but nothing here verifies a
      submission actually arrives. It was not exercised during verification
      because doing so sends a real enquiry to the business owner. Worth one
      deliberate test send, confirmed received.
- [ ] **`index.html` carries a comment that is wrong.** It claims analytics
      "loads after the document body so it never competes with the hero image
      or the fonts for bandwidth during first paint". `async` defers
      execution, not the download — the 171 KB `gtag.js` request starts
      alongside the app bundle. Deferring it properly was measured and
      changed nothing, so the code is fine; the comment is the problem.

## Accessibility

- [ ] `tools/audit-a11y.ts` scans the **initial view only**. It earned its
      keep immediately — it found `scrollable-region-focusable` on the process
      carousel, a serious WCAG 2.1.1 failure Lighthouse does not test for and
      had been scoring 100 — but "no violations" from it still means "clean on
      first paint". Drive it through the mobile menu and any expanded state
      before trusting the 100.

## Performance

Perf is 99 and the whole gap is LCP. The page requests **35 images totalling
582 KB**, nearly all starting within milliseconds of each other; on the
simulated 1.6 Mbps link that is roughly three seconds of transfer for the hero
to compete with.

The images are not the problem — `Picture.tsx` already emits AVIF and WebP
with width descriptors and correct `sizes`, sets intrinsic dimensions, marks
exactly one LCP image and lazy-loads the rest. Chrome's lazy threshold simply
grows on slow connections.

- [ ] **Reduce image bytes during first paint** — fewer images in and near the
      first viewport, or smaller mobile variants. This is a decision about
      what the page shows, which is why it was written down rather than taken.

`perf-ceiling.md` records the full arithmetic, plus three interventions that
were built, measured and reverted (deferring gtag, prerendering to static HTML
with hydration, inlining critical CSS) so nobody spends another evening on
them.
