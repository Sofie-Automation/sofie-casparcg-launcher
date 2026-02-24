import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import Conf from 'conf'
import log from 'electron-log'
import fs from 'fs'
import path from 'path'
import OS from 'os'

import { ProcessMonitor } from './process.js'
import { HttpMonitor } from './http.js'
import { getExeDir, getLogsPath, getBasePath } from './util.js'

const isProduction = process.env.NODE_ENV !== 'development'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (isProduction) {
  global.__static = path.join(import.meta.dirname, '/static').replace(/\\/g, '\\\\')
}

log.transports.file.level = 'info'

process.on('uncaughtException', function (err) {
  log.error('uncaught exception: ', err.stack)
  // eslint-disable-next-line no-process-exit
  process.exit(1)
})

const config = new Conf({
  cwd: getExeDir(),
  configName: 'casparcg-launcher.config',
})

function updateLauncherLogFile() {
  const logBasePath = getLogsPath(config)
  try {
    fs.mkdirSync(logBasePath, { recursive: true })
  } catch (e) {
    // Ignore. It most likely already exists, otherwise below will fail just as well
  }

  const stream = fs.createWriteStream(path.join(logBasePath, 'launcher.log'), { flags: 'a' })
  stream.on('open', () => {
    log.transports.file.stream = stream
  })
  stream.on('error', (e) => {
    log.warn('Failed to update log path: ' + e)
  })
}
updateLauncherLogFile()
log.info('process started')
log.info(`OS uptime since ${new Date(Date.now() - OS.uptime() * 1000).toTimeString()}`)

console.log('Loading config from:', getExeDir())

// Simple versioning for config
const configVersion = config.get('version', 0)
if (configVersion < 1) {
  const processes = []
  processes.push({
    id: 'casparcg',
    name: 'CasparCG',
    exeName: 'casparcg.exe',
    args: config.get('args.casparcg', ''),
    env: [],
    health: config.get('health.casparcg', true) ? 'casparcg' : undefined,
    autoStart: true,
    sendCommands: 'utf16le',
  })
  processes.push({
    id: 'scanner',
    name: 'Media Scanner',
    exeName: 'scanner.exe',
    args: config.get('args.media-scanner', ''),
    env: [],
    autoStart: true,
    sendCommands: undefined,
  })

  if (config.store.exe) {
    const keys = Object.keys(config.store.exe)
    for (let k of keys) {
      processes.push({
        id: k,
        name: k,
        exeName: config.store.exe[k],
        args: config.get('args.' + k, ''),
        env: [],
      })
    }
  }

  config.set('processes', processes)
  config.set('version', 1)

  config.delete('args')
  config.delete('exe')
  config.delete('health')
}
if (configVersion < 2) {
  const processes = config.get('processes')
  for (let process of processes) {
    if (!('sendCommands' in process)) {
      if (process.id === 'scanner') {
        process.sendCommands = undefined
      } else {
        process.sendCommands = 'utf8'
      }
    }
  }

  config.set('processes', processes)
  config.set('version', 2)
}

let mainWindow
const winURL = !isProduction ? `http://localhost:9080` : `file://${import.meta.dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 768,
    useContentSize: true,
    width: !isProduction ? 1600 : 1024,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: false, // preload needs require('electron')
      nodeIntegration: false,
    },
  })

  if (isProduction) {
    mainWindow.removeMenu()
  }

  mainWindow.loadURL(winURL)

  mainWindow.on('close', (e) => {
    if (isProduction) {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?',
      })

      if (choice === 1) {
        e.preventDefault()
      }
    }

    log.info('shutting down')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    log.info('closed')
  })

  // Block new windows being opened on ctrl/shift/alt+click or middle-click
  // Note: this does stop navigation too, but is safer than forcing mainWindow to the new url
  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault()
  })

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('config', config.store)
    startupProcesses()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopProcesses()
    httpMonitor.stop()
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

class IpcWrapper {
  constructor(ipcIn, ipcOut) {
    this.ipcIn = ipcIn
    this.ipcOut = ipcOut
  }

  on(event, cb) {
    this.ipcIn.on(event, cb)
  }

  send(event, msg) {
    if (!this.ipcOut.isDestroyed()) {
      this.ipcOut.send(event, msg)
    }
  }
}

let processes = {}
let httpMonitor = new HttpMonitor(config, processes)

function startupProcesses() {
  log.info('Starting child processes')

  const wrapper = new IpcWrapper(ipcMain, mainWindow.webContents)
  wrapper.on('config.get', (e) => {
    e.sender.send('config', config.store)
  })
  wrapper.on('config.set', (e, arg) => {
    config.set(arg)
    e.sender.send('config', config.store)
  })

  wrapper.on('processes.get', (e) => {
    const data = config.get('processes', [])
    const procNames = []
    for (let proc of data) {
      procNames.push({ id: proc.id, name: proc.name || proc.id })
    }

    e.sender.send('processes.get', procNames)
  })

  wrapper.on('openPath', (e, pathId) => {
    try {
      log.info('openPath', pathId)
      if (pathId === 'logsPath') {
        shell.openPath(getLogsPath(config))
      } else if (pathId === 'basePath') {
        shell.openPath(getBasePath(config))
      }
    } catch (e) {
      log.error('Failed to openItem', e)
    }
  })

  function updateProcesses(data, oldData, coldStart = false) {
    const procNames = []

    for (let procData of data) {
      procNames.push({ id: procData.id, name: procData.name || procData.id })

      const procConfig = Object.assign(
        {
          basePath: getBasePath(config),
          logsPath: getLogsPath(config),
        },
        procData
      )

      if (!processes[procData.id]) {
        // Create new process
        processes[procData.id] = new ProcessMonitor(procData.id, wrapper, procConfig)
        if (!coldStart || procData.autoStart) {
          processes[procData.id].start()
        }
      } else {
        // Update running
        processes[procData.id].updateConfig(procConfig)
      }
    }

    for (let procData of oldData) {
      if (procNames.find((p) => p.id === procData.id)) continue // Still in use
      if (!processes[procData.id]) continue // Not in use

      processes[procData.id].stop()
      delete processes[procData.id]
    }

    wrapper.send('processes.get', procNames)
  }

  function updatePaths() {
    updateLauncherLogFile()

    const data = config.get('processes')
    updateProcesses(data, data)
  }

  config.onDidChange('processes', updateProcesses)
  config.onDidChange('basePath', updatePaths)
  config.onDidChange('logsPath', updatePaths)
  updateProcesses(config.get('processes'), [], true)
}

function stopProcesses() {
  for (let proc in processes) {
    processes[proc].stop()
  }
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
