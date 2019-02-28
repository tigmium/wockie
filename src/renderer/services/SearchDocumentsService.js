export default class {
  constructor(indexies, highlightMatchesService) {
    this.indexies = indexies;
    this.highlightService = highlightMatchesService;
  }

  searchDocuments(word, bool = 'AND', lang = 'en') {
    console.log('%s, %s, %s', word, bool, lang);
    const index = this.indexies[lang];
    let result = index.search(word, {
      fields: {
        body: {boost: 1}
      },
      bool,
    });
    result = result.map(r => {
      const doc = index.documentStore.getDoc(r.ref);
      const highlight = this.highlightService.highlight(doc.body, word);
      return Object.assign(r, {
        doc,
        highlight,
      });
    })
    return result;
  }
}