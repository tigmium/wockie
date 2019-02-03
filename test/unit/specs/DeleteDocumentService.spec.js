import DeleteDocumentService from '../../../src/renderer/services/DeleteDocumentService'
import InitializeIndexService from "../../../src/renderer/services/InitializeIndexService";

const assert = require('assert');

describe('DeleteDocumentService.js', () => {
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

    this.service = new DeleteDocumentService(this.index);
  });

  it('deleteDocument', function () {
    const doc = {
      id: 2,
      body: "ローカルファイルの読み書き · electron-vue                      …  results matching  \n\n   No results matching ",
      title: "ローカルファイルの読み書き · electron-vue",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/savingreading-local-files.html"
    };
    this.service.deleteDocument(doc);
    const docs = this.index.documentStore.docs;
    const cnt = Object.keys(docs).length;
    assert.equal(cnt, 2);
  });

  it('deleteDocuments', function () {
    const removeDocs = [{
      id: 2,
      body: "ローカルファイルの読み書き · electron-vue                      …  results matching  \n\n   No results matching ",
      title: "ローカルファイルの読み書き · electron-vue",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/savingreading-local-files.html"
    }, {
      id: 0,
      body: "導入 · electron-vue                         \n\n- elec…  results matching  \n\n   No results matching ",
      title: "導入 · electron-vue",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/"
    }];
    this.service.deleteDocuments(removeDocs);
    const docs = this.index.documentStore.docs;
    const cnt = Object.keys(docs).length;
    assert.equal(cnt, 1);
  });
})