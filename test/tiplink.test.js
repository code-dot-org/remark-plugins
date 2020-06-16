const test = require('tape');

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored,
  sourceAndRedactedToHtml
} = require('./utils');

const tiplink = require('../src/tiplink');

const basicTipMarkdown = 'tip!!!';
const basicTipHtml =
  '<span class="tiplink tiplink-tip"><a href="#tip_undefined"><i class="fa fa-lightbulb-o"></i></a></span>';

const basicDiscussionMarkdown = 'discussion!!!';
const basicDiscussionHtml =
  '<span class="tiplink tiplink-discussion"><a href="#discussion_undefined"><i class="fa fa-comments"></i></a></span>';

const labeledTipMarkdown = 'tip!!! tip-0';
const labeledTipHtml =
  '<span class="tiplink tiplink-tip"><a href="#tip_tip-0"><i class="fa fa-lightbulb-o"></i></a></span>';

test('tiplink plugin renders basic tiplink', t => {
  t.plan(1);
  const input = basicTipMarkdown;
  const output = markdownToHtml(input, tiplink);
  t.equal(output, `<p>${basicTipHtml}</p>\n`);
});

test('tiplink plugin renders a tiplink no matter where it begins', t => {
  t.plan(1);
  const input = `look, a ${basicTipMarkdown}`;
  const output = markdownToHtml(input, tiplink);
  t.equal(output, `<p>look, a ${basicTipHtml}</p>\n`);
});

test('tiplink plugin renders tiplink with label', t => {
  t.plan(1);
  const input = labeledTipMarkdown;
  const output = markdownToHtml(input, tiplink);
  t.equal(output, `<p>${labeledTipHtml}</p>\n`);
});

test('tiplink plugin renders a tiplink with label no matter where it begins', t => {
  t.plan(1);
  const input = `look, a ${labeledTipMarkdown}`;
  const output = markdownToHtml(input, tiplink);
  t.equal(output, `<p>look, a ${labeledTipHtml}</p>\n`);
});

test('tiplink plugin renders a tiplink with label with content after it', t => {
  t.plan(1);
  const input = `look, a ${labeledTipMarkdown} cool, huh?`;
  const output = markdownToHtml(input, tiplink);
  t.equal(output, `<p>look, a ${labeledTipHtml} cool, huh?</p>\n`);
});

test('tiplink plugin redacts tiplinks', t => {
  t.plan(1);
  const input =
    'This is some text with an inline labeled tip: ' + labeledTipMarkdown;
  const output = markdownToRedacted(input, tiplink);
  t.equal(output, 'This is some text with an inline labeled tip: [][0]\n');
});

test('tiplink plugin redacts basic tiplinks', t => {
  t.plan(1);
  const input =
    'This is some text with an inline labeled tip: ' + basicTipMarkdown;
  const output = markdownToRedacted(input, tiplink);
  t.equal(output, 'This is some text with an inline labeled tip: [][0]\n');
});

test('tiplink plugin redacts basic discussion links', t => {
  t.plan(1);
  const input =
    'This is some text with an inline labeled tip: ' + basicDiscussionMarkdown;
  const output = markdownToRedacted(input, tiplink);
  t.equal(output, 'This is some text with an inline labeled tip: [][0]\n');
});

test('tiplink plugin can restore tiplinks back to markdown', t => {
  t.plan(1);
  const source =
    'This is some text with an inline labeled tip: ' + labeledTipMarkdown;
  const redacted = 'Ceci est un texte avec un [][0] inline labeled tip';
  const output = sourceAndRedactedToRestored(source, redacted, tiplink);
  t.equal(
    output,
    'Ceci est un texte avec un tip!!! tip-0 inline labeled tip\n'
  );
});

test('tiplink plugin can translate tiplinks', t => {
  t.plan(1);
  const source =
    'This is some text with an inline labeled tip: ' + labeledTipMarkdown;
  const redacted = 'Ceci est un texte avec un [][0] inline labeled tip';
  const output = sourceAndRedactedToHtml(source, redacted, tiplink);
  t.equal(
    output,
    '<p>Ceci est un texte avec un ' +
      labeledTipHtml +
      ' inline labeled tip</p>\n'
  );
});

test('tiplink plugin can translate basic tiplinks', t => {
  t.plan(1);
  const source =
    'This is some text with an inline labeled tip: ' + basicTipMarkdown;
  const redacted = 'Ceci est un texte avec un [][0] inline labeled tip';
  const output = sourceAndRedactedToHtml(source, redacted, tiplink);
  t.equal(
    output,
    '<p>Ceci est un texte avec un ' + basicTipHtml + ' inline labeled tip</p>\n'
  );
});

test('tiplink plugin can translate basic discussion links', t => {
  t.plan(1);
  const source =
    'This is some text with an inline labeled tip: ' + basicDiscussionMarkdown;
  const redacted = 'Ceci est un texte avec un [][0] inline labeled tip';
  const output = sourceAndRedactedToHtml(source, redacted, tiplink);
  t.equal(
    output,
    '<p>Ceci est un texte avec un ' +
      basicDiscussionHtml +
      ' inline labeled tip</p>\n'
  );
});
