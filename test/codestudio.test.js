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
  t.equal(
    output,
    '<p>basic <div class="stage-guide" data-start="2"></div> content</p>\n'
  );
  input = "basic [code-studio 2-5] content";
  output = markdownToHtml(input, codestudio);
  t.equal(
    output,
    '<p>basic <div class="stage-guide" data-start="2" data-end="5"></div> content</p>\n'
  );
  input = "basic [code-studio 12903-19293] content";
  output = markdownToHtml(input, codestudio);
  t.equal(
    output,
    '<p>basic <div class="stage-guide" data-start="12903" data-end="19293"></div> content</p>\n'
  );
});

// Redact

test("codestudio can redact", t => {
  t.plan(1);
  const input = "basic [code-studio] content";
  const output = markdownToRedacted(input, codestudio);
  t.equal(output, "basic [][0] content\n");
});

// Restore

test("codestudio can restore back to markdown", t => {
  t.plan(1);
  const source = "basic [code-studio] content";
  const redacted = "contenu [][0] de base\n";
  const output = sourceAndRedactedToRestored(source, redacted, codestudio);
  t.equal(output, "contenu [code-studio] de base\n");
});

test("codestudio can restore back to markdown with optional parameters", t => {
  const redacted = "contenu [][0] de base\n";
  t.plan(3);

  let source = "basic [code-studio 2] content";
  let output = sourceAndRedactedToRestored(source, redacted, codestudio);
  t.equal(output, "contenu [code-studio 2] de base\n");

  source = "basic [code-studio 2-5] content";
  output = sourceAndRedactedToRestored(source, redacted, codestudio);
  t.equal(output, "contenu [code-studio 2-5] de base\n");

  source = "basic [code-studio 12903-19201] content";
  output = sourceAndRedactedToRestored(source, redacted, codestudio);
  t.equal(output, "contenu [code-studio 12903-19201] de base\n");
});

test("codestudio can restore back to html", t => {
  t.plan(1);
  const source = "basic [code-studio] content";
  const redacted = "contenu [][0] de base\n";
  const output = sourceAndRedactedToHtml(source, redacted, codestudio);
  t.equal(output, '<p>contenu <div class="stage-guide"></div> de base</p>\n');
});

test("codestudio can restore back to html with optional parameters", t => {
  const redacted = "contenu [][0] de base\n";
  t.plan(3);

  let source = "basic [code-studio 2] content";
  let output = sourceAndRedactedToHtml(source, redacted, codestudio);
  t.equal(
    output,
    '<p>contenu <div class="stage-guide" data-start="2"></div> de base</p>\n'
  );

  source = "basic [code-studio 2-5] content";
  output = sourceAndRedactedToHtml(source, redacted, codestudio);
  t.equal(
    output,
    '<p>contenu <div class="stage-guide" data-start="2" data-end="5"></div> de base</p>\n'
  );

  source = "basic [code-studio 12903-19201] content";
  output = sourceAndRedactedToHtml(source, redacted, codestudio);
  t.equal(
    output,
    '<p>contenu <div class="stage-guide" data-start="12903" data-end="19201"></div> de base</p>\n'
  );
});
