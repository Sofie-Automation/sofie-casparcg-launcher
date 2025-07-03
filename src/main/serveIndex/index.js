import fs from 'fs'
import * as escapeHtml from 'escape-html'
import prettyBytes from 'pretty-bytes'

import path, { normalize, sep } from 'path'

export const serveIndexTemplate = (locals, callback) => {
  fs.readFile(path.join(__dirname, '../../../static/directory.html'), 'utf8', (err, str) => {
    if (err) {
      return callback(err)
    }
    const html = str
      .replace(/\{\{style\}\}/g, locals.style)
      .replace(/\{\{linked-path\}\}/g, htmlPath(locals.directory))
      .replace(/\{\{directory\}\}/g, locals.directory)
      .replace(/\{\{files\}\}/g, createHtmlFileList(locals.fileList, locals.directory, locals.viewName))
    callback(err, html)
  })
}

function htmlPath(dir) {
  var parts = dir.split('/')
  var crumb = new Array(parts.length)

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i]

    if (part) {
      parts[i] = encodeURIComponent(part)
      crumb[i] = '<a href="' + escapeHtml(parts.slice(0, i + 1).join('/')) + '">' + escapeHtml(part) + '</a>'
    }
  }

  return crumb.join(' / ')
}

function createHtmlFileList(files, dir, view) {
  var html =
    '<ul id="files" class="view-' +
    escapeHtml(view) +
    '">' +
    (view === 'details'
      ? '<li id="header" class="header">' +
        '<span class="name">Name</span>' +
        '<span class="size">Size</span>' +
        '<span class="date">Modified</span>' +
        '</li>'
      : '')

  html += files
    .map(function (file) {
      var classes = []
      var isDir = file.stat && file.stat.isDirectory()
      var path = dir.split('/').map(function (c) {
        return encodeURIComponent(c)
      })

      path.push(encodeURIComponent(file.name))

      var dateRaw = file.stat && file.name !== '..' ? file.stat.mtime.getTime() : ''
      var date =
        file.stat && file.name !== '..'
          ? file.stat.mtime.toISOString().split('T')[0] +
            ' ' +
            file.stat.mtime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
          : ''
      var sizeBytes = file.stat && !isDir ? file.stat.size : ''
      var size = file.stat && !isDir ? prettyBytes(file.stat.size) : ''

      return (
        '<li' +
        (isDir ? ' class="directory"' : '') +
        '><a href="' +
        escapeHtml(normalizeSlashes(normalize(path.join('/')))) +
        '" class="' +
        escapeHtml(classes.join(' ')) +
        '"' +
        ' title="' +
        escapeHtml(file.name) +
        '">' +
        '<span class="name">' +
        escapeHtml(file.name) +
        '</span>' +
        '<span class="size" data-bytes="' +
        escapeHtml(sizeBytes) +
        '">' +
        escapeHtml(size) +
        '</span>' +
        '<span class="date" data-timestamp="' +
        escapeHtml(dateRaw) +
        '">' +
        escapeHtml(date) +
        '</span>' +
        '</a></li>'
      )
    })
    .join('\n')

  html += '</ul>'

  return html
}

function normalizeSlashes(path) {
  return path.split(sep).join('/')
}
