const {performance} = require('perf_hooks');

export default class {
  constructor(index) {
    this.index = index;
  }

  deleteDocument(doc) {
    this.index.removeDoc(doc);
  }

  deleteDocuments(docs) {
    for (let doc of docs) {
      this.index.removeDoc(doc);
    }
  }
}