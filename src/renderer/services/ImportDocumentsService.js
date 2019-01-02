import axios from "axios";
import parseLinks from "html-links";
import esr from "escape-string-regexp";
import cheerio from "cheerio";
import h2p from "html2plaintext";

export default class {
  constructor(index) {
    this.index = index;
  }

  async importDocuments(url) {
    await this.fetchUrl(url, 1);
  }

  async fetchUrl(url, max, curr = 0) {
    const resp = await axios({
      method: 'get',
      url: url,
      responseType: 'text'
    })
    const html = resp.data;
    if (!this.isAddedUrl(url)) {
      const doc = this.html2doc(url, html);
      this.addDoc(doc);
      console.log('Add:  ' + url);
    } else {
      console.log('Skip: ' + url);
    }

    if (curr >= max) {
      return;
    }

    let links = this.getLinks(url, html);
    await Promise.all(links.map(async link => {
      const url = link.normalized;
      await this.fetchUrl(url, max, curr + 1);
    }));
  }

  html2doc(url, html) {
    const id = this.index.documentStore.length;
    const $ = cheerio.load(html);
    const title = $('title').text();
    return {
      id,
      body: h2p(html),
      title,
      url,
    };
  }

  addDoc(doc) {
    this.index.addDoc(doc);
  }

  isAddedUrl(url) {
    const r = this.index.search(url, {
      fields: {
        title: {boost: 0},
        body: {boost: 0},
        url: {boost: 1}
      }
    });
    return r.length > 0;
  };

  getLinks(url, html) {
    let links = parseLinks({
      html,
      url,
    });
    return links.filter(link => {
      const regexp = new RegExp('^' + esr(url));
      return regexp.test(link.normalized);
      // return true;
    });
  }
}