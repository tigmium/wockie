import elasticlunr from "elasticlunr/example/elasticlunr";

export default class {
  constructor(loadDocumentsService) {
    this.loadDocumentsService = loadDocumentsService;
  }
  async initializeIndex() {
    let index = await this.loadDocumentsService.loadDocuments()
    if (index === null) {
      index = elasticlunr(function () {
        this.addField('body');
        this.addField('title');
        this.addField('url');
        this.setRef('id');
      });
    }
    return index;
  }
}