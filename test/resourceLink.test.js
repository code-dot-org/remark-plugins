const test = require('tape');

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require('./utils');

const resourcelink = require('../src/resourcelink');

test('resourcelink plugin cannot render resourcelinks to html', t => {
  t.plan(1);
  const input = "[r some-slug]";
  const output = markdownToHtml(input, resourcelink);
  t.equal(output, "<p>[r some-slug]</p>\n");
});

test('resourcelink plugin redacts resourcelinks', t => {
  t.plan(1);
  const input = "[r some-slug]";
  const output = markdownToRedacted(input, resourcelink);
  t.equal(output, "[some-slug][0]\n");
});

test('resourcelink plugin can restore resourcelinks back to markdown', t => {
  t.plan(1);
  const source = "[r some-slug]";
  const redacted = "[any-text][0]"
  const output = sourceAndRedactedToRestored(source, redacted, resourcelink);
  t.equal(output, "[r some-slug]\n");
});
