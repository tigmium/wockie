export default class {
  constructor(index, highlightMatchesService) {
    this.index = index;
    this.highlightService = highlightMatchesService;
  }

  searchDocuments(word) {
    let result = this.index.search(word, {
      fields: {
        body: {boost: 1}
      }
    });
    result = result.map(r => {
      const doc = this.index.documentStore.getDoc(r.ref);
      const highlight = this.highlightService.highlight(doc.body, word);
      return Object.assign(r, {
        doc,
        highlight,
      });
    })
    return result;
  }
}