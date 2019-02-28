'use strict'

import {app, BrowserWindow, ipcMain} from 'electron'
import CreateDocTreeService from '../renderer/services/CreateDocTreeService'
import ImportDocumentsService from '../renderer/services/ImportDocumentsService';
import SearchDocumentsService from '../renderer/services/SearchDocumentsService';
import SaveDocumentsService from '../renderer/services/SaveDocumentsService';
import LoadDocumentsService from '../renderer/services/LoadDocumentsService';
import InitializeIndexService from "../renderer/services/InitializeIndexService";
import HighlightMatchesService from "../renderer/services/HighlightMatchesService"
import DeleteDocumentService from "../renderer/services/DeleteDocumentService"

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

ipcMain.on('asynchronous-message', async (event, url, maxDepth, filter) => {
  const importService = new ImportDocumentsService(global.indexies);
  const saveService = new SaveDocumentsService(global.indexies);

  await importService.importDocuments(url, maxDepth, filter, (progress) => {
    event.sender.send('update-import-progress', progress);
  });
  await saveService.saveDocuments();

  event.sender.send('update-documents', CreateDocTreeService.createDocTree(global.indexies.en.documentStore.docs));
  event.sender.send('finish-import-progress');
})

ipcMain.on('search', (event, word, bool, lang) => {
  const highlightService = new HighlightMatchesService();
  const searchService = new SearchDocumentsService(global.indexies, highlightService);
  const result = searchService.searchDocuments(word, bool, lang);
  event.sender.send('search-end', result);
})

ipcMain.on('save-documents', async (event) => {
  // TODO 未使用のため削除
  // await saveDocuments();
  event.sender.send('save-documents-end');
})

ipcMain.on('load-documents', async (event) => {
  const loadService = new LoadDocumentsService();
  const initializeService = new InitializeIndexService(loadService);
  const indexies = await initializeService.initializeIndexies();
  global.indexies = indexies;
  event.sender.send('load-documents-end', CreateDocTreeService.createDocTree(indexies.en.documentStore.docs));
})

ipcMain.on('delete-document', async (event, doc) => {
  const deleteService = new DeleteDocumentService(global.indexies);
  const saveService = new SaveDocumentsService(global.indexies);

  deleteService.deleteDocument(doc);
  await saveService.saveDocuments();

  event.sender.send('update-documents', CreateDocTreeService.createDocTree(global.indexies.en.documentStore.docs));
});

ipcMain.on('delete-documents', async (event, docs) => {
  const deleteService = new DeleteDocumentService(global.indexies);
  const saveService = new SaveDocumentsService(global.indexies);

  deleteService.deleteDocuments(docs);
  await saveService.saveDocuments();

  event.sender.send('update-documents', CreateDocTreeService.createDocTree(global.indexies.en.documentStore.docs));
});