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
    this.service = new ImportDocumentsService(this.index);
  });

  it('aaa', async function () {
    await this.service.importDocuments('https://buefy.github.io/documentation');
  })
})