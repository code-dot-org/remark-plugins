const test = require("tape");
const codestudio = require("../src/codestudio");

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored,
  sourceAndRedactedToHtml
} = require("./utils");

// Render

test("codestudio can render", t => {
  t.plan(1);
  const input = "basic [code-studio] content";
  const output = markdownToHtml(input, codestudio);
  t.equal(output, '<p>basic <div class="stage-guide"></div> content</p>\n');
});

test("codestudio can render with optional parameters", t => {
  t.plan(3);
  let input = "basic [code-studio 2] content";
  let output = markdownToHtml(input, codestudio);
  t.equal(output, '<p>basic <div class="stage-guide" data-start="2"></div> content</p>\n');
  input = "basic [code-studio 2-5] content";
  output = markdownToHtml(input, codestudio);
  t.equal(output, '<p>basic <div class="stage-guide" data-start="2" data-end="5"></div> content</p>\n');
  input = "basic [code-studio 12903-19293] content";
  output = markdownToHtml(input, codestudio);
  t.equal(output, '<p>basic <div class="stage-guide" data-start="12903" data-end="19293"></div> content</p>\n');
});

//// Redact

//test("codestudio can redact", t => {
//});

//// Restore

//test("codestudio can restore", t => {
//  t.plan(1);
//});
