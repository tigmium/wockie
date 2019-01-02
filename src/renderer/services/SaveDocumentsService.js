import storage from "electron-json-storage";

export default class {
  constructor(index) {
    this.index = index;
  }

  async saveDocuments() {
    return new Promise((resolve, reject) => {
      storage.set('documents', this.index.toJSON(), e => {
        if (e) {
          reject(e);
        } else {
          resolve()
        }
      });
    })
  }
}