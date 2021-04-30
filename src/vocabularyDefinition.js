let redact;

const VOCAB_DEFINITION_RE = /^\[v ([a-z_]+)\/([a-z\-]+)\/(\d+)\]/;
const VOCAB_DEFINITION = 'vocabularyDefinition';

/**
 * Plugin that adds support for "Vocab Definitions" as used by Dashboard's
 * Markdown Preprocessor
 *
 * Note that vocab definitions are ONLY supported in redaction mode; rendering
 * them out requires database access, so they can only be rendered by Dashboard
 * itself.
 *
 * see https://github.com/code-dot-org/code-dot-org/blob/35c0853eefd8ffe656540cfb67fe1281de8eb434/dashboard/lib/services/markdown_preprocessor.rb
 * @requires restorationRegistration
 */
module.exports = function vocabularyDefinition() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[VOCAB_DEFINITION] = tokenizeVocabularyDefinition;

    // Run it just before `html`
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, VOCAB_DEFINITION);
  }
};

module.exports.restorationMethods = {
  [VOCAB_DEFINITION]: function(node) {
    const value = `[v ${node.redactionData.vocabulary}/${node.redactionData.offering}/${node.redactionData.version}]`;
    return {
      type: 'rawtext',
      value
    };
  }
};

tokenizeVocabularyDefinition.notInLink = true;
tokenizeVocabularyDefinition.locator = locateVocabularyDefinition;

function tokenizeVocabularyDefinition(eat, value, silent) {
  const match = VOCAB_DEFINITION_RE.exec(value);

  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  const add = eat(match[0]);

  if (redact) {
    const redactionData = {
      vocabulary: match[1],
      offering: match[2],
      version: match[3],
    };

    return add({
      type: 'inlineRedaction',
      redactionType: VOCAB_DEFINITION,
      redactionData,
      redactionContent: [{
        type: 'text',
        value: redactionData.vocabulary
      }]
    });
  } else {
    // In non-redaction mode, eat the definition so it is not treated as a
    // different bit of syntax (such as linkReference) but simply output it
    // back to the raw string
    return add({
      type: 'rawtext',
      value: match[0]
    });
  }
}

function locateVocabularyDefinition(value, fromIndex) {
  return value.indexOf('[v ', fromIndex);
}
