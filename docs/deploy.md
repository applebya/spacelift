# Deploying spacelift.online

**`git push origin main` does not update the live site.** It runs the Actions
workflow, the workflow reports success, and nothing changes. Publishing is
`pnpm run deploy`, and only that.

## Why

GitHub Pages for this repo is configured as:

    source: gh-pages branch (root)
    build_type: legacy

`.github/workflows/deploy.yml` builds the site and then calls
`actions/upload-pages-artifact` followed by `actions/deploy-pages`. That pair
only publishes when `build_type` is `workflow`. Against a `legacy`
branch-served site the deploy job still completes green — it uploads an
artifact nothing consumes.

So the site serves whatever `tools/deploy.mjs` last pushed to `gh-pages`, and
the workflow's "Deploy ✓" means only that the build compiled.

Found 2026-09-13: the workflow reported a successful deploy of `72263c7`
while `spacelift.online` was still serving a build published on 2026-09-11.
The gap had gone unnoticed because the green check looks like a deploy.

## How to publish

```bash
pnpm run deploy        # builds, then pushes dist/ to the gh-pages branch
```

Run it from the **main checkout, not a git worktree**. In a worktree `.git` is
a file rather than a directory, and the `gh-pages` package globs `.git/**`,
which fails with `ENOTDIR`.

Confirm afterwards that the live bundle hash matches the one just built:

```bash
ls dist/assets/index-*.js
curl -s https://spacelift.online/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
```

Pages can take a couple of minutes. Until those match, the change is not live
regardless of what Actions says.

## Worth fixing properly

Two coherent options, neither taken here because both change deployment
behaviour and that is not a call to make inside a performance pass:

1. **Switch Pages to `build_type: workflow`.** The workflow already builds,
   lints, typechecks, tests, audits dependencies and checks links, so pushing
   to main would publish exactly what CI verified. `tools/deploy.mjs` then
   becomes dead code — worth deleting rather than leaving as a second path.
2. **Drop the deploy job from the workflow** and keep publishing manually, so
   the green check stops implying something it does not do.

Leaving both in place is the one option that should not persist: a deploy
mechanism that silently does nothing is worse than not having one.
