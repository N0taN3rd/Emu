const btypes = require('@babel/types')
const generator = require('@babel/generator').default
const { Names, rewriterProps, jsProps } = require('./names')
const checkParams = require('./checkParams')
const {
  getModifier,
  elemMod,
  jsToTag,
  tagToMod,
  tagToModGS
} = require('./modifiers')
const { attrTemplate } = require('./templates')
const EH = require('./expressionHelpers')

class EG {
  constructor () {
    this._overridesBody = []
    this._curStatements = []
  }

  static getOriginalString (attr) {
    if (typeof attr === 'string') return `getO${attr.toUpperCase()}`
    return `getO${attr.name.toUpperCase()}`
  }

  static setOriginalString (attr) {
    if (typeof attr === 'string') return `setO${attr.toUpperCase()}`
    return `setO${attr.name.toUpperCase()}`
  }

  patchAttrHTML (iface, attr) {
    const tagName = jsToTag[iface.name]
    if (tagName == null) {
      if (iface.name === 'HTMLStyleElement' && attr.name === 'textContent') {
        this.overridInnerOrOutterHtml(iface.name, attr.name)
      }
      return
    }
    if (iface.name === 'HTMLIFrameElement' && attr.name === 'srcdoc') {
      this.overridInnerOrOutterHtml(iface.name, attr.name)
      return
    }
    const gsOverrides = [
      EH.windowXprototype(iface.name),
      EH.makeStringLiteral(attr.name)
    ]
    let gname = EG.getOriginalString(attr)
    this._curStatements.push(
      EH.declarePropGetterWinXProtoConst(gname, iface.name, attr.name)
    )
    let returnWhat
    const getResult = btypes.identifier('propValue')
    if (attr.name !== 'srcset') {
      this._curStatements.push(
        EH.cacheGetter(
          rewriterProps.getSetCacheRwName,
          tagName,
          attr.name,
          gname
        )
      )
      returnWhat = btypes.returnStatement(getResult)
    } else {
      returnWhat = btypes.returnStatement(getResult)
    }

    gsOverrides.push(
      EH.nameLessFuncExpression(
        [],
        EH.tempVar(getResult),
        EH.ifElseBlocked(
          btypes.identifier(gname),
          EH.assign(getResult, EH.xCallThis(gname)),
          EH.assign(
            getResult,
            EH.xCallThisParams(rewriterProps.rewriterMyCopyGetAt, [
              btypes.stringLiteral(attr.name)
            ])
          )
        ),
        returnWhat
      )
    )
    let sname = EG.setOriginalString(attr)
    this._curStatements.push(
      EH.declarePropSetterWinXProtoConst(sname, iface.name, attr.name)
    )
    if (attr.name !== 'srcset') {
      this._curStatements.push(
        EH.cacheSetter(
          rewriterProps.getSetCacheRwName,
          tagName,
          attr.name,
          sname
        )
      )
    }
    const pi = btypes.identifier(attr.name)
    let mod
    if (attr.name === 'srcset') {
      gsOverrides.push(
        EH.nameLessFuncExpression(
          [pi],
          EH.ifBlock(
            Names.thisNoRewrite,
            EH.ifElse(
              btypes.identifier(sname),
              EH.blockReturn(EH.xCallThisParams(sname, [pi])),
              EH.blockReturn(
                EH.xCallThisParams(
                  btypes.memberExpression(Names.rwName, Names.myCopySetAt),
                  [btypes.stringLiteral(attr.name), pi]
                )
              )
            )
          ),
          EH.returnCall(
            rewriterProps.getOriginal,
            EH.xCallThisParams(sname, [
              EH.functionCall(rewriterProps.rewriteSrcset, pi)
            ])
          )
        )
      )
    } else {
      mod = getModifier(iface.name, attr.name)
      if (mod && mod.value === 'cs_') {
        gsOverrides.push(
          EH.nameLessFuncExpression(
            [pi],
            EH.ifBlock(
              Names.thisNoRewrite,
              EH.ifElse(
                btypes.identifier(sname),
                EH.blockReturn(EH.xCallThisParams(sname, [pi])),
                EH.blockReturn(
                  EH.xCallThisParams(rewriterProps.rewriterMyCopySetAt, [
                    btypes.stringLiteral(attr.name),
                    pi
                  ])
                )
              )
            ),
            EH.ifElse(
              EH.indexOfWhatEq0(pi, 'data:text/css'),
              EH.xEqRewritterCallBlockS(pi, rewriterProps.rewriteInlineStyle, [
                pi
              ]),
              EH.xEqRewritterCallBlockS(pi, rewriterProps.doRewrite, [pi, mod])
            ),
            EH.ifElse(
              btypes.identifier(sname),
              EH.blockReturn(EH.xCallThisParams(sname, [pi])),
              EH.blockReturn(
                EH.xCallThisParams(rewriterProps.rewriterMyCopySetAt, [
                  btypes.stringLiteral(attr.name),
                  pi
                ])
              )
            )
          )
        )
      } else {
        gsOverrides.push(
          EH.nameLessFuncExpression(
            [pi],
            EH.ifBlock(
              Names.thisNoRewrite,
              EH.ifElse(
                btypes.identifier(sname),
                EH.blockReturn(EH.xCallThisParams(sname, [pi])),
                EH.blockReturn(
                  EH.xCallThisParams(rewriterProps.rewriterMyCopySetAt, [
                    btypes.stringLiteral(attr.name),
                    pi
                  ])
                )
              )
            ),
            EH.ifElse(
              btypes.identifier(sname),
              EH.blockReturn(
                EH.xCallThisParams(sname, [
                  btypes.callExpression(
                    rewriterProps.doRewrite,
                    checkParams([pi, mod])
                  )
                ])
              ),
              EH.blockReturn(
                EH.xCallThisParams(rewriterProps.rewriterMyCopySetAt, [
                  btypes.stringLiteral(attr.name),
                  btypes.callExpression(
                    rewriterProps.doRewrite,
                    checkParams([pi, mod])
                  )
                ])
              )
            )
          )
        )
      }
    }
    this._curStatements.push(
      btypes.expressionStatement(
        btypes.callExpression(rewriterProps.defineProperty, gsOverrides)
      )
    )
  }

  finishPatchHTML (elem) {
    if (this._curStatements.length) {
      this._overridesBody.push(
        btypes.ifStatement(
          EH.htmlElementOverrideGauard(elem.name),
          EH.ensureBlockStatement(this._curStatements)
        )
      )
      this._curStatements = []
    } else {
      console.log(`${elem.name} generated zero statements`)
    }
  }

  extendHTML (elem) {
    const { constructors, name } = elem
    if (jsToTag[name]) {
      const constructor = constructors[0]
      const idArg = constructor.identifiedArg[0]
      const newName = btypes.identifier(`New${constructor.name}`)
      if (constructor.what === 'namedConstructor') {
        const namedC = btypes.identifier(constructor.name)
        const extnds = EH.windowX(namedC)
        this._curStatements.push(
          btypes.classDeclaration(
            newName,
            extnds,
            btypes.classBody([
              btypes.classMethod(
                'constructor',
                btypes.identifier('constructor'),
                checkParams(constructor.args.map(arg => arg.name)),
                btypes.blockStatement([
                  btypes.expressionStatement(
                    btypes.callExpression(btypes.super(), [
                      btypes.callExpression(rewriterProps.doRewrite, [
                        btypes.identifier(idArg)
                      ])
                    ])
                  )
                ])
              )
            ])
          )
        )
        this._curStatements.push(EH.replaceWindow(namedC, newName))
        this._overridesBody.push(
          btypes.ifStatement(
            extnds,
            EH.ensureBlockStatement(this._curStatements)
          )
        )
        this._curStatements = []
      }
    }
  }

  overridInnerOrOutterHtml (on, which) {
    const oGet = EG.getOriginalString(which)
    const oSet = EG.setOriginalString(which)
    const htmlString = btypes.identifier('htmlString')
    this._curStatements.push(
      EH.declarePropSetterWinXProtoConst(oSet, on, which),
      btypes.ifStatement(
        btypes.identifier(oSet),
        btypes.blockStatement([
          EH.declarePropSetterWinXProtoConst(oGet, on, which),
          btypes.expressionStatement(
            btypes.callExpression(rewriterProps.defineProperty, [
              EH.windowXprototype(on),
              EH.makeStringLiteral(which),
              btypes.functionExpression(
                null,
                [],
                btypes.blockStatement([
                  EH.returnCallThis(btypes.identifier(oGet))
                ])
              ),
              EH.nameLessFuncExpression(
                [htmlString],
                btypes.ifStatement(
                  EH.notNoRewriteTestThis(),
                  btypes.blockStatement([
                    btypes.ifStatement(
                      btypes.binaryExpression(
                        '===',
                        btypes.memberExpression(
                          btypes.thisExpression(),
                          btypes.identifier('tagName')
                        ),
                        btypes.stringLiteral('STYLE')
                      ),
                      btypes.blockStatement([
                        btypes.expressionStatement(
                          btypes.assignmentExpression(
                            '=',
                            htmlString,
                            btypes.callExpression(rewriterProps.rewriteStyle, [
                              htmlString
                            ])
                          )
                        )
                      ]),
                      btypes.blockStatement([
                        btypes.expressionStatement(
                          btypes.assignmentExpression(
                            '=',
                            htmlString,
                            btypes.callExpression(rewriterProps.rewriteHTML, [
                              htmlString
                            ])
                          )
                        )
                      ])
                    )
                  ])
                ),
                EH.returnCall(
                  btypes.memberExpression(
                    btypes.identifier(oSet),
                    btypes.identifier('call')
                  ),
                  btypes.thisExpression(),
                  htmlString
                )
              )
            ])
          )
        ])
      )
    )
  }

  handleNonHTML (iface) {
    switch (iface.name) {
      case 'Attr':
        this.handleAttr(iface)
        break
      case 'Document':
        this.handleDocument(iface)
        break
      case 'Node':
        break
      default:
        // console.log(iface.name)
        break
    }
  }

  handleAttr (iface) {
    const { atts } = iface
    for (let i = 0; i < atts.length; ++i) {
      let attr = atts[i]
      const oget = btypes.identifier(EG.getOriginalString(attr))
      const tagName = btypes.identifier('tagName')
      this._curStatements.push(
        EH.declarePropGetterWinXProtoConst(oget, iface.name, attr.name)
      )
      const atValue = btypes.identifier('atValue')
      this._curStatements.push(
        EH.redefPropNoSetter(
          iface,
          attr,
          EH.letRefEqCallThis(atValue, oget),
          btypes.variableDeclaration('const', [
            btypes.variableDeclarator(
              tagName,
              EH.thisXAndThisXY('ownerElement', tagName)
            )
          ]),
          EH.ifReturn(
            EH.functionCall(
              rewriterProps.rewriterShouldRWAtt,
              tagName,
              EH.functionCall(
                EH.memberExpression(EH.thisMember('nodeName'), 'toLowerCase')
              )
            ),
            EH.functionCall(
              rewriterProps.doRewrite,
              atValue,
              btypes.conditionalExpression(
                EH.binaryExpressEqString(tagName, 'SCRIPT'),
                btypes.stringLiteral('js_'),
                btypes.identifier('undefined')
              )
            )
          ),
          btypes.returnStatement(atValue)
        )
      )
    }
    this._overridesBody.push(
      btypes.ifStatement(
        EH.htmlElementOverrideGauard(iface.name),
        EH.ensureBlockStatement(this._curStatements)
      )
    )
    this._curStatements = []
  }

  argNameToId (arg) {
    return btypes.identifier(arg.name)
  }

  handleDocument (iface) {
    const inameLower = iface.name.toLowerCase()
    const { atts, operations } = iface
    for (let i = 0; i < atts.length; ++i) {
      let att = atts[i]
      if (att.name === 'domain') {
        this._overridesBody.push(
          EH.esFunctionCall(
            jsProps.objDefProp,
            EH.memberExpression(Names.windowName, inameLower),
            btypes.stringLiteral(att.name),
            btypes.objectExpression([
              EH.objPropBoolean('configurable', true),
              EH.objPropBoolean('enumerable', false),
              EH.objectPropFunction('set', []),
              EH.objectPropFunction(
                'get',
                [],
                EH.blockReturn(rewriterProps.rewriterOHost)
              )
            ])
          )
        )
      } else {
        console.log(`${iface.name}.${att.name} override not yet generated`)
      }
    }
    for (let i = 0; i < operations.length; ++i) {
      const operation = operations[i]
      const opNameUpper = operation.name.toUpperCase()
      const oldOp = `orig${opNameUpper}`
      const newOp = `new${opNameUpper}`
      this._curStatements.push(
        EH.constRefWinXY(oldOp, inameLower, operation.name)
      )
      const args = operation.args.map(this.argNameToId)
      const arg = args[0]
      const rwHTML = btypes.identifier('maybeRewritenHTML')
      this._curStatements.push(
        EH.newFunctionDef(
          newOp,
          args,
          EH.refEqRewriteHTML(rwHTML, arg, true),
          EH.returnIfFalsy(rwHTML),
          EH.returnCallThisArgs(oldOp, rwHTML)
        )
      )
      this._curStatements.push(EH.redefWinX(inameLower, operation.name, newOp))
      this._curStatements.push(
        EH.redefWinXProto(iface.name, operation.name, newOp)
      )
    }
    this._overridesBody.push(
      btypes.ifStatement(
        EH.htmlElementOverrideGauard(iface.name),
        EH.ensureBlockStatement(this._curStatements)
      )
    )
    this._curStatements = []
  }

  generate () {
    return generator(btypes.program(this._overridesBody), {
      concise: false,
      retainLines: false,
      compact: false,
      minified: false
    })
  }
}

module.exports = EG
