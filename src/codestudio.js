let redact;

const CODESTUDIO_RE = /^(\[code-studio\s*)(\d+)?-?(\d+)?\]/;
const CODESTUDIO = "codestudio";

/**
 * This plugin renders the special "codestudio" syntax used by
 * CurriculumBuilder for the code studio pullthrough.
 *
 * Specifically, given syntax like `[code-studio]`, optionally with range
 * parameters like `[code-studio 1]` or `[code-studio 3-5]`, it renders a div
 * with the class "stage_guide" and the optional parameters included as data
 * attributes.
 *
 * @example
 *
 *   const parse = require('remark-parse');
 *   const stringify = require('remark-stringify');
 *   const unified = require('unified');
 *
 *   const source = "Markdown containing [code-studio 1-2] syntax"
 *   // returns: "<p>Markdown containing <div class="stage_guide" data-start="1" data-end="2"></div> syntax</p>"
 *   unified().use([
 *     parse,      // use the standard parser
 *     codestudio, // use this extension
 *     stringify,  // output back to markdown
 *   ]).stringify(source);
 */
module.exports = function codestudio() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[CODESTUDIO] = tokenizeCodeStudio;
    Parser.prototype.inlineMethods.unshift(CODESTUDIO);
  }
};

module.exports.restorationMethods = {
  [CODESTUDIO]: function(node) {
    let value = "[code-studio";

    if (node.redactionData.start) {
      value += " " + node.redactionData.start;
      if (node.redactionData.end) {
        value += "-" + node.redactionData.end;
      }
    }

    value += "]";
    return {
      type: "rawtext",
      value
    };
  }
};

tokenizeCodeStudio.notInLink = true;
tokenizeCodeStudio.locator = locateCodeStudio;

function tokenizeCodeStudio(eat, value, silent) {
  const match = CODESTUDIO_RE.exec(value);

  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  const add = eat(match[0]);
  const start = match[2];
  const end = match[3];

  if (redact) {
    return add({
      type: "inlineRedaction",
      redactionType: CODESTUDIO,
      redactionData: { start, end }
    });
  }

  return add({
    type: "div",
    data: {
      hProperties: {
        className: "stage_guide",
        dataStart: start,
        dataEnd: end
      }
    }
  });
}

function locateCodeStudio(value, fromIndex) {
  const index = value.indexOf("[code-studio");
  if (index >= fromIndex) {
    return index;
  }
}
