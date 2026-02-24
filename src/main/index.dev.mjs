/* eslint-disable n/no-unpublished-import */
/**
 * ESM dev entry – replaces the broken index.dev.cjs.
 * Sets up electron-debug + vue-devtools before booting the main process.
 *
 * Used by scripts/dev-vite.mjs when running `yarn dev:vite`.
 */

import { app } from 'electron'

// Install electron-debug (opens DevTools automatically)
const { default: electronDebug } = await import('electron-debug')
electronDebug({ showDevTools: true })

// Install Vue 2 devtools once Electron is ready
app.on('ready', async () => {
	try {
		const { default: installExtension, VUEJS_DEVTOOLS } = await import('electron-devtools-installer')
		await installExtension(VUEJS_DEVTOOLS)
	} catch (err) {
		console.log('Unable to install vue-devtools:', err)
	}
})

// Boot the real main process
await import('./index.js')
