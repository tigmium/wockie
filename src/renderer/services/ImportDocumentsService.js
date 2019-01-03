import axios from "axios";
import parseLinks from "html-links";
import esr from "escape-string-regexp";
import cheerio from "cheerio";
import h2p from "html2plaintext";

const {PerformanceObserver, performance} = require('perf_hooks');

export default class {
  constructor(index) {
    this.index = index;
    this.no = 0;
  }

  async importDocuments(url) {
    await this.fetchUrl(url, 2);
  }

  perform(name, arg) {
    const start = performance.now();
    const no = this.no++;
    console.log(name + '開始(%d): %s', no, arg);

    return () => {
      const end = performance.now();
      console.log(name + '終了(%d) %dms: %s', no, end - start, arg);
    }
  }

  getPage(url) {
    const end = this.perform('通信', url);
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
        responseType: 'text'
      }).then((resp) => {
        end();
        resolve(resp.data);
      }).catch((e) => {
        reject(e);
      });
    });
  }

  async fetchUrl(url, max, curr = 0) {
    if (this.isAddedUrl(url)) {
      console.log('Skip: ' + url);
      return;
    }

    const html = await this.getPage(url);

    const doc = this.html2doc(url, html);
    this.addDoc(doc);
    console.log('Add: ' + url);

    if (curr >= max) {
      return;
    }

    let links = await this.getLinks(url, html);
    await Promise.all(links.map(async link => {
      await this.fetchUrl(link, max, curr + 1);
    }));
  }

  html2doc(url, html) {
    const end = this.perform('html2doc', '');
    const id = this.index.documentStore.length;
    const $ = cheerio.load(html);
    const title = $('title').text();
    end();
    return {
      id,
      body: h2p(html),
      title,
      url,
    };
  }

  addDoc(doc) {
    const end = this.perform('ドキュメント追加', '');
    this.index.addDoc(doc);
    end();
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
  }

  getLinks(url, html) {
    const end = this.perform('パース', url);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let links = parseLinks({
          html,
          url,
        });
        links = links.filter(link => {
          const regexp = new RegExp('^' + esr(url));
          return regexp.test(link.normalized);
          // return true;
        });
        links = links.map(link => {
          return link.normalized;
        });
        end();
        resolve(links);
      }, 0);
    });
  }
}