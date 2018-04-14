const btypes = require('@babel/types')

const noRewrite = btypes.identifier('_no_rewrite')

const Names = {
  windowName: btypes.identifier('window'),
  this: btypes.thisExpression(),
  proto: btypes.identifier('prototype'),
  rwName: btypes.identifier('rewriter'),
  getOGetter: btypes.identifier('getOGetter'),
  getOSetter: btypes.identifier('getOSetter'),
  getOriginal: btypes.identifier('getOriginal'),
  doRewrite: btypes.identifier('doRewrite'),
  isRewritableWSchemeless: btypes.identifier('isRewritableWSchemeless'),
  rewriteSrcset: btypes.identifier('rewriteSrcset'),
  rewriteStyle: btypes.identifier('rewriteStyle'),
  rewriteURL: btypes.identifier('rewriteURL'),
  defineProperty: btypes.identifier('defineProperty2'),
  rewriteInlineStyle: btypes.identifier('rewriteInlineStyle'),
  attNameLower: btypes.identifier('attNameLower'),
  getSetCache: btypes.identifier('tagToModGs'),
  getter: btypes.identifier('getter'),
  setter: btypes.identifier('setter'),
  noRewrite,
  tagToMod: btypes.identifier('tagToMod'),
  rewriteHTML: btypes.identifier('rewriteHTML'),
  myCopyGetAt: btypes.identifier('myCopyGetAt'),
  myCopySetAt: btypes.identifier('myCopySetAt'),
  rewriteDataAttribute: btypes.identifier('rewriteDataAttribute'),
  thisNoRewrite: btypes.memberExpression(btypes.thisExpression(), noRewrite)
}

const rewriterProps = {
  getSetCacheThis: btypes.memberExpression(Names.this, Names.getSetCache),
  myCopySetAt: btypes.memberExpression(Names.this, Names.myCopySetAt),
  myCopyGetAt: btypes.memberExpression(Names.this, Names.myCopyGetAt),
  tagToMod: btypes.memberExpression(Names.rwName, Names.tagToMod),
  getSetCacheRwName: btypes.memberExpression(Names.rwName, Names.getSetCache),
  getOGetter: btypes.memberExpression(Names.rwName, Names.getOGetter),
  getOGetterThis: btypes.memberExpression(Names.this, Names.getOGetter),
  getOSetterThis: btypes.memberExpression(Names.this, Names.getOSetter),
  getOSetter: btypes.memberExpression(Names.rwName, Names.getOSetter),
  getOriginal: btypes.memberExpression(Names.rwName, Names.getOriginal),
  defineProperty: btypes.memberExpression(Names.rwName, Names.defineProperty),
  rewriteURL: btypes.memberExpression(Names.rwName, Names.rewriteURL),
  doRewrite: btypes.memberExpression(Names.rwName, Names.doRewrite),
  rewriteSrcset: btypes.memberExpression(Names.rwName, Names.rewriteSrcset),
  rewriteInlineStyle: btypes.memberExpression(
    Names.rwName,
    Names.rewriteInlineStyle
  ),
  rewriteHTML: btypes.memberExpression(Names.rwName, Names.rewriteHTML),
  isRewritableWSchemeless: btypes.memberExpression(
    Names.rwName,
    Names.isRewritableWSchemeless
  ),
  rewriteStyle: btypes.memberExpression(Names.rwName, Names.rewriteStyle),
  rewriterMyCopyGetAt: btypes.memberExpression(Names.rwName, Names.myCopyGetAt),
  rewriterMyCopySetAt: btypes.memberExpression(Names.rwName, Names.myCopySetAt),
  rewriterShouldRWAtt: btypes.memberExpression(
    Names.rwName,
    btypes.identifier('shouldRewriteAttribute')
  ),
  rewriterRWDataAt: btypes.memberExpression(
    Names.rwName,
    btypes.identifier('rewriteDataAttribute')
  ),
  rewriterOHost: btypes.memberExpression(
    btypes.memberExpression(Names.rwName, btypes.identifier('_orginalURL')),
    btypes.identifier('host')
  )
}

const jsProps = {
  objDefProp: btypes.memberExpression(
    btypes.identifier('Object'),
    btypes.identifier('defineProperty')
  )
}

module.exports = {
  rewriterProps,
  Names,
  jsProps
}
