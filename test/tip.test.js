const test = require("tape");

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require("./utils");

const tip = require("../src/tip");
const indent = require("../src/indent");

test("tip plugin renders a basic tip", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  const expected =
    '<div class="admonition tip">' +
      '<p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p>' +
      '<div>' +
        '<p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p>' +
      '</div>' +
    '</div>\n' +
    '<p>This is the next paragraph</p>';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip even with weird indentation", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n\tThis is the content of the tip, and it should be translatable, as should all the following blocks:\n \tone\n\t\t\t\ttwo\n \t three\n              four\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  const expected =
    '<div class="admonition tip">' +
      '<p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p>' +
      '<div>' +
        '<p>This is the content of the tip, and it should be translatable, as should all the following blocks:\none\ntwo\nthree\nfour</p>' +
      '</div>' +
    '</div>\n' +
    '<p>This is the next paragraph</p>';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip without an id", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  const expected =
    '<div class="admonition tip">' +
      '<p class="admonition-title" id="tip_None"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p>' +
      '<div>' +
        '<p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p>' +
      '</div>' +
    '</div>\n' +
    '<p>This is the next paragraph</p>';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip without a title", t => {
  t.plan(1);
  const input =
    "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
  const output = markdownToHtml(input, tip);
  const expected =
    '<div class="admonition tip">' +
      '<p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>Teaching Tip</p>' +
      '<div>' +
        '<p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p>' +
      '</div>' +
    '</div>\n' +
    '<p>This is the next paragraph</p>';
  t.equal(output, expected);
});

test("tip plugin renders a tip with multiple children", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n    This is the content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  const expected =
    '<div class="admonition tip">' +
      '<p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p>' +
      '<div>' +
        '<p>This is the content of the tip, and it should be translatable</p>' +
      '</div>' +
      '<div>' +
        '<p>This is more stuff that is still part of the content of the tip</p>' +
      '</div>' +
    '</div>\n' +
    '<p>This is the next paragraph</p>';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip indented with tabs", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n\tThis is the content of the tip, and it should be translatable\n\tThis is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  const expected =
    '<div class="admonition tip">' +
      '<p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p>' +
      '<div>' +
        '<p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p>' +
      '</div>' +
    '</div>\n' +
    '<p>This is the next paragraph</p>';
  t.equal(output, expected);
});

test("tip plugin does not render title paragraph unless there is a title", t => {
  // Guides have no default title, and the current logic will only render the
  // paragraph containing both the icon and the title text if there is a title,
  // so a guide without a title will render without an icon.
  //
  // This test is meant to document current behavior, not to comment on desired
  // behavior; we do in fact probably want to fix this behavior in the long
  // term.
  t.plan(1);
  const input = "!!!guide <content-0>\n\n\tinner content";
  const output = markdownToHtml(input, tip);
  const expected = '<div class="admonition guide"><div></div><div><p>inner content</p></div></div>';
  t.equal(output, expected);
});

test("tip plugin can redact a basic tip", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToRedacted(input, tip);
  /**
   * [this is an optional title, and it should be translatable][0]
   *
   * This is the content of the tip, and it should be translatable
   * This is more stuff that is still part of the content of the tip
   *
   * [/][0]
   *
   * This is the next paragraph
   */
  t.equal(
    output,
    "[this is an optional title, and it should be translatable][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n"
  );
});

test("tip plugin can redact a basic tip without an id", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToRedacted(input, tip);
  t.equal(
    output,
    "[this is an optional title, and it should be translatable][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n"
  );
});

test("tip plugin can redact a basic tip without a title", t => {
  t.plan(1);
  const input =
    "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
  const output = markdownToRedacted(input, tip);
  t.equal(
    output,
    "[][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n"
  );
});

test("tip plugin can restore a basic tip", t => {
  t.plan(1);
  const source =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const redacted =
    "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
  const output = sourceAndRedactedToRestored(source, redacted, [tip, indent]);
  const expected =
    "!!!tip \"c'est une optional title, and it should be translatable\" <tip-0>\n    C'est du content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
  t.equal(output, expected);
});

test("tip plugin can restore a basic tip with multiple children", t => {
  t.plan(1);
  const source =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n    This is the content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const redacted =
    "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\n\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
  const output = sourceAndRedactedToRestored(source, redacted, [tip, indent]);
  const expected =
    "!!!tip \"c'est une optional title, and it should be translatable\" <tip-0>\n    C'est du content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
  t.equal(output, expected);
});

test("tip plugin can restore a basic tip without an id", t => {
  t.plan(1);
  const source =
    '!!!tip "this is an optional title, and it should be translatable"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const redacted =
    "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
  const output = sourceAndRedactedToRestored(source, redacted, [tip, indent]);
  const expected =
    "!!!tip \"c'est une optional title, and it should be translatable\"\n    C'est du content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
  t.equal(output, expected);
});

test("tip plugin can restore a basic tip without a title", t => {
  t.plan(1);
  t.plan(1);
  const source =
    "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
  const redacted =
    "[][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
  const output = sourceAndRedactedToRestored(source, redacted, [tip, indent]);
  const expected =
    "!!!tip <tip-0>\n    C'est du content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
  t.equal(output, expected);
});

test("tip plugin wraps newline-separated children in individual divs", t => {
  t.plan(2);
  const inputWithNewLine =
    '!!!guide <content-0>\n' +
    '\n' +
    '    # a header\n' +
    '    \n' +
    '    a paragraph\n';
  const outputWithNewLine = markdownToHtml(inputWithNewLine, tip);
  const expectedWithNewLine =
    '<div class="admonition guide">' +
      '<div></div>' +
      '<div>' +
        '<h1>a header</h1>' +
      '</div>' +
      '<div>' +
        '<p>a paragraph</p>' +
      '</div>' +
    '</div>';
  t.equal(outputWithNewLine, expectedWithNewLine);

  // otherwise
  const inputWithoutNewLine =
    '!!!guide <content-0>\n' +
    '\n' +
    '    # a header\n' +
    '    a paragraph\n';
  const outputWithoutNewLine = markdownToHtml(inputWithoutNewLine, tip);
  const expectedWithoutNewLine =
    '<div class="admonition guide">' +
      '<div></div>' +
      '<div>' +
        '<h1>a header</h1>' +
        '<p>a paragraph</p>' +
      '</div>' +
    '</div>';
  t.equal(outputWithoutNewLine, expectedWithoutNewLine);
});

test("tip plugin renders an empty div when there is a newline between title and body", t => {
  t.plan(2)
  const inputWithoutNewLine =
    '!!!guide <content-0>\n' +
    '    The only paragraph\n';
  const outputWithoutNewLine = markdownToHtml(inputWithoutNewLine, tip);
  const expectedWithoutNewLine =
    '<div class="admonition guide">' +
      '<div>' +
        '<p>The only paragraph</p>' +
      '</div>' +
    '</div>'
  ;
  t.equal(outputWithoutNewLine, expectedWithoutNewLine);

  // otherwise
  const inputWithNewLine =
    '!!!guide <content-0>\n' +
    '\n' +
    '    The only paragraph\n';
  const outputWithNewLine = markdownToHtml(inputWithNewLine, tip);
  const expectedWithNewLine =
    '<div class="admonition guide">' +
      '<div></div>' +
      '<div>' +
        '<p>The only paragraph</p>' +
      '</div>' +
    '</div>'
  ;
  t.equal(outputWithNewLine, expectedWithNewLine);
});

test("tip plugin restoration preserves extra newline", t => {
  t.plan(1);
  const source =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n' +
    '\n' +
    '    This is the content of the tip, and it should be translatable\n' +
    '    \n' +
    '    This is more stuff that is still part of the content of the tip\n';

  const redacted =
    "[c'est une optional title, and it should be translatable][0]\n" +
    "\n" +
    "C'est du content of the tip, and it should be translatable\n" +
    "\n" +
    "This is more stuff that is still part of the content of the tip\n" +
    "\n" +
    "[/][0]\n";

  const output = sourceAndRedactedToRestored(source, redacted, [tip, indent]);
  const expected =
    "!!!tip \"c'est une optional title, and it should be translatable\" <tip-0>\n" +
    "    C'est du content of the tip, and it should be translatable\n" +
    "\n" +
    "    This is more stuff that is still part of the content of the tip\n"
  t.equal(output, expected);
});

test("tip plugin redaction preserves extra newline", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n' +
    '    This is the content of the tip, and it should be translatable\n' +
    '    \n' +
    '    This is more stuff that is still part of the content of the tip\n';
  const output = markdownToRedacted(input, tip);
  t.equal(
    output,
    '[this is an optional title, and it should be translatable][0]\n' +
    '\n' +
    'This is the content of the tip, and it should be translatable\n' +
    '\n' +
    'This is more stuff that is still part of the content of the tip\n' +
    '\n' +
    '[/][0]\n'
  );
});
