let redact;

const removeIndentation = require("remark-parse/lib/util/remove-indentation");

const RE = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?\n/;
const TIP = "tip";

const ICON_CLASS = {
  tip: "fa fa-lightbulb-o",
  discussion: "fa fa-comments",
  slide: "fa fa-list-alt",
  assessment: "fa fa-check-circle",
  content: "fa fa-mortar-board",
  say: "fa fa-microphone",
  guide: "fa fa-pencil-square-o"
};

const DEFAULT_TITLE = {
  tip: "Teaching Tip",
  discussion: "Discussion Goal",
  slide: "Slide",
  assessment: "Assessment Opportunity",
  content: "Content Corner",
  say: "Remarks"
};

module.exports = function tip() {
  const Parser = this.Parser;

  if (Parser) {
    const tokenizers = Parser.prototype.blockTokenizers;
    const methods = Parser.prototype.blockMethods;

    redact = Parser.prototype.options.redact;

    tokenizers.tip = tokenizeTip;

    /* Run it just before `paragraph`. */
    methods.splice(methods.indexOf("paragraph"), 0, "tip");
  }
};

module.exports.restorationMethods = {
  [TIP]: function(node, content, children) {
    let value = `!!!${node.redactionData.tipType}`;
    if (content) {
      value += ` "${content}"`;
    }
    if (node.redactionData.id) {
      value += ` <${node.redactionData.id}>`;
    }
    return {
      type: "paragraph",
      children: [
        {
          type: "rawtext",
          value: value + "\n"
        },
        {
          type: "indent",
          children
        }
      ]
    };
  }
};

function tokenizeTip(eat, value, silent) {
  const match = RE.exec(value);
  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  // find the indented block that represents the content of the tip. Blocks are
  // considered to be indented if they start with at least four spaces, where a
  // tab is considered to be equivalent to four spaces.
  //
  // This is distinct from considering a block to be indented if it just starts
  // with either four spaces or a tab in that it accounts for blocks that are
  // indented with a combination of tabs and spaces.
  let index = match[0].length;
  while (index < value.length) {
    index++;
    if (value.charAt(index) === "\n") {
      if (value.charAt(index + 1) !== "\n") {
        let nextLine = value.slice(index + 1, index + 5);
        nextLine = nextLine.replace("\t", "    ");
        if (!nextLine.startsWith("    ")) {
          break;
        }
      }
    }
  }

  const tipType = match[1];
  const originalTitle = match[2] || "";
  const displayTitle = originalTitle || DEFAULT_TITLE[tipType];
  const id = match[3];
  const subvalue = value.slice(match[0].length, index);
  const children = this.tokenizeBlock(
    removeIndentation(subvalue, 4),
    eat.now()
  );
  const add = eat(match[0] + subvalue);

  if (redact) {
    return add({
      type: "blockRedaction",
      children,
      redactionType: "tip",
      redactionContent: [
        {
          type: "text",
          value: originalTitle
        }
      ],
      redactionData: {
        id,
        tipType
      }
    });
  }

  if (displayTitle) {
    children.unshift({
      type: "paragraph",
      children: [
        {
          type: "emphasis",
          children: [],
          data: {
            hName: "i",
            hProperties: {
              className: ICON_CLASS[tipType]
            }
          }
        },
        {
          type: "text",
          value: displayTitle
        }
      ],
      data: {
        hProperties: {
          className: "admonition-title",
          id: `${tipType}_${id || 'None'}`
        }
      }
    });
  }

  return add({
    type: "div",
    children,
    data: {
      hProperties: {
        className: `admonition ${tipType}`
      }
    }
  });
}
