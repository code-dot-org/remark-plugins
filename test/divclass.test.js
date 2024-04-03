const test = require("tape");
const divclass = require("../src/divclass");
const link = require("../src/link");

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored,
  sourceAndRedactedToHtml
} = require("./utils");

test("divclass can render", t => {
  t.plan(1);
  const input = "[col-33]\n\nsimple content\n\n[/col-33]";
  const output = markdownToHtml(input, divclass);
  t.equal(output, '<div class="col-33"><p>simple content</p></div>');
});

test("divclass can render even with a bunch of extra whitespace", t => {
  t.plan(1);
  const input = "[col-33]   \n \nsimple content\n  \n     [/col-33]";
  const output = markdownToHtml(input, divclass);
  t.equal(output, '<div class="col-33"><p>simple content</p></div>');
});

test("divclass works without content - but only if separated by FOUR newlines", t => {
  t.plan(2);
  const validInput = "[empty]\n\n\n\n[/empty]";
  t.equal(markdownToHtml(validInput, divclass), '<div class="empty"></div>');
  const invalidInput = "[empty]\n\n[/empty]";
  t.equal(
    markdownToHtml(invalidInput, divclass),
    "<p>[empty]</p>\n<p>[/empty]</p>"
  );
});

test("divclass can render within other content", t => {
  t.plan(1);
  const input =
    "outside of div\n\n[divname]\n\ninside div\n\n[/divname]\n\nmore outside";
  const output = markdownToHtml(input, divclass);
  t.equal(
    output,
    '<p>outside of div</p>\n<div class="divname"><p>inside div</p></div>\n<p>more outside</p>'
  );
});

test("divclass doesn't care about duplicate classes", t => {
  t.plan(1);
  const input =
    "[classname]\n\nfirst\n\n[/classname]\n\n[classname]\n\nsecond\n\n[/classname]";
  const output = markdownToHtml(input, divclass);
  t.equal(
    output,
    '<div class="classname"><p>first</p></div>\n<div class="classname"><p>second</p></div>'
  );
});

test("divclasses can nest", t => {
  t.plan(1);
  const input = "[outer]\n\n[inner]\n\nnested\n\n[/inner]\n\n[/outer]";
  const output = markdownToHtml(input, divclass);
  t.equal(
    output,
    '<div class="outer"><div class="inner"><p>nested</p></div></div>'
  );
});

test("divclasses can nest duplicate", t => {
  t.plan(1);
  const input =
    "[classname]\n\ncontent\n\n[classname]\n\ninner content\n\n[/classname]\n\ncontent\n\n[/classname]";
  const output = markdownToHtml(input, divclass);
  t.equal(
    output,
    '<div class="classname"><p>content</p><div class="classname"><p>inner content</p></div><p>content</p></div>'
  );
});

test("divclasses can nest as deeply as you want", t => {
  t.plan(20);
  const markdownOpen = "[classname]\n\n";
  const markdownClose = "\n\n[/classname]";
  const markdownContent = "content";
  const htmlOpen = '<div class="classname">';
  const htmlClose = "</div>";
  const htmlContent = "<p>content</p>";

  let input = markdownContent;
  let output = htmlContent;
  for (let _ = 0; _ < 20; _++) {
    input = `${markdownOpen}${input}${markdownClose}`;
    output = `${htmlOpen}${output}${htmlClose}`;
    t.equal(markdownToHtml(input, divclass), output);
  }
});

test("divclass requires class-specific termination", t => {
  t.plan(1);
  const input = "[example]\n\nsimple content\n\n[/]";
  const output = markdownToHtml(input, divclass);
  t.equal(output, "<p>[example]</p>\n<p>simple content</p>\n<p>[/]</p>");
});

test("divclasses must be in their own paragraphs", t => {
  t.plan(1);
  const input = "[example]simple content[/example]";
  const output = markdownToHtml(input, divclass);
  t.equal(output, "<p>[example]simple content[/example]</p>");
});

test("divclasses will not unindent", t => {
  t.plan(1);
  const input = "[example]\n\n    simple content\n\n[/example]";
  const output = markdownToHtml(input, divclass);
  t.equal(
    output,
    '<div class="example"><pre><code>simple content\n</code></pre></div>'
  );
});

test("divclasses can render complex content", t => {
  t.plan(1);
  const input =
    "[complex-example]\n\n-   an ordered list\n-   with **inline** _formatting_, too\n\n[/complex-example]";
  const output = markdownToHtml(input, divclass);
  t.equal(
    output,
    '<div class="complex-example"><ul>\n<li>an ordered list</li>\n<li>with <strong>inline</strong> <em>formatting</em>, too</li>\n</ul></div>'
  );
});

test("divclass can redact", t => {
  t.plan(1);
  const input = "[col-33]\n\nsimple content\n\n[/col-33]";
  const output = markdownToRedacted(input, divclass);
  t.equal(output, "[][0]\n\nsimple content\n\n[/][0]\n");
});

test("divclass can redact without content - but only if separated by FOUR newlines", t => {
  t.plan(1);
  const input = "[empty]\n\n\n\n[/empty]";
  const output = markdownToRedacted(input, divclass);
  t.equal(output, "[][0]\n\n\n\n[/][0]\n");
});

test("divclass can redact within other content", t => {
  t.plan(1);
  const input =
    "outside of div\n\n[divname]\n\ninside div\n\n[/divname]\n\nmore outside";
  const output = markdownToRedacted(input, divclass);
  t.equal(
    output,
    "outside of div\n\n[][0]\n\ninside div\n\n[/][0]\n\nmore outside\n"
  );
});

test("divclass redaction doesn't care about duplicate classes", t => {
  t.plan(1);
  const input =
    "[classname]\n\nfirst\n\n[/classname]\n\n[classname]\n\nsecond\n\n[/classname]";
  const output = markdownToRedacted(input, divclass);
  t.equal(output, "[][0]\n\nfirst\n\n[/][0]\n\n[][1]\n\nsecond\n\n[/][1]\n");
});

test("divclass can redact nested divclasses", t => {
  t.plan(1);
  const input = "[outer]\n\n[inner]\n\nnested\n\n[/inner]\n\n[/outer]";
  const output = markdownToRedacted(input, divclass);
  t.equal(output, "[][0]\n\n[][1]\n\nnested\n\n[/][1]\n\n[/][0]\n");
});

test("divclass can redact inline content inside a divclass", t => {
  t.plan(1);
  const input =
    "[complex-example]\n\n-   an ordered list\n-   with [other redacted content](http://example.com)\n\n[/complex-example]";
  const output = markdownToRedacted(input, [divclass, link]);
  t.equal(
    output,
    "[][0]\n\n-   an ordered list\n-   with [other redacted content][1]\n\n[/][0]\n"
  );
});

test("divclass can restore back to markdown", t => {
  t.plan(1);
  const source = "[col-33]\n\nsimple content\n\n[/col-33]";
  const redacted = "[][0]\n\ncontenu simple\n\n[/][0]\n";
  const output = sourceAndRedactedToRestored(source, redacted, divclass);
  t.equal(output, "[col-33]\n\ncontenu simple\n\n[/col-33]\n");
});

test("divclass can restore back to HTML", t => {
  t.plan(1);
  const source = "[col-33]\n\nsimple content\n\n[/col-33]";
  const redacted = "[][0]\n\ncontenu simple\n\n[/][0]\n";
  const output = sourceAndRedactedToHtml(source, redacted, divclass);
  t.equal(output, '<div class="col-33"><p>contenu simple</p></div>');
});

test("divclass can restore nested divclasses", t => {
  t.plan(1);
  const source = "[outer]\n\n[inner]\n\nnested\n\n[/inner]\n\n[/outer]";
  const redacted = "[][0]\n\n[][1]\n\nimbriqué\n\n[/][1]\n\n[/][0]\n";
  const output = sourceAndRedactedToHtml(source, redacted, divclass);
  t.equal(
    output,
    '<div class="outer"><div class="inner"><p>imbriqué</p></div></div>'
  );
});

test("divclass can restore inline content inside a divclass", t => {
  t.plan(1);
  const source =
    "[complex-example]\n\n-   an ordered list\n-   with [other redacted content](http://example.com)\n\n[/complex-example]";
  const redacted =
    "[][0]\n\n-   une liste ordonnée\n-   avec [d'autres contenus rédigés][1]\n\n[/][0]\n";
  const output = sourceAndRedactedToHtml(source, redacted, [divclass, link]);
  t.equal(
    output,
    '<div class="complex-example"><ul>\n<li>une liste ordonnée</li>\n<li>avec <a href="http://example.com">d\'autres contenus rédigés</a></li>\n</ul></div>'
  );
});

test("divclass can restore content with reordered indexes", t => {
  t.plan(1);
  const source = "[zero]\n\nzero\n\n[/zero]\n\n[one]\n\none\n\n[/one]";
  const redacted = "[][1]\n\nun\n\n[/][1]\n\n[][0]\n\nzéro\n\n[/][0]";
  const output = sourceAndRedactedToHtml(source, redacted, divclass);
  t.equal(
    output,
    '<div class="one"><p>un</p></div>\n<div class="zero"><p>zéro</p></div>'
  );
});

test("divclass can restore content with nesting changes", t => {
  t.plan(3);
  const source = "[zero]\n\n[one]\n\n\n\n[/one]\n\n[/zero]";

  const unNestedRedaction = "[][0]\n\n\n\n[/][0]\n\n[][1]\n\n\n\n[/][1]";
  t.equal(
    sourceAndRedactedToHtml(source, unNestedRedaction, divclass),
    '<div class="zero"></div>\n<div class="one"></div>'
  );

  const invertedRedaction = "[][1]\n\n[][0]\n\n\n\n[/][0]\n\n[/][1]";
  t.equal(
    sourceAndRedactedToHtml(source, invertedRedaction, divclass),
    '<div class="one"><div class="zero"></div></div>'
  );

  const brokenRedaction = "[][0]\n\n[][1]\n\n\n\n[/][0]\n\n[/][1]";
  t.equal(
    sourceAndRedactedToHtml(source, brokenRedaction, divclass),
    '<div class="zero"><p>[][1]</p></div>\n<p>[/][1]</p>'
  );
});

test("divclass can restore content that adds extra content", t => {
  t.plan(2);
  const source =
    "[first]\n\nFirst\n\n[/first]\n\n[second]\n\nSecond\n\n[/second]";

  const reusedIndex =
    "[][0]\n\nPremier\n\n[/][0]\n\n[][1]\n\nDeuxième\n\n[/][1]\n\n[][1]\n\nTroisième\n\n[/][1]";
  t.equal(
    sourceAndRedactedToHtml(source, reusedIndex, divclass),
    '<div class="first"><p>Premier</p></div>\n<div class="second"><p>Deuxième</p></div>\n<div class="second"><p>Troisième</p></div>'
  );

  // in every case, extra redactions default to raw markdown
  const extraIndex =
    "[][0]\n\nPremier\n\n[/][0]\n\n[][1]\n\nDeuxième\n\n[/][1]\n\n[][2]\n\nTroisième\n\n[/][2]";
  t.equal(
    sourceAndRedactedToHtml(source, extraIndex, divclass),
    '<div class="first"><p>Premier</p></div>\n<div class="second"><p>Deuxième</p></div>\n<p>[][2]</p>\n<p>Troisième</p>\n<p>[/][2]</p>'
  );
});

test("divclass can NOT restore content if required whitespace is removed", t => {
  t.plan(1);
  const source = "[clazz]\n\nCat\n\n[/clazz]";
  const redacted = "[][0]\nChat\n[/][0]";
  const output = sourceAndRedactedToHtml(source, redacted, divclass);
  t.equal(output, "<p>[][0]\nChat\n[/][0]</p>");
});
