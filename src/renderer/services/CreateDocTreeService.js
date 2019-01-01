import Url from "url-parse";

export default {
  createDocTree(docs) {
    const tree = [];
    const indexCache = {};
    Object.keys(docs).forEach(key => {
        const doc = docs[key];
        const url = new Url(doc.url);
        const domain = url.host;

        if (indexCache[domain] === undefined) {
          const index = tree.length;
          tree.push({
            domain,
            documents: [
              doc
            ]
          });
          indexCache[domain] = index;
        } else {
          const index = indexCache[domain];
          tree[index].documents.push(doc);
        }
      }
    );
    return tree;
  }
}