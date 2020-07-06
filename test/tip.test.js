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
  /**
   * <div class="admonition tip">
   *   <p class="admonition-title" id="tip_tip-0">
   *     <i class="fa fa-lightbulb-o"></i>
   *     this is an optional title, and it should be translatable
   *   </p>
   *   <p>
   *     This is the content of the tip, and it should be translatable This is more stuff that is still part of the content of the tip
   *   </p>
   * </div>
   * <p>This is the next paragraph</p>
   */
  const expected =
    '<div class="admonition tip"><p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div>\n<p>This is the next paragraph</p>\n';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip even with weird indentation", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n\tThis is the content of the tip, and it should be translatable, as should all the following blocks:\n \tone\n\t\t\t\ttwo\n \t three\n              four\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  /**
   * <div class="admonition tip">
   *   <p class="admonition-title" id="tip_tip-0">
   *     <i class="fa fa-lightbulb-o"></i>
   *     this is an optional title, and it should be translatable
   *   </p>
   *   <p>
   *     This is the content of the tip, and it should be translatable, as
   *     should all the following blocks: one two three four
   *   </p>
   * </div>
   * <p>This is the next paragraph</p>
   */
  const expected =
    '<div class="admonition tip"><p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p><p>This is the content of the tip, and it should be translatable, as should all the following blocks:\none\ntwo\nthree\nfour</p></div>\n<p>This is the next paragraph</p>\n';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip without an id", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  /**
   * <div class="admonition tip">
   *   <p class="admonition-title" id="tip_None">
   *     <i class="fa fa-lightbulb-o"></i>
   *     this is an optional title, and it should be translatable
   *   </p>
   *   <p>
   *     This is the content of the tip, and it should be translatable
   *     This is more stuff that is still part of the content of the tip
   *   </p>
   * </div>
   * <p>This is the next paragraph</p>
   */
  const expected =
    '<div class="admonition tip"><p class="admonition-title" id="tip_None"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div>\n<p>This is the next paragraph</p>\n';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip without a title", t => {
  t.plan(1);
  const input =
    "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
  const output = markdownToHtml(input, tip);
  /**
   * <div class="admonition tip">
   *   <p class="admonition-title" id="tip_tip-0">
   *     <i class="fa fa-lightbulb-o"></i>
   *     Teaching Tip
   *   </p>
   *   <p>
   *     This is the content of the tip, and it should be translatable
   *     This is more stuff that is still part of the content of the tip
   *   </p>
   * </div>
   * <p>This is the next paragraph</p>
   */
  const expected =
    '<div class="admonition tip"><p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>Teaching Tip</p><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div>\n<p>This is the next paragraph</p>\n';
  t.equal(output, expected);
});

test("tip plugin renders a tip with multiple children", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n    This is the content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  /**
   * <div class="admonition tip">
   *   <p class="admonition-title" id="tip_tip-0">
   *     <i class="fa fa-lightbulb-o"></i>
   *     this is an optional title, and it should be translatable
   *   </p>
   *   <p>
   *     This is the content of the tip, and it should be translatable
   *   </p>
   *   <p>
   *     This is more stuff that is still part of the content of the tip
   *   </p>
   * </div>
   * <p>This is the next paragraph</p>
   */
  const expected =
    '<div class="admonition tip"><p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p><p>This is the content of the tip, and it should be translatable</p><p>This is more stuff that is still part of the content of the tip</p></div>\n<p>This is the next paragraph</p>\n';
  t.equal(output, expected);
});

test("tip plugin renders a basic tip indented with tabs", t => {
  t.plan(1);
  const input =
    '!!!tip "this is an optional title, and it should be translatable" <tip-0>\n\tThis is the content of the tip, and it should be translatable\n\tThis is more stuff that is still part of the content of the tip\n\nThis is the next paragraph';
  const output = markdownToHtml(input, tip);
  /*
    <div class="admonition tip">
      <p class="admonition-title" id="tip_tip-0">
        <i class="fa fa-lightbulb-o"></i>
        this is an optional title, and it should be translatable
      </p>
      <p>
        This is the content of the tip, and it should be translatable
        This is more stuff that is still part of the content of the tip
      </p>
    </div>
    <p>This is the next paragraph</p>
  */
  const expected =
    '<div class="admonition tip"><p class="admonition-title" id="tip_tip-0"><i class="fa fa-lightbulb-o"></i>this is an optional title, and it should be translatable</p><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div>\n<p>This is the next paragraph</p>\n';
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
  const expected = '<div class="admonition guide"><p>inner content</p></div>\n';
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
