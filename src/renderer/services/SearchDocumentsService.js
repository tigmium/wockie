export default class {
  constructor(index) {
    this.index = index;
  }

  searchDocuments(word) {
    let result = global.index.search(word, {
      fields: {
        body: {boost: 1}
      }
    });
    result = result.map(r => {
      const doc = global.index.documentStore.getDoc(r.ref);
      return Object.assign(r, {
        doc,
      });
    })
    return result;
  }
}