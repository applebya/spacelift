/**
 * Verifies that every local reference in the built site resolves to a file that
 * was actually emitted, and that in-page anchors point at ids that exist.
 *
 * A static site fails quietly: a mistyped href or an asset that stopped being
 * copied produces a 404 that nothing surfaces until a visitor hits it. This is
 * the cheapest possible guard, and it runs in CI before anything is published.
 *
 *   node tools/check-links.mjs dist
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const root = process.argv[2] ?? 'dist'

const htmlFiles = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (full.endsWith('.html')) htmlFiles.push(full)
  }
}
walk(root)

const problems = []

// Ids the application renders at runtime. This file only sees the pre-hydration
// shell, so anchors into the React tree cannot be resolved statically.
const RUNTIME_IDS = new Set(['about', 'process', 'spaces', 'contact'])

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const rel = path.relative(root, file)

  // href/src/imagesrcset targets that are site-absolute or relative.
  const refs = new Set()
  for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.add(value)
  for (const [, value] of html.matchAll(/imagesrcset="([^"]+)"/g)) {
    for (const candidate of value.split(','))
      refs.add(candidate.trim().split(/\s+/)[0])
  }

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue

    if (ref.startsWith('#')) {
      const id = ref.slice(1)
      if (!id || RUNTIME_IDS.has(id)) continue
      if (!html.includes(`id="${id}"`))
        problems.push(`${rel}: anchor ${ref} has no matching id`)
      continue
    }

    const target = ref.startsWith('/')
      ? path.join(root, ref)
      : path.join(path.dirname(file), ref)

    if (!existsSync(target.split('?')[0]))
      problems.push(`${rel}: ${ref} does not exist in ${root}/`)
  }
}

// Anything referenced from the CSS bundle (fonts, background images).
for (const entry of readdirSync(path.join(root, 'assets'))) {
  if (!entry.endsWith('.css')) continue
  const css = readFileSync(path.join(root, 'assets', entry), 'utf8')
  for (const [, url] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (/^(https?:|data:)/.test(url)) continue
    const target = url.startsWith('/')
      ? path.join(root, url)
      : path.join(root, 'assets', url)
    if (!existsSync(target))
      problems.push(`assets/${entry}: url(${url}) does not exist`)
  }
}

if (problems.length) {
  console.error(`Broken references in ${root}/:\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

console.log(
  `No broken references. Checked ${htmlFiles.length} HTML file(s) in ${root}/.`
)
