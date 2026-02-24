'use strict'

const { contextBridge, ipcRenderer } = require('electron')

/**
 * Expose a safe IPC bridge to the renderer via contextBridge.
 *
 * The renderer is fully isolated (contextIsolation: true, nodeIntegration: false)
 * and can only reach the main process through this surface.
 *
 * Note: IpcRendererEvent is intentionally stripped from callbacks –
 * listeners receive only the payload arguments.
 */
contextBridge.exposeInMainWorld('electronAPI', {
	on(channel, callback) {
		// TODO - do we need to be able to remove listeners?
		ipcRenderer.on(channel, (_event, ...args) => callback(...args))
	},

	send(channel, ...args) {
		ipcRenderer.send(channel, ...args)
	},
})
