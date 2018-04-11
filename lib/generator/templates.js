const template = require('@babel/template').default

// Oh time why you no on my side :'(
// TODO(n0tan3rd): un-template this

const attrTemplate = template(`
const OGET = rewriter.getOGetter(window.Attr.prototype, WHAT);
rewriter.defineProperty(window.Attr.prototype, WHAT, undefined, function () {
    const result = OGET.call(this);
    const tagName = this.ownerElement && this.ownerElement.tagName;
    if (rewriter.shouldRewriteAttribute(tagName, this.nodeName.toLowerCase())) {
      return rewriter.doRewrite(result, tagName === SCRIPT ? 'js_' : undefined);
    }
    return result;
  }
);`)

module.exports = {
  attrTemplate
}
