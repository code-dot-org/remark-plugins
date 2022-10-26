const test = require("tape");

const {markdownToRedacted, sourceAndRedactedToRestored} = require('./utils');

const startHtml = require("../src/startHtml");

test('startHtml plugin can redact inline', t => {
  t.plan(1);
  const markdown =
    '<label style="margin: 0px; padding: 2px;" id="label3">some label</label>';
  const expected =
    '[][0]some label[][1]\n'

  const rendered = markdownToRedacted(markdown, startHtml);
  t.equal(rendered, expected);
});

test('startHtml plugin can restore', t => {
  t.plan(1);
  const source =
    '<label style="margin: 0px; padding: 2px;" id="label3">some label</label>';
  const translated =
    '[][0]alguna etiqueta[][1]';
  const expected =
    '<label style="margin: 0px; padding: 2px;" id="label3">alguna etiqueta</label>\n';

  const rendered = sourceAndRedactedToRestored(source, translated, startHtml);
  t.equal(rendered, expected);
})
