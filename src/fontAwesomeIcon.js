let redact;

const FONT_AWESOME_ICON_RE = /^<i class="fa fa-([a-z\-]+)" aria-hidden="true"><\/i>/;
const FONT_AWESOME_ICON = 'fontAwesomeIcon';

/**
 * A very basic plugin whose only purpose is to redact (and restore) Font
 * Awesome icons.
 */
module.exports = function fontAwesomeIcon() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[FONT_AWESOME_ICON] = tokenizeFontAwesomeIcon;

    // Run it just before `html`
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, FONT_AWESOME_ICON);
  }
};

module.exports.restorationMethods = {
  [FONT_AWESOME_ICON]: function(node) {
    return {
      type: 'html',
      value: `<i class="fa fa-${node.redactionData}" aria-hidden="true"></i>`
    };
  }
};


function tokenizeFontAwesomeIcon(eat, value, silent) {
  // We only need to do anything if we're redacting; otherwise, let the icon be
  // parsed by the standard HTML parser.
  if (!redact) {
    return;
  }

  const match = FONT_AWESOME_ICON_RE.exec(value);

  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  const add = eat(match[0]);
  const icon = match[1];

  return add({
    type: 'inlineRedaction',
    redactionType: FONT_AWESOME_ICON,
    redactionData: icon,
    redactionContent: [{
      type: 'text',
      value: icon
    }]
  });
}

tokenizeFontAwesomeIcon.notInLink = true;
tokenizeFontAwesomeIcon.locator = function (value, fromIndex) {
  return value.indexOf('<i class="fa fa-', fromIndex);
}
