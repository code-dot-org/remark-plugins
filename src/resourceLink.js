let redact;

const RESOURCE_LINK_RE = /^\[r (?<resource>[a-z0-9\-\_]+)\/(?<offering>[a-z\-]+)\/(?<version>\d+)\]/;
const RESOURCE_LINK = 'resourceLink';

/**
 * Plugin that adds support for "Resource Links" as used by Dashboard's
 * Markdown Preprocessor
 *
 * Note that resource links are ONLY supported in redaction mode; rendering
 * them out requires database access, so they can only be rendered by Dashboard
 * itself.
 *
 * see https://github.com/code-dot-org/code-dot-org/blob/35c0853eefd8ffe656540cfb67fe1281de8eb434/dashboard/lib/services/markdown_preprocessor.rb
 * @requires restorationRegistration
 */
module.exports = function resourceLink() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[RESOURCE_LINK] = tokenizeResourceLink;

    // Run it just before `html`
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, RESOURCE_LINK);
  }
};

module.exports.restorationMethods = {
  [RESOURCE_LINK]: function(node) {
    const value = `[r ${node.redactionData.resource}/${node.redactionData.offering}/${node.redactionData.version}]`;
    return {
      type: 'rawtext',
      value
    };
  }
};

tokenizeResourceLink.notInLink = true;
tokenizeResourceLink.locator = locateResourceLink;

function tokenizeResourceLink(eat, value, silent) {
  const match = RESOURCE_LINK_RE.exec(value);

  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  const add = eat(match[0]);

  if (redact) {
    return add({
      type: 'inlineRedaction',
      redactionType: RESOURCE_LINK,
      redactionData: match.groups,
      redactionContent: [{
        type: 'text',
        value: match.groups.resource
      }]
    });
  } else {
    // In non-redaction mode, eat the link so it is not treated as a different
    // bit of syntax (such as linkReference) but simply output it back to the
    // raw string
    return add({
      type: 'rawtext',
      value: match[0]
    });
  }
}

function locateResourceLink(value, fromIndex) {
  return value.indexOf('[r ', fromIndex);
}
