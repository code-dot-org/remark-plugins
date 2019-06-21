const test = require('tape');

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require('./utils');

const details = require('../src/details');

test('details can render', t => {
  t.plan(1);
  const markdown =
    '::: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::';
  const expected =
    '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details can have a variable number of opening colons', t => {
  t.plan(1);
  const markdown =
    ':::::::: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::::::::::::';
  const expected =
    '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details can render markdown syntax in the summary', t => {
  t.plan(1);
  const markdown =
    '::: details [**summary** _content_]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::';
  const expected =
    '<details><summary><strong>summary</strong> <em>content</em></summary><p>contents, which are sometimes further block elements</p></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details can render markdown syntax in the body', t => {
  t.plan(1);
  const markdown =
    '::: details [summary-content]\n' +
    '\n' +
    '# Contents\n' +
    '- can\n' +
    '- be\n' +
    '- markdown\n' +
    ':::';
  const expected =
    '<details><summary>summary-content</summary><h1>Contents</h1><ul>\n' +
    '<li>can</li>\n' +
    '<li>be</li>\n' +
    '<li>markdown</li>\n' +
    '</ul></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details ignores trailing colons', t => {
  t.plan(1);
  // Look how pretty this can be!
  const markdown =
    '::::::::::::: details [summary-content] :::::::::::::\n' +
    'contents, which are sometimes further block elements\n' +
    ':::::::::::::::::::::::::::::::::::::::::::::::::::::';
  const expected =
    '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details ignores excess whitespace', t => {
  t.plan(1);
  const markdown =
    ':::      details       [summary-content]          \n' +
    '\n' +
    'contents, which are sometimes further block elements\n' +
    '\n' +
    ':::';
  const expected =
    '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details can nest', t => {
  t.plan(1);
  const markdown =
    ':::: details [outer]\n' +
    '::: details [inner]\n' +
    'innermost content\n' +
    ':::\n' +
    '::::';
  const expected =
    '<details><summary>outer</summary><details><summary>inner</summary><p>innermost content</p></details></details>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details requires a summary block', t => {
  t.plan(1);
  const markdown =
    '::: details\n' +
    'contents, which are sometimes further block elements\n' +
    ':::';
  const expected =
    '<p>::: details\n' +
    'contents, which are sometimes further block elements\n' +
    ':::</p>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details requires at least three opening colons', t => {
  t.plan(1);
  const markdown =
    ':: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::';
  const expected =
    '<p>:: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::</p>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details requires closing colons', t => {
  t.plan(1);
  const markdown =
    '::: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n';
  const expected =
    '<p>::: details [summary-content]\n' +
    'contents, which are sometimes further block elements</p>\n';

  const rendered = markdownToHtml(markdown, details);
  t.equal(rendered, expected);
});

test('details can redact', t => {
  t.plan(1);
  const markdown =
    '::: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::';
  const expected =
    '[summary-content][0]\n' +
    '\n' +
    'contents, which are sometimes further block elements\n' +
    '\n' +
    '[/][0]\n';

  const rendered = markdownToRedacted(markdown, details);
  t.equal(rendered, expected);
});

test('details can redact nested', t => {
  t.plan(1);
  const markdown =
    ':::: details [outer]\n' +
    '::: details [inner]\n' +
    'innermost content\n' +
    ':::\n' +
    '::::';
  const expected =
    '[outer][0]\n' +
    '\n' +
    '[inner][1]\n' +
    '\n' +
    'innermost content\n' +
    '\n' +
    '[/][1]\n' +
    '\n' +
    '[/][0]\n';

  const rendered = markdownToRedacted(markdown, details);
  t.equal(rendered, expected);
});

test('details can restore', t => {
  t.plan(1);
  const original =
    '::: details [summary-content]\n' +
    'contents, which are sometimes further block elements\n' +
    ':::';
  const translated =
    '[contenu sommaire][0]\n' +
    '\n' +
    'contenu, qui sont parfois des éléments de bloc supplémentaires\n' +
    '\n' +
    '[/][0]\n';
  const expected =
    '::: details [contenu sommaire]\n' +
    '\n' +
    'contenu, qui sont parfois des éléments de bloc supplémentaires\n' +
    '\n' +
    ':::\n';
  const restored = sourceAndRedactedToRestored(original, translated, details);
  t.equal(restored, expected);
});

test('details can restore nested', t => {
  t.plan(1);
  const original =
    ':::: details [outer]\n' +
    '::: details [inner]\n' +
    'innermost content\n' +
    ':::\n' +
    '::::';
  const translated =
    '[extérieur][0]\n' +
    '\n' +
    '[interne][1]\n' +
    '\n' +
    'contenu le plus profond\n' +
    '\n' +
    '[/][1]\n' +
    '\n' +
    '[/][0]\n';
  // Note the relative colon counts are preserved
  const expected =
    ':::: details [extérieur]\n' +
    '\n' +
    '::: details [interne]\n' +
    '\n' +
    'contenu le plus profond\n' +
    '\n' +
    ':::\n' +
    '\n' +
    '::::\n';
  const restored = sourceAndRedactedToRestored(original, translated, details);
  t.equal(restored, expected);
});
