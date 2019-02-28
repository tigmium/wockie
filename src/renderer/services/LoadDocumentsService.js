import storage from "electron-json-storage";
import elasticlunr from "elasticlunr/example/elasticlunr";

export default class {
  async loadDocuments() {
    return {
      en: await this.loadDocument('indexies', 'en'),
      jp: await this.loadDocument('indexies', 'jp'),
    };
  }

  async loadDocument(name, lang) {
    return new Promise((resolve, reject) => {
      const key = `${name}.${lang}`;
      storage.has(key, (e, hasKey) => {
        if (e) {
          reject(e);
          return;
        }

        if (hasKey) {
          storage.get(key, (e, docs) => {
            if (e) {
              reject(e);
            } else {
              const index = elasticlunr.Index.load(docs);
              if (lang !== null && lang !== 'en') {
                index.use(elasticlunr[lang]);
              }
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