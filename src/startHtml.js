/**
 * start_html
 *
 * This plugin redacts all HTML tags and content in a start_html level string,
 * such that the translator only sees the relevant text to translate.
 *
 * NOTE: this plugin does not support the redaction or restoration of <div>
 *   tags, because Remark does not parse them to begin with
 *   issue: https://github.com/remarkjs/remark/issues/185
 *
 * @example
 * Source: <label
 *          style="margin: 0px; padding: 2px;
 *              line-height: 1; font-size: 40px;
 *              overflow: hidden; word-wrap: break-word;
 *              color: rgb(51, 51, 51);
 *              max-width: 320px; width: 320px; height: 45px;
 *              position: absolute; left: 0px; top: 15px;
 *              text-align: center;"
 *           id="label3">
 *           Success!
 *         </label>
 * Redacted: [][0]Success![][1]
 */

let redact;
const HTML_TAG_RE = /<\/{0,1}[a-zA-Z]+(>|.*?[^?]>)/;
const START_HTML = 'startHtml';

module.exports = function startHtml() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact

    Parser.prototype.inlineTokenizers[START_HTML] = tokenizeStartHtml;

    // redact start_html before the parser tries to parse text as HTML
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, START_HTML);
  }
};

tokenizeStartHtml.notInLink = true;
tokenizeStartHtml.locator = locateStartHtml;

function tokenizeStartHtml(eat, value, silent) {
  const match = HTML_TAG_RE.exec(value);

  if (!match || value.indexOf(match[0]) != 0) {
    return;
  }

  if (silent) {
    return true;
  }

  const add = eat(match[0]);

  if (redact) {
    return add({
      type: 'inlineRedaction',
      redactionType: START_HTML,
      redactionData: match[0],
      redactionContent: [{
        type: 'text',
        value: ''
      }]
    });
  }

  return false;

}

function locateStartHtml(value, fromIndex) {
  return value.indexOf('<', fromIndex);
}

module.exports.restorationMethods = {
  [START_HTML]: function(node) {
    return {
      type: 'rawtext',
      value: node.redactionData
    }
  }
}
