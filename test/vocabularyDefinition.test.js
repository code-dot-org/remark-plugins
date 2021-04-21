const test = require('tape');

const {
  mapMdast,
  markdownToHtml,
  markdownToRedacted,
  markdownToSyntaxTree,
  sourceAndRedactedToHtml,
  sourceAndRedactedToRestored
} = require('./utils');

const vocablink = require('../src/vocablink');

test('vocablink plugin can distinguish between vocablinks with word overrides and linkReferences', t => {
  t.plan(2);
  // the only difference between these two bits of the syntax is the "v "
  const vocablinkTree = markdownToSyntaxTree('[v some-word][override]', vocablink);
  const linkReferenceTree = markdownToSyntaxTree('[some-word][override]', vocablink);
  t.deepEqual(mapMdast(vocablinkTree), {
    type: 'root',
    children: [{type: 'paragraph', children: [{type: 'rawtext'}]}]
  });
  t.deepEqual(mapMdast(linkReferenceTree), {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{type: 'linkReference', children: [{type: 'text'}]}]
      }
    ]
  });
});

test('vocablink plugin can only render vocablinks back out to plain text', t => {
  t.plan(1);
  const input = '[v some-word]';
  const output = markdownToHtml(input, vocablink);
  t.equal(output, '<p>[v some-word]</p>\n');
});

test('vocablink plugin can only render vocablinks with word overrides back out to plain text', t => {
  t.plan(1);
  const input = '[v some-word][override]';
  const output = markdownToHtml(input, vocablink);
  t.equal(output, '<p>[v some-word][override]</p>\n');
});

test('vocablink plugin redacts vocablinks', t => {
  t.plan(1);
  const input = '[v some-word]';
  const output = markdownToRedacted(input, vocablink);
  t.equal(output, '[some-word][0]\n');
});

test('vocablink plugin redacts vocablinks with word overrides', t => {
  t.plan(1);
  const input = '[v some-word][un-mot]';
  const output = markdownToRedacted(input, vocablink);
  t.equal(output, '[un-mot][0]\n');
});

test('vocablink plugin can restore vocablinks back to markdown', t => {
  t.plan(1);
  const source = '[v some-word]';
  const redacted = '[un-mot][0]';
  const output = sourceAndRedactedToRestored(source, redacted, vocablink);
  t.equal(output, '[v some-word][un-mot]\n');
});

test('vocablink plugin can restore vocablinks with word overrides back to markdown', t => {
  t.plan(1);
  const source = '[v some-word][source-override]';
  const redacted = '[redaction-override][0]';
  const output = sourceAndRedactedToRestored(source, redacted, vocablink);
  t.equal(output, '[v some-word][redaction-override]\n');
});
