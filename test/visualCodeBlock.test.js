const test = require("tape");

const {
  mapMdast,
  markdownToHtml,
  markdownToRedacted,
  markdownToSyntaxTree,
  sourceAndRedactedToHtml,
  sourceAndRedactedToRestored
} = require("./utils");

const visualCodeBlock = require("../src/visualCodeBlock");

test("visualCodeBlocks can render", t => {
  t.plan(1);
  const input = "`some visual block`(#c0ffee)";
  const output = markdownToHtml(input, visualCodeBlock);
  // it's definitely not great that our implementation means that we have to
  // include such verbose styles here in the test. This might be a reason to
  // implement styles as CSS rather than inline.
  const expected =
    '<p><code class="visual-block" style="background-color: #c0ffee; border: none; box-shadow: inset -1px -1px 1px rgba(0,0,0,0.5), inset 1px 1px 1px 0 rgba(255,255,255,0.8); color: #000;">some visual block</code></p>\n';
  t.equal(output, expected);
});

test("visualCodeBlocks work when inside links", t => {
  t.plan(1);
  const input =
    "Check out the [`playSound()`(#fff176)](https://studio.code.org/docs/gamelab/playSound/) block";
  const output = markdownToHtml(input, visualCodeBlock);
  const expected =
    '<p>Check out the <a href="https://studio.code.org/docs/gamelab/playSound/"><code class="visual-block" style="background-color: #fff176; border: none; box-shadow: inset -1px -1px 1px rgba(0,0,0,0.5), inset 1px 1px 1px 0 rgba(255,255,255,0.8); color: #000;">playSound()</code></a> block</p>\n';
  t.equal(output, expected);
});

test("visualCodeBlocks can render in a block", t => {
  t.plan(1);
  const input = "# Test\n\n- `some visual block`(#c0ffee)";
  const output = markdownToHtml(input, visualCodeBlock);
  const expected =
    '<h1>Test</h1>\n<ul>\n<li><code class="visual-block" style="background-color: #c0ffee; border: none; box-shadow: inset -1px -1px 1px rgba(0,0,0,0.5), inset 1px 1px 1px 0 rgba(255,255,255,0.8); color: #000;">some visual block</code></li>\n</ul>\n';
  t.equal(output, expected);
});

test("visualCodeBlocks does not interfere with rendering of regular code blocks", t => {
  t.plan(1);
  const input = "`some regular code`";
  const output = markdownToHtml(input, visualCodeBlock);
  t.equal(output, "<p><code>some regular code</code></p>\n");
});

test("visualCodeBlocks can redact", t => {
  t.plan(1);
  const input = "`some visual block`(#c0ffee)";
  const output = markdownToRedacted(input, visualCodeBlock);
  t.equal(output, "[some visual block][0]\n");
});

test("visualCodeBlocks can restore", t => {
  t.plan(1);
  const source = "`some visual block`(#c0ffee)";
  const redacted = "[un bloc visuel][0]";
  const output = sourceAndRedactedToRestored(source, redacted, visualCodeBlock);
  t.equal(output, "`un bloc visuel`(#c0ffee)\n");
});
