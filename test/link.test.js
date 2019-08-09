const test = require("tape");

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require("./utils");

const link = require("../src/link");

const examples = {
  link: "[test](http://example.com)",
  image: "![test](http://example.com/test.jpg)",
  autolink: "<http://example.com>"
};

test("link plugin redacts links", t => {
  t.plan(1);
  t.equal(markdownToRedacted(examples.link, link), "[test][0]\n");
});

test("link plugin redacts images", t => {
  t.plan(1);
  t.equal(markdownToRedacted(examples.image, link), "[test][0]\n");
});

test("link plugin redacts autolinks", t => {
  t.plan(1);
  t.equal(markdownToRedacted(examples.autolink, link), "[http://example.com][0]\n");
});

test("link plugin can restore links back to markdown", t => {
  t.plan(1);
  const redacted = "[any-text][0]";
  const restored = sourceAndRedactedToRestored(examples.link, redacted, link);
  t.equal(restored, "[any-text](http://example.com)\n");
});

test("link plugin can restore images back to markdown", t => {
  t.plan(1);
  const redacted = "[any-text][0]";
  const restored = sourceAndRedactedToRestored(examples.image, redacted, link);
  t.equal(restored, "![any-text](http://example.com/test.jpg)\n");
});

test("link plugin can restore autolinks back to markdown", t => {
  t.plan(1);
  const redacted = "[any-text][0]";
  const restored = sourceAndRedactedToRestored(examples.autolink, redacted, link);
  t.equal(restored, "[any-text](http://example.com)\n");
});
