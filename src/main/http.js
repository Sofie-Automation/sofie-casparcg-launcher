import express from 'express'
import path from 'path'
import serveIndex from 'serve-index'
import fs from 'fs'
import log from 'electron-log'

import { getBasePath } from './util'
import { serveIndexTemplate } from './serveIndex'

export class HttpMonitor {
  constructor(config, processes) {
    this.config = config
    this.processes = processes

    config.onDidChange('basePath', () => this.reinit())
    config.onDidChange('api.port', () => this.reinit())
    config.onDidChange('api.enable', () => this.reinit())
    config.onDidChange('api.staticPaths', () => this.reinit())
    config.onDidChange('api.processControl', () => this.reinit())
    this.init(true)
  }

  reinit() {
    if (this.server) {
      this.server.close(() => this.init(true))
    } else {
      this.init(false)
    }
  }

  stop() {
    if (this.server) {
      this.server.close()
    }
  }

  init() {
    if (!this.config.get('api.enable', false)) {
      this.server = null
      return
    }

    const app = express()

    if (this.config.get('api.processControl', false)) {
      app.get('/processes/:id', (req, res) => {
        const props = this.processes[req.params.id]
        if (!props) {
          return res.sendStatus(404)
        }

        res.send(props.currentStatus)
      })

      app.post('/processes/:id/stop', (req, res) => {
        const props = this.processes[req.params.id]
        if (!props) {
          return res.sendStatus(404)
        }

        log.info(`[${props.id}] received HTTP control message : stop`)

        props.stop()
        res.send({})
      })

      app.post('/processes/:id/start', (req, res) => {
        const props = this.processes[req.params.id]
        if (!props) {
          return res.sendStatus(404)
        }

        log.info(`[${props.id}] received HTTP control message : start`)

        props.start()
        res.send({})
      })

      app.post('/processes/:id/restart', (req, res) => {
        const props = this.processes[req.params.id]
        if (!props) {
          return res.sendStatus(404)
        }

        log.info(`[${props.id}] received HTTP control message : restart`)

        props.restart()
        res.send({})
      })

      app.get('/processes', (req, res) => {
        res.send(Object.keys(this.processes))
      })
    }

    // Bind any static paths from the host machine
    const staticPaths = this.config.get('api.staticPaths', [])
    if (staticPaths.length > 0) {
      let basePath = getBasePath(this.config)

      for (let p of staticPaths) {
        if (!path.isAbsolute(p.path)) {
          p.path = path.join(basePath, p.path)
        }

        const handlers = [
          express.static(p.path),
          serveIndex(p.path, {
            view: 'details',
            template: serveIndexTemplate,
          }),
        ]

        if (p.allowDelete) {
          // Add a handler for delete
          handlers.splice(0, 0, function (req, res, next) {
            if (req.method !== 'DELETE') {
              next()
              return
            }

            const fullPath = path.join(p.path, req.url)
            log.info('Deleting file: ' + fullPath)

            fs.unlink(fullPath, (err) => {
              if (err) {
                if (err.code === 'ENOENT') {
                  res.sendStatus(404)
                } else {
                  res.status(500)
                  res.send(err)
                }
                return
              }

              res.send('OK')
            })
          })
        }

        app.use('/' + p.name, handlers)
      }
    }

    const port = this.config.get('api.port', 8005)
    this.server = app.listen(port, () => console.log(`http api listening on port ${port}!`))
  }
}
