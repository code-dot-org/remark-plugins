const stringify = require("remark-stringify");
const test = require("tape");
const u = require("unist-builder");
const unified = require("unified");

const div = require("../src/div");

test("div plugin can render divs with classes to divclass syntax", t => {
  t.plan(1);

  const compiler = unified()
    .use(stringify)
    .use(div);

  const tree = u("root", [
    u("div", { data: { hProperties: { className: "div-class" } } }, [])
  ]);

  t.equal(compiler.stringify(tree), "[div-class]\n\n\n\n[/div-class]\n");
});
