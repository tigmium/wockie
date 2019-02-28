import elasticlunr from "elasticlunr/example/elasticlunr";
import tmp from '../libraries/lunr.stemmer.support.js';
import tmp2 from '../libraries/lunr.jp.js';

tmp(elasticlunr);
tmp2(elasticlunr);

export default class {
  constructor(loadDocumentsService) {
    this.loadDocumentsService = loadDocumentsService;
  }

  async initializeIndexies() {
    let indexies = await this.loadDocumentsService.loadDocuments();
    if (indexies.en === null) {
      indexies = {
        en: await this.initializeIndex('en'),
        jp: await this.initializeIndex('jp')
      }
    }
    return indexies;
  }

  async initializeIndex(lang = null) {
    let index = await this.loadDocumentsService.loadDocument('indexies', lang);
    if (index === null) {
      index = elasticlunr(function () {
        if (lang !== null && lang !== 'en') {
          this.use(elasticlunr[lang]);
        }
        this.addField('body');
        this.addField('title');
        this.addField('url');
        this.setRef('id');
      });
    }
    return index;
  }
}