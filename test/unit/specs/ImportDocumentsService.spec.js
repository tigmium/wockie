import ImportDocumentsService from '../../../src/renderer/services/ImportDocumentsService'
import InitializeIndexService from "../../../src/renderer/services/InitializeIndexService";

const assert = require('assert');

describe('ImportDocumentsService.js', () => {
  const mockLoadService = {
    loadDocuments: () => {
      return null;
    }
  };

  before(async function () {
    const initializeService = new InitializeIndexService(mockLoadService);
    this.index = await initializeService.initializeIndex();

    this.index.addDoc({
      id: 0,
      body: "導入 · electron-vue                         \n\n- elec…  results matching  \n\n   No results matching ",
      title: "導入 · electron-vue",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/"
    });
    this.index.addDoc({
      id: 1,
      body: "CSS フレームワークの使用 · electron-vue                     …  results matching  \n\n   No results matching ",
      title: "CSS フレームワークの使用 · electron-vue",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/using_css_frameworks.html"
    });
    this.index.addDoc({
      id: 2,
      body: "ローカルファイルの読み書き · electron-vue                      …  results matching  \n\n   No results matching ",
      title: "ローカルファイルの読み書き · electron-vue",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/savingreading-local-files.html"
    });

    this.service = new ImportDocumentsService(this.index);
  });

  const checkDuplication = (index) => {
    const titles = [];
    const docs = index.documentStore.docs;
    for (let key of Object.keys(docs)) {
      const doc = docs[key];
      if (titles.includes(doc.title)) {
        throw new Error('重複した文書が見つかりました。title=' + doc.title);
      } else {
        titles.push(doc.title);
      }
    }
    return false;
  };

  it('aaa', async function () {
    const url = 'https://simulatedgreg.gitbooks.io/electron-vue/content/ja/';
    const maxDepth = 1;
    const filter = url;
    const progressCb = null;
    await this.service.importDocuments(url, maxDepth, filter, progressCb);
    checkDuplication(this.index);
  })
})