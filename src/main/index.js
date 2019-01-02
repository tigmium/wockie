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
    id: global.index.documentStore.length,
    body: h2p(html),
    title,
    url,
  };
  global.index.addDoc(doc);
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
        id: global.index.documentStore.length,
        body: h2p(html),
        title,
        url,
      };
      global.index.addDoc(doc);
      resolve();
    });
  }));

  await saveDocuments();

  event.sender.send('update-documents', CreateDocTreeService.createDocTree(global.index.documentStore.docs))
})

ipcMain.on('search', (event, word) => {
  let result = global.index.search(word, {
    fields: {
      body: {boost: 1}
    }
  });
  result = result.map(r => {
    const doc = global.index.documentStore.getDoc(r.ref);
    return Object.assign(r, {
      doc,
    });
  })
  event.sender.send('search-end', result);
})

const saveDocuments = async () => {
  return new Promise((resolve, reject) => {
    storage.set('documents', global.index.toJSON(), e => {
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
    storage.has('documents', (e, hasKey) => {
      if (e) {
        reject(e);
        return;
      }

      if (hasKey) {
        storage.get('documents', (e, docs) => {
          if (e) {
            reject(e);
          } else {
            const index = elasticlunr.Index.load(docs);
            resolve(index);
          }
        });
      } else {
        resolve(null);
      }
    })
  });
}

ipcMain.on('save-documents', async (event) => {
  await saveDocuments();
  event.sender.send('save-documents-end');
})

ipcMain.on('load-documents', async (event) => {
  let index = await loadDocuments()
  if (index === null) {
    index = elasticlunr(function () {
      this.addField('body');
      this.addField('title');
      this.addField('url');
      this.setRef('id');
    });
  }
  global.index = index;

  event.sender.send('load-documents-end', CreateDocTreeService.createDocTree(index.documentStore.docs));
})