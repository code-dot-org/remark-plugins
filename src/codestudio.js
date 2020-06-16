let redact;

const CODESTUDIO_RE = /^(\[code-studio\s*)(\d+)?-?(\d+)?\]/
const CODESTUDIO_LOCATOR_RE = /\[code-studio/;
const CODESTUDIO = 'codestudio';

module.exports = function codestudio() {
  if (this.Parser) {
    const Parser = this.Parser;
    const tokenizers = Parser.prototype.inlineTokenizers;
    const methods = Parser.prototype.inlineMethods;

    redact = Parser.prototype.options.redact;

    tokenizers[CODESTUDIO] = tokenizeCodeStudio;
    methods.unshift(CODESTUDIO);
  }
};

module.exports.restorationMethods = {
  [CODESTUDIO]: function(node) {
    throw "TODO: implement this"
    return {
      type: 'text',
      value: `${node.redactionData.tipType}!!! ${node.redactionData.tipLink}`
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
  const start = match[2]
  const end = match[3]

  return add({
    type: 'div',
    data: {
      hProperties: {
        className: 'stage-guide',
        dataStart: start,
        dataEnd: end,
      },
    }
  });
}

function locateCodeStudio(value, fromIndex) {
  const index = value.indexOf("[code-studio");
  if (index >= fromIndex) {
    return index;
  }
}
