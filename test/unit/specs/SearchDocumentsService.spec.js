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

    this.service = new SearchDocumentsService(this.index, new HighlightMatchesService());
  });

  it('searchDocuments', async function () {
    const query = 'dummy';
    const result = this.service.searchDocuments(query);
    assert.equal(result, '');
  })
})