import axios from "axios";
import esr from "escape-string-regexp";
import cheerio from "cheerio";
import h2p from "html2plaintext";
import {resolve} from 'url';

const {PerformanceObserver, performance} = require('perf_hooks');

export default class {
  constructor(index) {
    this.index = index;
    this.no = 0;
    this.progress = [];
    this.filter = null;
  }

  async importDocuments(url, maxDepth, filter, cb) {
    this.progressCallback = cb;
    this.filter = filter;
    await this.fetchUrl(url, maxDepth);
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

  isFirstFetch(curr) {
    return curr === 0;
  }

  addProgress(url, state) {
    this.progress.push({
      'title': '',
      url,
      state,
    });
    this.progressCallback(this.progress);
  }

  async fetchUrl(url, max, curr = 0) {
    if (!this.isFirstFetch(curr) && this.isAddedUrl(url)) {
      console.log('Skip: ' + url);
      this.addProgress(url, 'Skip');
      return;
    }

    const html = await this.getPage(url);

    if (!this.isFirstFetch(curr) || !this.isAddedUrl(url)) {
      const doc = this.html2doc(url, html);
      this.addDoc(doc);
      console.log('Add: ' + url);
      this.addProgress(url, 'Add');
    } else {
      console.log('Skip: ' + url);
      this.addProgress(url, 'Skip');
    }

    if (curr >= max) {
      return;
    }

    let links = this.getLinks(url, html);
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
    const $ = cheerio.load(html);
    const atags = $('a');
    let keys = Object.keys(atags);
    keys = keys.filter((key) => {
      const atag = atags[key];
      return atag.attribs && atag.attribs.href;
    });
    let links = keys.map((key) => {
      const atag = atags[key];
      return resolve(url, atag.attribs.href);
    });
    const regexp = new RegExp('^' + esr(this.filter));
    links = links.filter(link => {
      return regexp.test(link);
    });
    end();
    return links;
  }
}