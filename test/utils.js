const unified = require('unified');
const stringify = require('remark-stringify');
const markdown = require('remark-parse');
const html = require('remark-html');
const {redact, restore, plugins} = require('remark-redactable');

module.exports.markdownToSyntaxTree = (source, plugin = null) =>
  unified()
    .use(markdown)
    .use(html)
    .use(plugin)
    .parse(source);

module.exports.markdownToHtml = (source, plugin = null) =>
  unified()
    .use(markdown)
    .use(html)
    .use(plugin)
    .processSync(source).contents;

module.exports.markdownToRedacted = (source, plugin = null) =>
  unified()
    .use(markdown)
    .use(stringify)
    .use(redact)
    .use(plugin)
    .processSync(source).contents;

module.exports.sourceAndRedactedToRestored = (
  source,
  redacted,
  plugin = null
) => {
  const redactedSourceTree = unified()
    .use(markdown)
    .use(redact)
    .use(plugin)
    .parse(source);
  return unified()
    .use(markdown)
    .use(restore(redactedSourceTree))
    .use(plugin)
    .use(stringify)
    .use(plugins.rawtext)
    .processSync(redacted).contents;
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
    result.children = node.children.map(child => module.exports.mapMdast(child));
  }

  return result;
};
