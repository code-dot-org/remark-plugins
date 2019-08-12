const stringify = require("remark-stringify");
const test = require("tape");
const u = require("unist-builder");
const unified = require('unified');

const rawtext = require("../src/rawtext");

test("rawtext directly renders text that would normally get escaped", t => {
  t.plan(2);

  const compiler = unified()
    .use(stringify)
    .use(rawtext);

  const content ='some [content] with *syntax*' ;
  const regularTree = u('root', [
    u('text', content)
  ]);

  const rawtextTree = u('root', [
    u('rawtext', content)
  ]);

  t.equal(compiler.stringify(regularTree), "some \\[content] with \\*syntax\\*\n");
  t.equal(compiler.stringify(rawtextTree), "some [content] with *syntax*\n");
});
