import SearchDocumentsService from '../../../src/renderer/services/SearchDocumentsService';
import InitializeIndexService from "../../../src/renderer/services/InitializeIndexService";
import HighlightMatchesService from "../../../src/renderer/services/HighlightMatchesService";

const assert = require('assert');

describe('SearchDocumentsService.js', () => {
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
      body: "apple",
      title: "block",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/"
    });
    this.index.addDoc({
      id: 1,
      body: "aaaaaaaaa\nbbbbbbbbbb\ncccccccc\n   \ndummy\n  \nddd\n\teeeeeeeeee",
      title: "data",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/using_css_frameworks.html"
    });
    this.index.addDoc({
      id: 2,
      body: "fish",
      title: "google",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/savingreading-local-files.html"
    });
    this.index.addDoc({
      id: 3,
      body: "ddd",
      title: "data",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/using_css_frameworks.html"
    });

    this.service = new SearchDocumentsService(this.index, new HighlightMatchesService());
  });

  it('searchDocuments_正常完了', async function () {
    const query = 'dummy';
    const result = this.service.searchDocuments(query);
    assert.equal(result[0].ref, '1');
  })

  it('searchDocuments_AND検索', async function () {
    const query = 'ddd dummy';
    const result = this.service.searchDocuments(query, 'AND');
    assert.equal(result[0].ref, '1');
    assert.equal(result.length, 1);
  })

  it('searchDocuments_OR検索', async function () {
    const query = 'ddd dummy';
    const result = this.service.searchDocuments(query, 'OR');
    assert.equal(result.length, 2);
  })

  it('searchDocuments_日本語検索', async function () {
    const initializeService = new InitializeIndexService(mockLoadService);
    this.index = await initializeService.initializeIndex('jp');

    this.index.addDoc({
      id: 0,
      body: "みかん　りんご　ごま",
      title: "砂糖",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/"
    });
    this.index.addDoc({
      id: 1,
      body: "aaaaaaaaa\nbbbbbbbbbb\ncccccccc\n   \ndummy\n  \nddd\n\teeeeeeeeee",
      title: "塩　胡椒",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/using_css_frameworks.html"
    });
    this.index.addDoc({
      id: 2,
      body: "ごま油",
      title: "google",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/savingreading-local-files.html"
    });
    this.index.addDoc({
      id: 3,
      body: "メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。",
      title: "data",
      url: "https://simulatedgreg.gitbooks.io/electron-vue/content/ja/using_css_frameworks.html"
    });

    const query = '邪知暴虐 胡椒';
    const service = new SearchDocumentsService(this.index, new HighlightMatchesService());
    const result = service.searchDocuments(query, 'OR');
    console.log(result);
    assert.equal(result.length, 2);
  });
})