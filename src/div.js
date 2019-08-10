/**
 * Normally, div elements are not renderable into markdown since there is no
 * vanilla markdown syntax that produces divs; but with the divclass syntax, we
 * should be able to serialize into markdown divs that have classes:
 *
 *   <div class="some-string">
 *     {html-formatted content}
 *   </div>
 *
 * should serialize to (and be produced from):
 *
 *   [some-string]
 *
 *   {markdown-formatted content}
 *
 *   [/some-string]
 *
 * @see @code-dot-org/remark-plugins/divclass
 */
module.exports = function div() {
  if (this.Compiler) {
    const visitors = this.Compiler.prototype.visitors;

    if (visitors) {
      visitors.div = function(node) {
        const className = node.data.hProperties.className;

        return [`[${className}]`, this.block(node), `[/${className}]`].join(
          "\n\n"
        );
      };
    }
  }
};
