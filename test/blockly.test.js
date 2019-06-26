const test = require('tape');

const {markdownToRedacted, sourceAndRedactedToRestored} = require('./utils');

const blockly = require('../src/blockly');

test('blockly plugin can redact inline blockly', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with <xml><block type="example"/></xml> a blockly block';
  const expected =
    'Some simple markdown with [blockly block][0] a blockly block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin can redact blockly on its own line', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with\n' +
    '\n' +
    '<xml><block type="example"/></xml>\n' +
    '\n' +
    'a blockly block';
  const expected =
    'Some simple markdown with\n' +
    '\n' +
    '[blockly block][0]\n' +
    '\n' +
    'a blockly block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin can redact inline blockly that spans multiple lines', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with <xml>\n' +
    '  <block type="example">\n' +
    '    <title name="complex"/>\n' +
    '  </block>\n' +
    '</xml> a blockly block';
  const expected =
    'Some simple markdown with [blockly block][0] a blockly block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin can redact block blockly that spans multiple lines', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with\n' +
    '\n' +
    '<xml>\n' +
    '\n' +
    '  <block type="example"/>\n' +
    '\n' +
    '</xml>\n' +
    '\n' +
    'a blockly block';
  const expected =
    'Some simple markdown with\n' +
    '\n' +
    '[blockly block][0]\n' +
    '\n' +
    'a blockly block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin can NOT redact inline blockly blocks with excess newlines', t => {
  t.plan(1);
  // This is a product of the fact that in this situation, markdown parses
  // this content as two separate blocks, and inline tokenizers can only
  // tokenize within a single block.
  const markdown =
    'Some simple markdown with <xml>\n' +
    '\n' +
    '  <block type="example">\n' +
    '    <title name="complex"/>\n' +
    '  </block>\n' +
    '</xml> a blockly block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, markdown);
});

test('blockly plugin can redact multiple blockly block definitions', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with one <xml><block type="inline"/></xml> inline block and one\n' +
    '\n' +
    '<xml>\n' +
    '  <block type="block"/>\n' +
    '</xml>\n' +
    '\n' +
    '"block" block';
  const expected =
    'Some simple markdown with one [blockly block][0] inline block and one\n' +
    '\n' +
    '[blockly block][1]\n' +
    '\n' +
    '"block" block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin requires a closing tag', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with <xml><block type="example"/> a malformed blockly block';
  const expected =
    'Some simple markdown with <xml><block type="example"/> a malformed blockly block\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin will redact indiscriminately between opening and closing tags', t => {
  t.plan(1);
  const markdown =
    'Some simple markdown with <xml><block type="example"/> a malformed blockly block and misplaced closing tag </xml>';
  const expected = 'Some simple markdown with [blockly block][0]\n';

  const rendered = markdownToRedacted(markdown, blockly);
  t.equal(rendered, expected);
});

test('blockly plugin can restore', t => {
  t.plan(1);
  const source =
    'Some simple markdown with <xml><block type="example"/></xml> a blockly block';
  const translated = 'un démarquage simple avec [bloc bloc][0] un bloc bloc';
  const expected =
    'un démarquage simple avec <xml><block type="example"/></xml> un bloc bloc\n';

  const rendered = sourceAndRedactedToRestored(source, translated, blockly);
  t.equal(rendered, expected);
});
