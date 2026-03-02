/* eslint-disable n/no-unpublished-import, n/no-process-exit */
/**
 * Dev runner: starts the Vite renderer dev server then spawns Electron.
 * Watches src/main/** and restarts Electron when main-process files change.
 *
 * Usage: yarn dev
 */

import { createServer } from 'vite'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import { resolve } from 'path'
import chokidar from 'chokidar'

/* eslint-disable-next-line no-redeclare */
const require = createRequire(import.meta.url)
const electronBin = require('electron')
const ROOT = resolve(import.meta.dirname, '..')

let electronProcess = null
let restarting = false

async function main() {
	// ── 1. Start Vite renderer dev server ────────────────────────────────────────
	const server = await createServer({
		configFile: resolve(ROOT, 'vite.config.js'),
		mode: 'development',
	})

	await server.listen()
	server.printUrls()

	const address = server.httpServer.address()
	const port = typeof address === 'object' ? address.port : 9080
	const devServerUrl = `http://localhost:${port}`

	// ── 2. Electron spawn / restart helper ───────────────────────────────────────
	function spawnElectron() {
		electronProcess = spawn(electronBin, ['--inspect=5858', resolve(ROOT, 'src/main/index.dev.mjs')], {
			stdio: 'inherit',
			env: { ...process.env, NODE_ENV: 'development', VITE_DEV_SERVER_URL: devServerUrl },
		})

		electronProcess.on('close', (code) => {
			if (restarting) return
			// User closed the window — shut everything down
			server.close()
			process.exit(code ?? 0)
		})
	}

	spawnElectron()

	// ── 3. Watch main-process source and restart on changes ───────────────────────
	let debounceTimer = null

	chokidar.watch(resolve(ROOT, 'src/main'), { ignoreInitial: true }).on('all', (event, file) => {
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			console.log(`\n  [dev] main changed (${event}: ${file.replace(ROOT + '/', '')}) — restarting Electron...\n`)
			restarting = true
			electronProcess.kill()
			electronProcess.once('close', () => {
				restarting = false
				spawnElectron()
			})
		}, 300)
	})

	// ── 4. Lifecycle ──────────────────────────────────────────────────────────────
	const shutdown = () => {
		restarting = true // prevent exit-on-close triggering twice
		electronProcess?.kill()
		server.close()
		process.exit(0)
	}

	process.on('SIGINT', shutdown)
	process.on('SIGTERM', shutdown)
}

main().catch((err) => {
	console.error('[dev] fatal:', err)
	process.exit(1)
})
