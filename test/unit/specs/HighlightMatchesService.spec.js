import HighlightMatchesService from '../../../src/renderer/services/HighlightMatchesService'

const assert = require('assert');

describe('HighlightMatchesService.js', () => {

  before(async function () {
    this.service = new HighlightMatchesService();
  });

  it('highlight', async function () {
    const text = "aaaaaaaaa\nbbbbbbbbbb\ncccccccc\n   \ndummy\n  \nddd\n\teeeeeeeeee";
    const word = "dummy";
    const except = 'cccccccc<br>   <br><span style="background-color: yellow">dummy</span><br>  <br>ddd';
    const r = this.service.highlight(text, word);
    assert.equal(r, except);
  });

  it('getMatchStart', function () {
    const text = "aaaaaaaaa\nbbbbbbbbbb\ncccccccc\n   \ndummy\n  \nddd\n\teeeeeeeeee";
    const except = 21;
    const result = this.service.getMatchStart(text, 34);
    assert.equal(result, except);
  });

  it('getMatchEnd', function () {
    const text = "aaaaaaaaa\nbbbbbbbbbb\ncccccccc\n   \ndummy\n  \nddz\n\teeeeeeeeee";
    const except = 45;
    const result = this.service.getMatchEnd(text, 34);
    assert.equal(text[result], 'z');
    assert.equal(result, except);
  });
});