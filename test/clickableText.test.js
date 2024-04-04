const test = require("tape");
const { markdownToHtml } = require("./utils");
const clickableText = require("../src/clickableText");

test("clickable text is converted", (t) => {
  t.plan(1);
  const markdown = "before [middle](#clickable=myid) after";
  const expected =
    '<p>before <b data-id="myid" class="clickable-text">middle</b> after</p>';

  const rendered = markdownToHtml(markdown, clickableText);
  t.equal(rendered, expected);
});

test("regular link is not converted", (t) => {
  t.plan(1);
  const markdown = "before [middle](#other=myid) after";
  const expected = '<p>before <a href="#other=myid">middle</a> after</p>';

  const rendered = markdownToHtml(markdown, clickableText);
  t.equal(rendered, expected);
});
