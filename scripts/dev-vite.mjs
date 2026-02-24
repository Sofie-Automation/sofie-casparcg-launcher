/**
 * Vite-based dev runner.
 *
 * Usage:  yarn dev:vite
 *
 * 1. Starts the Vite renderer dev server on port 9080.
 * 2. Spawns Electron pointing at src/main/index.dev.mjs, which in turn
 *    connects to the Vite server at http://localhost:9080.
 */

import { createServer } from 'vite'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import { resolve } from 'path'

const require = createRequire(import.meta.url)

async function main() {
  // ── 1. Start Vite ────────────────────────────────────────────────────────────
  const server = await createServer({
    configFile: resolve(import.meta.dirname, '../vite.renderer.config.js'),
    mode: 'development',
  })

  await server.listen()
  server.printUrls()

  const address = server.httpServer.address()
  const port = typeof address === 'object' ? address.port : 9080
  console.log(`\n  [dev-vite] renderer dev server ready on http://localhost:${port}\n`)

  // ── 2. Spawn Electron ─────────────────────────────────────────────────────────
  // The `electron` package exports the path to the Electron binary.
  const electronBin = require('electron')

  const electronProcess = spawn(
    electronBin,
    [
      '--inspect=5858', // Node inspector for main process debugging
      resolve(import.meta.dirname, '../src/main/index.dev.mjs'),
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        // Pass the actual port in case it was altered by strictPort fallback
        VITE_DEV_SERVER_URL: `http://localhost:${port}`,
      },
    }
  )

  // ── 3. Lifecycle ──────────────────────────────────────────────────────────────
  electronProcess.on('close', (code) => {
    server.close()
    process.exit(code ?? 0)
  })

  const shutdown = () => {
    electronProcess.kill()
    server.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('[dev-vite] fatal:', err)
  process.exit(1)
})
