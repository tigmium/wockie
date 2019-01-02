import axios from "axios";
import getLinks from "html-links";
import esr from "escape-string-regexp";
import cheerio from "cheerio";
import h2p from "html2plaintext";

const convertDoc = (id, url, html) => {
  const $ = cheerio.load(html);
  const title = $('title').text();
  return {
    id,
    body: h2p(html),
    title,
    url,
  };
}

export default class {
  constructor(index) {
    this.index = index;
  }

  async importDocuments(url) {
    const resp = await axios({
      method: 'get',
      url: url,
      responseType: 'text'
    })
    const html = resp.data;
    const id = this.index.documentStore.length;
    const doc = convertDoc(id, url, html);
    this.index.addDoc(doc);
    let links = getLinks({
      html,
      url,
    });
    links = links.filter(link => {
      const regexp = new RegExp('^' + esr(url));
      return regexp.test(link.normalized);
      // return true;
    });
    await Promise.all(links.map(link => {
      return new Promise(async (resolve, reject) => {
        const url = link.normalized;
        const resp = await axios({
          method: 'get',
          url: url,
          responseType: 'text'
        });
        const html = resp.data;
        const id = this.index.documentStore.length;
        const doc = convertDoc(id, url, html);
        this.index.addDoc(doc);
        resolve();
      });
    }));
  }
}