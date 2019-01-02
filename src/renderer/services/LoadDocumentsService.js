import storage from "electron-json-storage";
import elasticlunr from "elasticlunr/example/elasticlunr";

export default class {
  constructor(index) {
    this.index = index;
  }

  async loadDocuments() {
    return new Promise((resolve, reject) => {
      storage.has('documents', (e, hasKey) => {
        if (e) {
          reject(e);
          return;
        }

        if (hasKey) {
          storage.get('documents', (e, docs) => {
            if (e) {
              reject(e);
            } else {
              const index = elasticlunr.Index.load(docs);
              resolve(index);
            }
          });
        } else {
          resolve(null);
        }
      })
    });
  }
}