/*
  Runs the a11y and perf harnesses against a real preview server.

  measure-perf.ts and audit-a11y.ts both default to http://localhost:4173 but
  neither starts anything, so on their own they only pass if someone happens
  to have a preview running. This owns that lifecycle so `pnpm run verify` is
  a gate rather than a suggestion.

  Usage: pnpm run verify
*/
import { spawn, type ChildProcess } from 'node:child_process'

const PORT = 4173
const BASE = `http://localhost:${PORT}/`

let preview: ChildProcess | null = null

function stopPreview() {
  if (!preview) return
  preview.kill('SIGTERM')
  preview = null
}

process.on('exit', stopPreview)
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    stopPreview()
    process.exit(130)
  })
}

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (r.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`preview server did not come up on ${BASE}`)
}

function run(label: string, args: string[]) {
  process.stderr.write(`\n── ${label} ──────────────────────────────\n`)
  return new Promise<void>((resolve, reject) => {
    const p = spawn(process.execPath, ['--experimental-strip-types', ...args, BASE], {
      stdio: 'inherit',
    })
    p.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${label} failed (exit ${code})`)),
    )
  })
}

preview = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
  stdio: 'ignore',
})

try {
  await waitForServer()
  await run('accessibility', ['tools/audit-a11y.ts'])
  await run('performance', ['tools/measure-perf.ts'])
  process.stderr.write('\nverify: all gates passed\n')
} catch (e) {
  process.stderr.write(`\nverify: ${e instanceof Error ? e.message : String(e)}\n`)
  stopPreview()
  process.exit(1)
} finally {
  stopPreview()
}
