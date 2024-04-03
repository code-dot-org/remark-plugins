const test = require('tape');

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require('./utils');

const vocabularyDefinition = require('../src/vocabularyDefinition');

const basicInput = '[v some_word/course-offering/1999]';

test('vocabularyDefinition plugin can only render vocabularyDefinitions back out to plain text', t => {
  t.plan(1);
  const output = markdownToHtml(basicInput, vocabularyDefinition);
  t.equal(output, '<p>[v some_word/course-offering/1999]</p>');
});

test('vocabularyDefinition plugin redacts vocabularyDefinitions', t => {
  t.plan(1);
  const output = markdownToRedacted(basicInput, vocabularyDefinition);
  t.equal(output, '[some_word][0]\n');
});

test('vocabularyDefinition plugin can restore vocabularyDefinitions back to markdown', t => {
  t.plan(1);
  const redacted = '[un-mot][0]';
  const output = sourceAndRedactedToRestored(basicInput, redacted, vocabularyDefinition);
  t.equal(output, '[v some_word/course-offering/1999]\n');
});
