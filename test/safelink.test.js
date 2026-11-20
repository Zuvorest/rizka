const test = require('node:test');
const assert = require('node:assert/strict');
const { renderSafelink } = require('../safelink');

function render() {
  return renderSafelink({
    title: 'Contoh <tautan>',
    code: 'abcde',
    baseUrl: 'https://vriz.my.id'
  });
}

test('safelink merender dua kanal dan gate subscribe', () => {
  const html = render();

  assert.match(html, /https:\/\/www\.youtube\.com\/@vrizchanel\?sub_confirmation=1/);
  assert.match(html, /https:\/\/www\.youtube\.com\/@rizzofcc\?sub_confirmation=1/);
  assert.match(html, /0 dari 2 kanal dibuka\./);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /Buka Tautan/);
  assert.doesNotMatch(html, /mediafire/i);
});

test('safelink meng-escape judul', () => {
  assert.match(render(), /Contoh &lt;tautan&gt;/);
});
