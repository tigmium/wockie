const {performance} = require('perf_hooks');

export default class {
  constructor(indexies) {
    this.indexies = indexies;
  }

  deleteDocument(doc) {
    this.indexies.en.removeDoc(doc);
    this.indexies.jp.removeDoc(doc);
  }

  deleteDocuments(docs) {
    for (let doc of docs) {
      this.indexies.en.removeDoc(doc);
      this.indexies.jp.removeDoc(doc);
    }
  }
}