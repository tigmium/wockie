'use strict'

import {app, BrowserWindow, ipcMain} from 'electron'
import axios from 'axios'
import h2p from 'html2plaintext'
import elasticlunr from 'elasticlunr'
import getLinks from 'html-links'
import esr from 'escape-string-regexp'


const index = elasticlunr(function () {
  this.addField('body');
  this.setRef('id');
});

// const handle_axios_error = function (err) {
//
//   if (err.response) {
//     const custom_error = new Error(err.response.statusText || 'Internal server error');
//     custom_error.status = err.response.status || 500;
//     custom_error.description = err.response.data ? err.response.data.message : null;
//     throw custom_error;
//   }
//   throw new Error(err);
//
// }
// axios.interceptors.response.use(r => r, handle_axios_error);

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

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

ipcMain.on('asynchronous-message', (event, url) => {
  console.log('追加処理開始');
  const resp = axios({
    method: 'get',
    url: url,
    responseType: 'text'
  }).then(r => {
    const html = r.data;
    const doc = {
      id: index.documentStore.length,
      body: h2p(html)
    };
    index.addDoc(doc);
    console.log('追加完了');
    let links = getLinks({
      html,
      url,
    });
    links = links.filter(link => {
      const regexp = new RegExp('^' + esr(url));
      return regexp.test(link.normalized);
      // return true;
    });
    event.sender.send('asynchronous-reply', links)
  }).catch(e => {
    console.log(e)
  });
})

ipcMain.on('search', (event, word) => {
  const result = index.search(word, {
    fields: {
      body: {boost: 1}
    }
  });
  event.sender.send('search-end', result);
})
