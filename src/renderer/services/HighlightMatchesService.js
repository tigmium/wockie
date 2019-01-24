import esr from "escape-string-regexp";

export default class {
  highlight(text, word) {
    const reg = new RegExp("(" + esr(word) + ")", "i");
    const highlight = '<span style="background-color: yellow">$1</span>';
    const match = reg.exec(text);
    if (match) {
      const start = this.getMatchStart(text, match.index);
      const end = this.getMatchEnd(text, match.index);
      const length = end - start + 1;
      let output = text.substr(start, length);
      output = this.escapeHtml(output);
      output = this.lf2br(output);
      output = output.replace(reg, highlight);
      return output;
    } else {
      return null;
    }
  }

  /**
   * 引数のテキストのうち、マッチ箇所として表示する部分の開始オフセットを取得する
   * @param text
   * @param index
   * @returns {*}
   */
  getMatchStart(text, index) {
    let lfCnt = 0;
    for (let i = index; i > 0; i--) {
      if (text[i] === '\n') lfCnt++;

      if (lfCnt === 3) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * 引数のテキストのうち、マッチ箇所として表示する部分の終了オフセットを取得する
   * @param text
   * @param index
   * @returns {*}
   */
  getMatchEnd(text, index) {
    let lfCnt = 0;
    const max = text.length;
    for (let i = index; i < max; i++) {
      if (text[i] === '\n') lfCnt++;

      if (lfCnt === 3) {
        return i - 1;
      }
    }
    return max;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  lf2br(txt) {
    return txt.replace(/\n/g, '<br>')
  }
}