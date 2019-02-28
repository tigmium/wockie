import storage from "electron-json-storage";

export default class {
  constructor(indexies) {
    this.indexies = indexies;
  }

  async saveDocuments() {
    await this.saveDocument('indexies', 'en');
    await this.saveDocument('indexies', 'jp');
  }

  async saveDocument(name, lang) {
    const key = `${name}.${lang}`;
    return new Promise((resolve, reject) => {
      storage.set(key, this.indexies[lang].toJSON(), e => {
        if (e) {
          reject(e);
        } else {
          resolve()
        }
      });
    })
  }
}