/**
 * Parser extension to support rendering of links (including images and
 * autolinks) when in redact mode.
 *
 * Note that most plugins that support redact mode are adding the ability to
 * parse an entirely new syntax in both normal and redact mode, whereas this one
 * is _extending_ the build-in ability to parse the various types of links to
 * add redact mode.
 *
 * As such, this basically acts as an interstitial between the built-in link
 * method to turn its output into a redaction when appropriate.
 *
 * @example
 *
 *   const parse = require('remark-parse');
 *   const stringify = require('remark-stringify');
 *   const unified = require('unified');
 *
 *   const source = "Markdown containing [a link](http://example.com) to be redacted"
 *   // returns "Markdown containing [a link][0] to be redacted"
 *   unified().use([
 *     parse,                          // use the standard parser
 *     redactedLink,                   // use this extension
 *     { settings: { redact: true } }, // put the parser in redaction mode
 *     stringify,                      // output back to markdown
 *     renderRedactions                // add ability to render the redaction generated by this extension
 *   ]).stringify(source);
 *
 * @see https://github.com/remarkjs/remark/tree/remark-parse%405.0.0/packages/remark-parse#extending-the-parser
 * @see renderRedactions
 * @requires restorationRegistration
 */
module.exports = function redactedLink() {
  const Parser = this.Parser;

  if (Parser) {
    // If in redacted mode, run this instead of original link and autolink
    // tokenizers. If running regularly, do nothing special.
    if (!Parser.prototype.options.redact) {
      return;
    }

    const tokenizers = Parser.prototype.inlineTokenizers;

    // override links
    const originalLinkTokenizer = tokenizers.link;
    tokenizers.link = function(eat, value, silent) {
      const link = originalLinkTokenizer.call(this, eat, value, silent);
      if (!link) {
        return;
      }

      if (link.type === 'link') {
        redactLink(link);
      } else if (link.type === 'image') {
        redactImage(link);
      }
    };
    tokenizers.link.locator = originalLinkTokenizer.locator;

    // override autolinks
    const originalAutoLinkTokenizer = tokenizers.autoLink;
    tokenizers.autoLink = function(eat, value, silent) {
      const autoLink = originalAutoLinkTokenizer.call(this, eat, value, silent);
      if (autoLink) {
        redactLink(autoLink);
      }
    };
    tokenizers.autoLink.locator = originalAutoLinkTokenizer.locator;
  }
};

function redactLink(node) {
  node.redactionType = node.type;
  node.type = 'inlineRedaction';

  node.redactionData = {
    url: node.url,
    title: node.title
  };
  delete node.url;
  delete node.title;

  node.redactionContent = node.children;
}

function redactImage(node) {
  node.redactionType = node.type;
  node.type = 'inlineRedaction';

  node.redactionData = {
    url: node.url
  };
  delete node.url;

  node.redactionContent = [
    {
      type: 'text',
      value: node.alt || ''
    }
  ];
  delete node.alt;
}

module.exports.restorationMethods = {
  link: function(node, content, children) {
    // If this link has translated content, use that as the children. Otherwise, it could either
    // be empty or have children of its own, and in either case we just want to use whatever
    // we're given.
    if (content) {
      children = [{
        type: 'text',
        value: content
      }];
    }
    return {
      type: 'link',
      url: node.redactionData.url,
      title: node.redactionData.title,
      children: childNodes
    };
  },
  image: function(node, content) {
    return {
      type: 'image',
      url: node.redactionData.url,
      alt: content
    };
  }
};
