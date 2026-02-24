import log from 'electron-log'
import respawn from './respawn/index.cjs'
import path from 'path'
import fs from 'fs'
import { parseArgsStringToArgv } from 'string-argv'
import equal from 'deep-equal'

import { CasparCGHealthMonitor } from './casparcg.js'

export class ProcessMonitor {
	constructor(id, ipcWrapper, config) {
		this.id = id
		this.ipcWrapper = ipcWrapper
		this.currentStatus = 'stopped'
		this.restarting = false

		this.ipcWrapper.on(this.id + '.control', (sender, cmd, param) => {
			log.info('[' + this.id + '] Got process control command : ' + cmd)
			if (cmd === 'stop') {
				this.stop()
			} else if (cmd === 'start') {
				this.start()
			} else if (cmd === 'restart') {
				this.restart()
			} else if (cmd === 'command') {
				this.sendCommand(param)
			}
		})

		this.updateConfig(config)
	}

	updateConfig(newConfig) {
		const changed = !equal(newConfig, this.config)

		this.config = newConfig
		this.config.exeName = this.config.exeName || ''

		this.logFile = !!this.config.logMode

		this.pipeStatus(this.currentStatus) // update showSendCommand

		if (changed) {
			if (this.healthMon) {
				this.healthMon.stop()
				this.healthMon = undefined
			}

			switch (this.config.health) {
				case 'casparcg':
					this.healthMon = new CasparCGHealthMonitor(this)
					break
			}

			this.reinit()
		}
	}

	reinit() {
		const restart = this.running()
		if (this.process) {
			this.process.stop(() => this.init(restart))
		} else {
			this.init(false)
		}
	}

	init(start) {
		const basePath = this.config.basePath

		let procPath = this.config.exeName
		if (!path.isAbsolute(procPath)) {
			procPath = path.join(basePath, procPath)
		}

		log.info(`[${this.id}] Booting Process ${procPath}`)

		let fileExists
		try {
			const exeStat = fs.statSync(procPath)
			fileExists = exeStat.isFile()
		} catch (_e) {
			fileExists = false
		}
		if (!fileExists) {
			log.info('[' + this.id + '] Executable does not exist: ' + procPath)
			this.pipeLog('event', '== Executable does not exist ==')
			this.pipeStatus('failed')
			return
		}

		const cwd = path.dirname(procPath)
		const exeName = path.basename(procPath)
		const args = this.config.args || ''
		this.process = respawn([exeName].concat(parseArgsStringToArgv(args)), {
			cwd,
			env: this.config.env ? Object.fromEntries(this.config.env.map((obj) => [obj.id, obj.value])) : undefined,
			// On POSIX, spawn as a new process group leader so that a single
			// process.kill(-pid, signal) from the SIGTERM handler reaches the
			// entire child process tree (grandchildren included). On Windows,
			// respawn already uses "taskkill /T /F" to kill the full tree.
			detached: process.platform !== 'win32',
		})

		this.process.on('start', () => {
			if (this.healthMon) {
				this.healthMon.start()
			}

			this.restarting = false
			log.info('[' + this.id + '] ' + this.config.exeName + ' start')
			this.pipeLog('event', '== Process has started ==')
			this.pipeStatus('running')
		})
		this.process.on('stdout', (data) => {
			this.pipeLog('log', data)
		})
		this.process.on('stderr', (data) => {
			this.pipeLog('log', data)
		})
		this.process.on('stop', () => {
			log.info('[' + this.id + '] ' + this.config.exeName + ' stop')
			if (this.healthMon) {
				this.healthMon.stop()
			}

			this.pipeLog('event', '== Process has stopped ==')
			this.pipeStatus('stopped')
		})
		this.process.on('crash', () => {
			log.info('[' + this.id + '] ' + this.config.exeName + ' crash')
			this.pipeLog('event', '== Process has crashed ==')
		})
		this.process.on('sleep', () => {
			log.info('[' + this.id + '] ' + this.config.exeName + ' sleep')
			this.pipeLog('event', '== Process is sleeping ==')
		})
		this.process.on('spawn', (process) => {
			log.info('[' + this.id + '] ' + this.config.exeName + ' spawn ' + process.pid)
			this.pipeLog('event', '== Process is starting ==')

			// Cancel any pending startup commands from a previous spawn
			clearTimeout(this._startupCommandsTimeout)
			this._startupCommandsTimeout = undefined

			const startupCommands = this.config.startupCommands
			if (startupCommands && this.config.sendCommands) {
				const commands = startupCommands
					.split('\n')
					.map((l) => l.trim())
					.filter((l) => l.length > 0)
				if (commands.length > 0) {
					const delay = this.config.startupCommandsDelay || 0
					this._startupCommandsTimeout = setTimeout(() => {
						this._startupCommandsTimeout = undefined
						if (this.running()) {
							log.info('[' + this.id + '] Sending ' + commands.length + ' startup command(s) (delay: ' + delay + 'ms)')
							this.pipeLog('event', '== Sending startup commands ==')
							for (const cmd of commands) {
								this.sendCommand(cmd)
							}
						}
					}, delay)
				}
			}
		})
		this.process.on('exit', (code, signal) => {
			log.info('[' + this.id + '] ' + this.config.exeName + ' exit ' + code + ' ' + signal)

			clearTimeout(this._startupCommandsTimeout)
			this._startupCommandsTimeout = undefined

			this.pipeLog('event', '== Process has exited with code ' + code + ' ==')
		})

		if (start) {
			this.process.start()
		}
	}

	running() {
		return this.process && this.process.status === 'running'
	}

	start() {
		this.restarting = false
		if (this.process) {
			this.process.start()
		}
	}

	stop(cb) {
		this.restarting = false
		if (this.process) {
			this.process.stop(cb)
		}
	}

	/** Synchronously kill the child process tree without waiting for ps-tree. */
	killSync() {
		if (this.process) {
			this.process.killSync()
		}
	}

	restart() {
		if (this.restarting) {
			log.info('[' + this.id + '] attempt to restart whilst already restarting')
			this.pipeLog('log', 'attempt to restart whilst already restarting')
		} else {
			this.restarting = true
			this.stop(() => {
				setTimeout(() => this.start(), 1000) // Slightly delay restart to defend against multiple retries from core
			})
		}
	}

	sendCommand(command) {
		let sendCommandFormat = this.config.sendCommands
		if (this.process && sendCommandFormat) {
			if (process.platform === 'linux' && sendCommandFormat === 'utf16le') {
				sendCommandFormat = 'utf8' // CasparCG uses utf8 on linux utf16le
			}

			this.process.write(command, sendCommandFormat)
		}
	}

	pipeLog(type, msg) {
		let content = [msg.toString()]

		if (type === 'log') {
			content = content[0].trim().split('\n')
		}

		content.forEach((l) => {
			this.ipcWrapper.send(
				'process.log',
				JSON.stringify({
					id: this.id,
					data: {
						type: type,
						content: l,
					},
				})
			)
		})

		this.ensureLogFileHandleCorrect()
		if (this.logFileStream) {
			let fullMsg = msg.toString()
			if (type === 'event') {
				fullMsg += '\r\n'
			}

			this.logFileStream.write(fullMsg)
		}
	}
	pipeStatus(status) {
		this.currentStatus = status
		this.ipcWrapper.send(
			'process.status',
			JSON.stringify({
				id: this.id,
				status: status,
				showCommandSend: !!this.config.sendCommands,
			})
		)
	}

	ensureLogFileHandleCorrect() {
		try {
			if (!this.logFile) {
				if (this.logFileStream) {
					this.logFileStream.end()
					this.logFileStream = undefined
					log.info('[' + this.id + '] Closed log')
				}
				return
			}

			const now = new Date()
			const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
				now.getDate()
			).padStart(2, '0')}`
			const targetName = this.config.name + '_' + dateStr + '.log'
			if (targetName === this.logFile) {
				// Correct handle already open
				return
			}

			// Need to update file handle
			if (this.logFileStream) {
				this.logFileStream.end()
				this.logFileStream = undefined
				log.info('[' + this.id + '] Closed log')
			}

			// Ensure folder exists
			const logBasePath = this.config.logsPath
			try {
				fs.mkdirSync(logBasePath, { recursive: true })
			} catch (_e) {
				// Ignore. It most likely already exists, otherwise below will fail just as well
			}

			// Open new file
			const logPath = path.join(logBasePath, targetName)
			this.logFileStream = fs.createWriteStream(logPath, { flags: 'a' })
			this.logFileStream.on('error', (e) => {
				log.warn('[' + this.id + '] Failed to open log. Log data will be discarded: ' + e)
			})
			this.logFile = targetName
			log.info('[' + this.id + '] Opened log: ' + targetName)
		} catch (e) {
			log.error('[' + this.id + '] Failed to write log: ' + e)
		}
	}
}
