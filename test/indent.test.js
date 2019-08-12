const stringify = require("remark-stringify");
const test = require("tape");
const u = require("unist-builder");
const unified = require("unified");

const indent = require("../src/indent");

test("indent plugin wll render children indented by four spaces", t => {
  t.plan(2);

  const compiler = unified()
    .use(stringify)
    .use(indent);

  t.equal(
    compiler.stringify(u("root", [u("indent", [u("text", "test")])])),
    "    test\n"
  );

  t.equal(
    compiler.stringify(
      u("root", [
        u("indent", [
          u("paragraph", [u("text", "test")]),
          u("paragraph", [u("text", "test")])
        ])
      ])
    ),
    "    test\n\n    test\n"
  );
});
