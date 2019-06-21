const unified = require('unified');
const stringify = require('remark-stringify');
const markdown = require('remark-parse');
const html = require('remark-html');
const {redact, restore, plugins} = require('remark-redactable');

module.exports.markdownToHtml = (source, plugin = null) =>
  unified()
    .use(markdown)
    .use(html)
    .use(plugin)
    .processSync(source).contents;

module.exports.markdownToRedacted = (source, plugin = null) =>
  unified()
    .use(markdown, {commonmark: true, pedantic: true})
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
    .use(markdown, {commonmark: true, pedantic: true})
    .use(stringify)
    .use(redact)
    .use(plugin)
    .parse(source);
  return unified()
    .use(markdown, {commonmark: true, pedantic: true})
    .use(restore(redactedSourceTree))
    .use(plugin)
    .use(stringify)
    .use(plugins.rawtext)
    .processSync(redacted).contents;
};
