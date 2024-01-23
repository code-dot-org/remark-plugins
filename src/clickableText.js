/**
 * Support for clickable text in instructions.
 *
 * When the text markdown contains:
 *   [text](#clickable=id)
 *
 * This code will generate
 *   <b data-id="id" class="clickable-text">text</b>
 */

const CLICKABLETEXT_RE = /#clickable=(.*)/;

module.exports = function clickableText() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const originalLinkTokenizer = tokenizers.link;
  tokenizers.link = function (eat, value, silent) {
    const link = originalLinkTokenizer.call(this, eat, value, silent);
    if (link && link.url && link.url.startsWith("#clickable=")) {
      const matches = link.url.match(CLICKABLETEXT_RE);
      if (matches && matches.length === 2) {
        const id = matches[1];

        link.type = "b";
        link.data = {
          hName: "b",
          hProperties: {
            dataId: id,
            className: "clickable-text",
          },
        };
      }
    }

    return link;
  };
  tokenizers.link.locator = originalLinkTokenizer.locator;
};
