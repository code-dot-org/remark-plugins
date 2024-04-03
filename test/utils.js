const unified = require('unified');
const remarkStringify = require('remark-stringify');
const remarkParse = require('remark-parse');
const remark2rehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const defaultSanitizationSchema = require('hast-util-sanitize/lib/github')
const {redact, restore, parseRestorations, renderRestorations} = require('remark-redactable');
const rawtext = require('../src/rawtext');

// create custom sanitization schema as per
// https://github.com/syntax-tree/hast-util-sanitize#schema
// to support our custom syntaxes
const schema = Object.assign({}, defaultSanitizationSchema);
schema.clobber = [];

// We use a _lot_ of image formatting stuff in our
// instructions, particularly in CSP
schema.attributes.img.push('height', 'width');

// Add support for expandableImages
schema.tagNames.push('span');
schema.attributes.span = ['dataUrl', 'className'];

// Add support for inline styles (gross)
// TODO replace all inline styles in our curriculum content with
// semantically-significant content
schema.attributes['*'].push('style', 'className');

// ClickableText uses data-id on a bold tag.
schema.attributes['b'] = ['dataId'];

// Add support for Blockly XML
const blocklyTags = [
  'block',
  'functional_input',
  'mutation',
  'next',
  'statement',
  'title',
  'field',
  'value',
  'xml',
];
schema.tagNames = schema.tagNames.concat(blocklyTags);

module.exports.markdownToSyntaxTree = (source, plugin = null) =>
  unified()
    .use(remarkParse, {commonmark: true})
    .use(remark2rehype)
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .use(plugin)
    .parse(source);

module.exports.markdownToHtml = (source, plugin = null) =>
  unified()
    .use(remarkParse, {commonmark: true})
    .use(remark2rehype, {allowDangerousHtml: true})
    .use(rehypeRaw) // rehype-raw Allows raw HTML, preserving tags used for font-awesome icons
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .use(plugin)
    .processSync(source).contents;

module.exports.markdownToRedacted = (source, plugin = null) =>
  unified()
    .use(remarkParse, {commonmark: true})
    .use(remarkStringify)
    .use(redact)
    .use(plugin)
    .processSync(source).contents;

module.exports.sourceAndRedactedToRestored = (
  source,
  redacted,
  plugin = null
) => {
  let restorationMethods;
  if (plugin.length) {
    restorationMethods = plugin
      .map(p => p.restorationMethods)
      .reduce((acc, val) => Object.assign({}, acc, val), {});
  } else {
    restorationMethods = plugin.restorationMethods;
  }
  const parsedRedactionTree = unified()
    .use(remarkParse, {commonmark: true})
    .use(redact)
    .use(plugin)
    .parse(source);
  const transformedRedactionTree = unified()
    .use(remarkParse, {commonmark: true})
    .use(redact)
    .runSync(parsedRedactionTree);
  const parsedRestorationTree = unified()
    .use(remarkParse, {commomark: true})
    .use(parseRestorations)
    .parse(redacted);
  const transformedRestorationTree = unified()
    .use(restore, transformedRedactionTree, restorationMethods)
    .runSync(parsedRestorationTree);
  return unified()
    .use(remarkStringify)
    .use(rawtext)
    .use(renderRestorations)
    .use(plugin)
    .stringify(transformedRestorationTree);
};

module.exports.sourceAndRedactedToHtml = (source, redacted, plugin = null) => {
  const restored = module.exports.sourceAndRedactedToRestored(
    source,
    redacted,
    plugin
  );
  return module.exports.markdownToHtml(restored, plugin);
};

/**
 * Walk a MDAST and return a "map" that includes just the hierarchy and types
 * of nodes, but none of the inner content of those nodes. Can be used to
 * easily compare, for example, two trees which represent the same basic
 * content in two different languages, and verify that they produce the same
 * basic HTML structure.
 */
module.exports.mapMdast = node => {
  const result = {
    type: node.type
  };

  if (node.children) {
    result.children = node.children.map(child =>
      module.exports.mapMdast(child)
    );
  }

  return result;
};
