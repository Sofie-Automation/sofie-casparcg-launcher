import net from 'net'
import log from 'electron-log'

const startupDelay = 5000
const pingInterval = 5000
const pingTimeout = 12000 // 2 pings

export class CasparCGHealthMonitor {
	constructor(procMon) {
		this.procMon = procMon
	}

	start() {
		if (!this.procMon) {
			return
		}

		log.info('[' + this.procMon.id + '] starting healthcheck')

		this.client = new net.Socket()
		setTimeout(() => {
			this.client.connect(5250, '127.0.0.1', () => this.startPingTimer())

			this.client.on('close', () => {
				log.info('[' + this.procMon.id + '] ping connection closed')
				this.stopPingTimer()

				if (this.interval && this.procMon.running()) {
					this.procMon.stop(() => this.procMon.start())
				}
			})
			this.client.on('data', (_d) => {
				// We don't care what we got, this proves caspar is alive and responding
				this.lastReceived = Date.now()
			})
			this.client.on('error', (e) => {
				log.error('[' + this.procMon.id + '] ' + e)
				if (this.interval && this.procMon.running()) {
					this.procMon.stop(() => this.procMon.start())
				}
			})
		}, startupDelay)
	}

	startPingTimer() {
		if (this.interval) {
			return
		}

		log.info('[' + this.procMon.id + '] ping timer starting')

		this.lastReceived = Date.now()
		this.lastSent = Date.now()

		this.interval = setInterval(() => {
			if (Date.now() - this.lastSent > pingTimeout) {
				log.warn('[' + this.procMon.id + '] time skipped by ' + (Date.now() - this.lastSent))
			} else if (this.lastSent - this.lastReceived > pingTimeout) {
				log.warn('[' + this.procMon.id + '] ping timeout after ' + (this.lastSent - this.lastReceived))
				this.procMon.pipeLog('log', '[error] ping timeout after ' + (this.lastSent - this.lastReceived))
				this.procMon.stop(() => this.procMon.start())
				return
			}

			this.lastSent = Date.now()
			this.client.write('PING\r\n')
		}, pingInterval)
	}

	stopPingTimer() {
		if (this.interval) {
			clearInterval(this.interval)
			this.interval = undefined
		}
	}

	stop() {
		this.stopPingTimer()

		if (!this.client) {
			return
		}

		log.info('[' + this.procMon.id + '] stopping healthcheck')

		this.client.end()
	}
}
