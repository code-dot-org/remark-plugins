let redact;

const BLOCKFIELD_RE = /^{([^}]+)}/;
const BLOCKFIELD = 'blockfield';

module.exports = function blockfield() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[BLOCKFIELD] = tokenizeResourcelink;

    // Run it just before `html`.
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, BLOCKFIELD);
  }
};

module.exports.restorationMethods = {
  [BLOCKFIELD]: function(node) {
    return {
      type: 'rawtext',
      value: `{${node.redactionData}}`
    };
  }
};

tokenizeResourcelink.notInLink = true;
tokenizeResourcelink.locator = locateResourcelink;

function tokenizeResourcelink(eat, value, silent) {
  const match = BLOCKFIELD_RE.exec(value);

  // Custom block fields are ONLY supported in redaction mode.
  if (match && redact) {
    if (silent) {
      return true;
    }

    const slug = match[1];
    return eat(match[0])({
      type: 'inlineRedaction',
      redactionType: BLOCKFIELD,
      redactionData: slug,
      redactionContent: [
        {
          type: 'text',
          value: slug
        }
      ]
    });
  }
}

function locateResourcelink(value, fromIndex) {
  return value.indexOf('{', fromIndex);
}
