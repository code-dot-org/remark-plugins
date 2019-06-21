const test = require('tape');

const {markdownToRedacted, sourceAndRedactedToRestored} = require('./utils');

const blockfield = require('../src/blockfield');

test('blockfield can redact', t => {
  t.plan(1);
  const source = 'regular text {with} some {blockfields}';
  const expected = 'regular text [with][0] some [blockfields][1]\n';

  const rendered = markdownToRedacted(source, blockfield);
  t.equal(rendered, expected);
});

test('blockfield can restore', t => {
  t.plan(1);
  const source = 'regular text {with} some {blockfields}';
  const translated = 'texte normal [avec][0] quelques [champs de blocage][1]\n';
  const expected = 'texte normal {with} quelques {blockfields}\n';

  const rendered = sourceAndRedactedToRestored(source, translated, blockfield);
  t.equal(rendered, expected);
});
