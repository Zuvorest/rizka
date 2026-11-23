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
  assert.match(html, /id="gate-check"/);
  assert.match(html, /Menyiapkan tautan/);
  assert.match(html, /id="check-count">6</);
  assert.match(html, /id="sponsor-dialog"/);
  assert.match(html, /Buka sponsor/);
  assert.doesNotMatch(html, /mediafire/i);
});

test('safelink mempertahankan semua slot iklan', () => {
  const html = render();

  assert.match(html, /accountut\.com\/1\/bf18749c477460bf4422b8d34797de74/);
  assert.match(html, /bellnewyork\.org\/14\/f1c295834220933b78e26ac0b2bc7b28/);
  assert.match(html, /container-b0c006a0f94ab96e5b23136c64075bec/);
  assert.match(html, /ad-728/);
  assert.match(html, /ad-320/);
  assert.match(html, /ad-160x600/);
});

test('safelink meng-escape judul', () => {
  assert.match(render(), /Contoh &lt;tautan&gt;/);
});
