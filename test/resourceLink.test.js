const test = require('tape');

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require('./utils');

const resourceLink = require('../src/resourceLink');

const basicInput = "[r some-slug/course-offering/1999]";

test('resourceLink plugin cannot render resourceLinks to html', t => {
  t.plan(1);
  const output = markdownToHtml(basicInput, resourceLink);
  t.equal(output, "<p>[r some-slug/course-offering/1999]</p>\n");
});

test('resourceLink plugin redacts resourceLinks', t => {
  t.plan(1);
  const output = markdownToRedacted(basicInput, resourceLink);
  t.equal(output, "[some-slug][0]\n");
});

test('resourceLink plugin can restore resourceLinks back to markdown', t => {
  t.plan(1);
  const redacted = "[any-text][0]"
  const output = sourceAndRedactedToRestored(basicInput, redacted, resourceLink);
  t.equal(output, "[r some-slug/course-offering/1999]\n");
});
