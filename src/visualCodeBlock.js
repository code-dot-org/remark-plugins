let redact;

const VISUAL_BLOCK = "visualCodeBlock";
const VISUAL_BLOCK_RE = /^`([^`]*)`\((#[A-Fa-f0-9]{6})\)/;

/**
 * A Remark-Redactable plugin for creating generic styled code blocks which
 * resemble - but are not identical to - blocks used by visual programming
 * languages like Blockly and Droplet.
 *
 * Syntax format: `blockDisplay`(#hexcode)
 *
 * Example: `playSound()`(#fff176)
 * Resulting HTML: <code class="visual-block" style="background-color: #fff176;">playSound()</code>
 *
 * Example: `get nectar`(#00b0bd)
 * Resulting HTML: <code class="visual-block" style="background-color: #00b0bd;">playSound()</code>
 */
module.exports = function visualCodeBlock() {
  if (this.Parser) {
    this.Parser.prototype.inlineTokenizers[
      VISUAL_BLOCK
    ] = tokenizeVisualCodeBlock;
    redact = this.Parser.prototype.options.redact;

    const methods = this.Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf("code"), 0, VISUAL_BLOCK);
  }
};

module.exports.restorationMethods = {
  [VISUAL_BLOCK]: function (node, content) {
    return {
      type: "rawtext",
      value: `\`${content}\`(${node.redactionData})`
    };
  }
};

function tokenizeVisualCodeBlock(eat, value, silent) {
  const match = VISUAL_BLOCK_RE.exec(value);
  if (!match) {
    return;
  }

  const displayText = match[1];
  const color = match[2];

  if (silent) {
    return true;
  }

  const add = eat(match[0]);

  if (redact) {
    return add({
      type: "inlineRedaction",
      redactionType: VISUAL_BLOCK,
      redactionData: color,
      redactionContent: [
        {
          type: "text",
          value: displayText
        }
      ]
    });
  }

  return add({
    type: "inlineCode",
    value: displayText,
    data: {
      hProperties: {
        // Class name is here primarily so that we can style these blocks
        // beyond just background color.
        className: "visual-block",
        style: `background-color: ${color};`
      }
    }
  });
}

tokenizeVisualCodeBlock.notInLink = false;
tokenizeVisualCodeBlock.locator = locateVisualCodeBlock;

function locateVisualCodeBlock(value, fromIndex) {
  return value.indexOf("`", fromIndex);
}
