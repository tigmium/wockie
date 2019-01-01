'use strict'

import {app, BrowserWindow, ipcMain} from 'electron'
import axios from 'axios'
import h2p from 'html2plaintext'
import elasticlunr from 'elasticlunr'
import getLinks from 'html-links'
import esr from 'escape-string-regexp'
import cheerio from 'cheerio'
import CreateDocTreeService from '../renderer/services/CreateDocTreeService'
import storage from 'electron-json-storage'

const index = elasticlunr(function () {
  this.addField('body');
  this.addField('title');
  this.addField('url');
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

ipcMain.on('asynchronous-message', async (event, url) => {
  event.sender.send('log', 'get web page: ' + url);
  const resp = await axios({
    method: 'get',
    url: url,
    responseType: 'text'
  })
  const html = resp.data;
  const $ = cheerio.load(html);
  const title = $('title').text();
  const doc = {
    id: index.documentStore.length,
    body: h2p(html),
    title,
    url,
  };
  index.addDoc(doc);
  let links = getLinks({
    html,
    url,
  });
  links = links.filter(link => {
    const regexp = new RegExp('^' + esr(url));
    return regexp.test(link.normalized);
    // return true;
  });
  event.sender.send('log', links)

  await Promise.all(links.map(link => {
    return new Promise(async (resolve, reject) => {
      const url = link.normalized;
      const resp = await axios({
        method: 'get',
        url: url,
        responseType: 'text'
      });
      const html = resp.data;
      const $ = cheerio.load(html);
      const title = $('title').text();
      const doc = {
        id: index.documentStore.length,
        body: h2p(html),
        title,
        url,
      };
      index.addDoc(doc);
      resolve();
    });
  }));

  await saveDocuments();

  event.sender.send('update-documents', CreateDocTreeService.createDocTree(index.documentStore.docs))
})

ipcMain.on('search', (event, word) => {
  let result = index.search(word, {
    fields: {
      body: {boost: 1}
    }
  });
  result = result.map(r => {
    const doc = index.documentStore.getDoc(r.ref);
    return Object.assign(doc, r);
  });
  event.sender.send('search-end', result);
})

const saveDocuments = async () => {
  return new Promise((resolve, reject) => {
    const docs = index.documentStore.toJSON();

    storage.set('documents', docs, e => {
      if (e) {
        reject(e);
      } else {
        resolve()
      }
    });
  })
}

const loadDocuments = async () => {
  return new Promise((resolve, reject) => {
    storage.has('documents', (e, hasKye) => {
      console.log('1')
      if (e) {
        reject(e);
        return;
      }

      if (hasKye) {
        storage.get('documents', (e, docs) => {
          if (e) {
            reject(e);
          } else {
            index.documentStore = elasticlunr.DocumentStore.load(docs);
            resolve();
          }
        });
      } else {
        resolve();
      }
    })
  });
}

ipcMain.on('save-documents', async (event) => {
  await saveDocuments();
  event.sender.send('save-documents-end');
})

ipcMain.on('load-documents', async (event) => {
  await loadDocuments();
  event.sender.send('load-documents-end', CreateDocTreeService.createDocTree(index.documentStore.docs));
})