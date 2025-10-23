const test = require("tape")
const { markdownToHtml } = require("./utils")
const expandableImages = require("../src/expandableImages")

test("plain image markdown is converted to a regular img element", (t) => {
  t.plan(1)
  const markdown = "![plain image](https://example.com/image.png)"
  const expected = '<p><img src="https://example.com/image.png" alt="plain image"></p>'

  const rendered = markdownToHtml(markdown, expandableImages)
  t.equal(rendered, expected)
})

test("expandable image markdown is converted to a span with a data-url attribute", (t) => {
  t.plan(1)
  const markdown = "Check out this cool ![expandable](https://example.com/image.png) dog!"
  const expected =
    '<p>Check out this cool <span data-url="https://example.com/image.png" class="expandable-image"></span> dog!</p>'

  const rendered = markdownToHtml(markdown, expandableImages)
  t.equal(rendered, expected)
})

test("expandable image markdown with alt text is converted to a span with a data-url attribute and alt text content", (t) => {
  t.plan(1)
  const markdown =
    "Check out this cool ![image of a dog expandable](https://example.com/image.png) dog!"
  const expected =
    '<p>Check out this cool <span data-url="https://example.com/image.png" class="expandable-image">image of a dog</span> dog!</p>'

  const rendered = markdownToHtml(markdown, expandableImages)
  t.equal(rendered, expected)
})

test("'expandable' anywhere but the end of the alt text does not make it expandable", (t) => {
  t.plan(1)
  const markdown = "![expandable image](https://example.com/image.png)"
  const expected =
    '<p><img src="https://example.com/image.png" alt="expandable image"></p>'

  const rendered = markdownToHtml(markdown, expandableImages)
  t.equal(rendered, expected)
})

test("'expandable' flag at the end of the alt text handles 'expandable' elsewhere in the alt text", (t) => {
  t.plan(1)
  const markdown =
    "Check out this cool ![expandable image of a dog expandable](https://example.com/image.png) dog!"
  const expected =
    '<p>Check out this cool <span data-url="https://example.com/image.png" class="expandable-image">expandable image of a dog</span> dog!</p>'

  const rendered = markdownToHtml(markdown, expandableImages)
  t.equal(rendered, expected)
})
