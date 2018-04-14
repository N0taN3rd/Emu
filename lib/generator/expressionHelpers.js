const btypes = require('@babel/types')
const { Names, rewriterProps } = require('./names')
const checkParams = require('./checkParams')

const CONST = 'const'

class EH {
  static memberExpression (obj, prop) {
    if (typeof obj === 'string') {
      obj = btypes.identifier(obj)
    }
    if (typeof prop === 'string') {
      prop = btypes.identifier(prop)
    }
    return btypes.memberExpression(obj, prop)
  }

  static windowXprototype (x) {
    if (typeof x === 'string') {
      x = btypes.identifier(x)
    }
    return EH.memberExpression(
      EH.memberExpression(Names.windowName, x),
      Names.proto
    )
  }

  static declarePropGetterWinXProto (kind, name, x, prop) {
    return btypes.variableDeclaration(kind, [
      btypes.variableDeclarator(
        EH.makeIdentifier(name),
        btypes.callExpression(rewriterProps.getOGetter, [
          EH.windowXprototype(x),
          btypes.stringLiteral(prop)
        ])
      )
    ])
  }

  static declarePropGetterWinXProtoConst (name, x, prop) {
    return EH.declarePropGetterWinXProto(CONST, name, x, prop)
  }

  static declarePropSetterWinXProto (kind, name, x, prop) {
    return btypes.variableDeclaration(kind, [
      btypes.variableDeclarator(
        btypes.identifier(name),
        btypes.callExpression(rewriterProps.getOSetter, [
          EH.windowXprototype(x),
          btypes.stringLiteral(prop)
        ])
      )
    ])
  }

  static declarePropSetterWinXProtoConst (name, x, prop) {
    return EH.declarePropSetterWinXProto(CONST, name, x, prop)
  }

  static refOriginalFromWinXProtoOrig (kind, name, x, prop) {
    return btypes.variableDeclaration(kind, [
      btypes.variableDeclarator(
        btypes.identifier(name),
        EH.memberExpression(EH.windowXprototype(x), btypes.identifier(prop))
      )
    ])
  }

  static redefineWindXProtoMethod (x, prop, def) {
    return btypes.assignmentExpression(
      '=',
      EH.memberExpression(EH.windowXprototype(x), btypes.identifier(prop)),
      def
    )
  }

  static makeIdentifier (what) {
    if (typeof what === 'string') return btypes.identifier(what)
    return what
  }

  static makeStringLiteral (what) {
    if (typeof what === 'string') return btypes.stringLiteral(what)
    return what
  }

  static ensureBlockStatement (body) {
    if (!btypes.isBlockStatement(body)) {
      return btypes.blockStatement(Array.isArray(body) ? body : [body])
    }
    return body
  }

  static ifPropEq (prop, eq, body) {
    return btypes.ifStatement(
      btypes.binaryExpression(
        '===',
        EH.makeIdentifier(prop),
        EH.makeIdentifier(eq)
      ),
      EH.ensureBlockStatement(body)
    )
  }

  static ifPropEqString (prop, eq, body) {
    return btypes.ifStatement(
      btypes.binaryExpression(
        '===',
        EH.makeIdentifier(prop),
        EH.makeStringLiteral(eq)
      ),
      EH.ensureBlockStatement(body)
    )
  }

  static ifTypeOfXEqWhat (prop, body, type) {
    return btypes.ifStatement(
      btypes.binaryExpression(
        '===',
        btypes.unaryExpression('typeof', EH.makeIdentifier(prop)),
        EH.makeStringLiteral(type)
      ),
      EH.ensureBlockStatement(body)
    )
  }

  static xEqRewritterCall (x, call, params) {
    return btypes.expressionStatement(
      btypes.assignmentExpression(
        '=',
        x,
        btypes.callExpression(call, checkParams(params))
      )
    )
  }

  static xEqRewritterCallBlockS (x, call, params) {
    return btypes.blockStatement([
      btypes.expressionStatement(
        btypes.assignmentExpression(
          '=',
          x,
          btypes.callExpression(call, checkParams(params))
        )
      )
    ])
  }

  static xCallThis (name) {
    return btypes.callExpression(
      btypes.memberExpression(
        EH.makeIdentifier(name),
        btypes.identifier('call')
      ),
      [btypes.thisExpression()]
    )
  }

  static xCallThisParams (name, params) {
    if (!btypes.isMemberExpression(name) && !btypes.isIdentifier(name)) {
      name = btypes.identifier(name)
    }
    return btypes.callExpression(
      btypes.memberExpression(name, btypes.identifier('call')),
      [btypes.thisExpression(), ...params]
    )
  }

  static ifNoRewritEHetter (name, noRWFlagProp) {
    return btypes.ifStatement(
      btypes.memberExpression(
        btypes.thisExpression(),
        EH.makeIdentifier(noRWFlagProp)
      ),
      btypes.returnStatement(EH.xCallThis(name))
    )
  }

  static ifNoRewriteSetter (name, noRWFlagProp, params) {
    if (!Array.isArray(params)) {
      params = [params]
    }
    return btypes.ifStatement(
      btypes.memberExpression(
        btypes.thisExpression(),
        EH.makeIdentifier(noRWFlagProp)
      ),
      btypes.returnStatement(EH.xCallThisParams(name, params))
    )
  }

  static returnGetOriginalOf (what) {
    return btypes.returnStatement(
      btypes.callExpression(
        EH.memberExpression(Names.rwName, Names.getOriginal),
        [what]
      )
    )
  }

  static htmlElementOverrideGauard (name) {
    return btypes.logicalExpression(
      '&&',
      EH.memberExpression(Names.windowName, name),
      EH.windowXprototype(name)
    )
  }

  static indexOfWhatEq0 (id, what) {
    return btypes.binaryExpression(
      '===',
      btypes.callExpression(EH.memberExpression(id, 'indexOf'), [
        EH.makeStringLiteral(what)
      ]),
      btypes.numericLiteral(0)
    )
  }

  static setterOverride (sname, pi, rwcode) {
    return btypes.functionExpression(
      null,
      [pi],
      btypes.blockStatement([
        EH.ifNoRewriteSetter(sname, Names.noRewrite, pi),
        rwcode,
        btypes.returnStatement(EH.xCallThisParams(sname, [pi]))
      ])
    )
  }

  static cachEHetter (cache, tagName, prop, getterName) {
    return btypes.expressionStatement(
      btypes.assignmentExpression(
        '=',
        btypes.memberExpression(
          btypes.memberExpression(
            btypes.memberExpression(cache, btypes.identifier(tagName)),
            btypes.identifier(prop)
          ),
          Names.getter
        ),
        btypes.identifier(getterName)
      )
    )
  }

  static cacheSetter (cache, tagName, prop, setterName) {
    return btypes.expressionStatement(
      btypes.assignmentExpression(
        '=',
        btypes.memberExpression(
          btypes.memberExpression(
            btypes.memberExpression(cache, btypes.identifier(tagName)),
            btypes.identifier(prop)
          ),
          Names.setter
        ),
        btypes.identifier(setterName)
      )
    )
  }

  static refXToLowercase (refName, x) {
    return btypes.variableDeclaration(CONST, [
      btypes.variableDeclarator(
        refName,
        btypes.callExpression(
          EH.memberExpression(x, btypes.identifier('toLowerCase')),
          []
        )
      )
    ])
  }

  static binaryExpressEqString (l, r) {
    if (!btypes.isStringLiteral(r)) {
      r = btypes.stringLiteral(r)
    }
    return btypes.binaryExpression('===', l, r)
  }

  static blockOnlyXEqRewritterCall (x, call, args) {
    return btypes.blockStatement([EH.xEqRewritterCall(x, call, args)])
  }

  static blockRewritterCallReturn (call, args) {
    return btypes.blockStatement([
      btypes.returnStatement(btypes.callExpression(call, checkParams(args)))
    ])
  }

  static logicalLRBinaryEqString (l, leq, r, req) {
    return btypes.logicalExpression(
      '&&',
      EH.binaryExpressEqString(l, leq),
      EH.binaryExpressEqString(r, req)
    )
  }

  static logicalExistsAndTypeofXString (existsN, shouldBeString) {
    return btypes.logicalExpression(
      '&&',
      existsN,
      btypes.binaryExpression(
        '===',
        btypes.unaryExpression('typeof', shouldBeString),
        btypes.stringLiteral('string')
      )
    )
  }

  static thisMember (member) {
    if (!btypes.isIdentifier(member)) {
      member = btypes.identifier(member)
    }
    return btypes.memberExpression(btypes.thisExpression(), member)
  }

  static xIndexOfStartTest (x, of) {
    return btypes.binaryExpression(
      '===',
      btypes.callExpression(
        btypes.memberExpression(x, btypes.identifier('indexOf')),
        [btypes.stringLiteral(of)]
      ),
      btypes.numericLiteral(0)
    )
  }

  static notNoRewriteTestThis () {
    return btypes.unaryExpression('!', EH.thisMember(Names.noRewrite))
  }

  static refRewriterGetTagToMod (refName, tag) {
    if (!btypes.isIdentifier(tag)) {
      tag = btypes.identifier(tag)
    }
    return btypes.variableDeclaration(CONST, [
      btypes.variableDeclarator(
        refName,
        btypes.memberExpression(rewriterProps.tagToMod, tag, true)
      )
    ])
  }

  static callGetAtt (getAtt, prop, result) {
    return btypes.variableDeclaration(CONST, [
      btypes.variableDeclarator(
        result,
        btypes.callExpression(
          btypes.memberExpression(
            btypes.identifier(getAtt),
            btypes.identifier('call')
          ),
          [btypes.thisExpression(), prop]
        )
      )
    ])
  }

  static lastDitchTestPropIsHrefSrc (prop) {
    return btypes.logicalExpression(
      '||',
      btypes.binaryExpression('===', prop, btypes.stringLiteral('src')),
      btypes.binaryExpression('===', prop, btypes.stringLiteral('href'))
    )
  }

  static letRefEqCallThis (ref, call) {
    return btypes.variableDeclaration('let', [
      btypes.variableDeclarator(
        ref,
        btypes.callExpression(
          EH.memberExpression(call, btypes.identifier('call')),
          [btypes.thisExpression()]
        )
      )
    ])
  }

  static blockIf (test, consequence, alt) {
    return btypes.blockStatement([btypes.ifStatement(test, consequence, alt)])
  }

  static blockReturn (returnMe) {
    return btypes.blockStatement([btypes.returnStatement(returnMe)])
  }

  static block (...body) {
    return btypes.blockStatement(body)
  }

  static ifBlock (test, ...body) {
    return btypes.ifStatement(test, btypes.blockStatement(body))
  }

  static nameLessFuncExpression (args, ...body) {
    return btypes.functionExpression(null, args, btypes.blockStatement(body))
  }

  static functionCall (callee, ...args) {
    return btypes.callExpression(callee, args)
  }

  static esFunctionCall (callee, ...args) {
    return btypes.expressionStatement(btypes.callExpression(callee, args))
  }

  static ifElse (test, t, f) {
    return btypes.ifStatement(test, t, f)
  }

  static ifReturn (test, returnWhat) {
    return btypes.ifStatement(test, btypes.returnStatement(returnWhat))
  }

  static ifElseBlocked (test, t, f) {
    return btypes.ifStatement(
      test,
      btypes.blockStatement([t]),
      btypes.blockStatement([f])
    )
  }

  static tempVar (name) {
    return btypes.variableDeclaration('let', [btypes.variableDeclarator(name)])
  }

  static assign (assignie, to) {
    return btypes.expressionStatement(
      btypes.assignmentExpression('=', assignie, to)
    )
  }

  static returnCall (callee, ...args) {
    return btypes.returnStatement(btypes.callExpression(callee, args))
  }

  static returnCallThis (callee) {
    return btypes.returnStatement(
      btypes.callExpression(
        EH.memberExpression(callee, btypes.identifier('call')),
        [btypes.thisExpression()]
      )
    )
  }

  static returnCallThisArgs (callee, ...args) {
    return btypes.returnStatement(
      btypes.callExpression(
        EH.memberExpression(callee, btypes.identifier('call')),
        [btypes.thisExpression(), ...args]
      )
    )
  }

  static strictEq (a, b) {
    return btypes.binaryExpression('===', a, b)
  }

  static letVarEqCall (name, callee, ...args) {
    return btypes.variableDeclaration('let', [
      btypes.variableDeclarator(name, EH.functionCall(callee, ...args))
    ])
  }

  static logicalOr (a, b) {
    return btypes.logicalExpression('||', a, b)
  }

  static logicalAnd (a, b) {
    return btypes.logicalExpression('&&', a, b)
  }

  static greaterEq (t, n) {
    return btypes.binaryExpression('>=', t, btypes.numericLiteral(n))
  }

  static cacheGetter (cache, tagName, prop, getterName) {
    return btypes.expressionStatement(
      btypes.assignmentExpression(
        '=',
        btypes.memberExpression(
          btypes.memberExpression(
            btypes.memberExpression(cache, btypes.identifier(tagName)),
            btypes.identifier(prop)
          ),
          Names.getter
        ),
        btypes.identifier(getterName)
      )
    )
  }

  static windowX (what) {
    return EH.memberExpression(Names.windowName, what)
  }

  static windowXY (x, y) {
    return EH.memberExpression(EH.windowX(x), EH.makeIdentifier(y))
  }

  static replaceWindow (what, to) {
    return btypes.expressionStatement(
      btypes.assignmentExpression('=', EH.windowX(what), EH.makeIdentifier(to))
    )
  }

  static objPropBoolean (key, value) {
    return btypes.objectProperty(
      EH.makeIdentifier(key),
      btypes.booleanLiteral(value),
      false
    )
  }

  static objectPropFunction (name, params, body) {
    return btypes.objectMethod(
      'method',
      EH.makeIdentifier(name),
      params,
      body == null ? btypes.blockStatement([]) : body
    )
  }

  static constRefWinXY (ref, x, y) {
    return btypes.variableDeclaration(CONST, [
      btypes.variableDeclarator(
        btypes.identifier(ref),
        EH.memberExpression(EH.windowX(x), y)
      )
    ])
  }

  static newFunctionDef (name, args, ...body) {
    return btypes.functionDeclaration(
      btypes.identifier(name),
      args,
      EH.ensureBlockStatement(body)
    )
  }

  static refEqRewriteHTML (ref, htmlString, fullHTML = false) {
    return btypes.variableDeclaration(CONST, [
      btypes.variableDeclarator(
        EH.makeIdentifier(ref),
        btypes.callExpression(rewriterProps.rewriteHTML, [
          htmlString,
          btypes.booleanLiteral(fullHTML)
        ])
      )
    ])
  }

  static returnIfFalsy (what) {
    return btypes.ifStatement(
      btypes.unaryExpression('!', what),
      btypes.returnStatement()
    )
  }

  static redefWinX (what, orig, newv) {
    return btypes.expressionStatement(
      btypes.assignmentExpression(
        '=',
        EH.windowXY(what, orig),
        EH.makeIdentifier(newv)
      )
    )
  }

  static redefWinXProto (what, orig, newv) {
    return btypes.expressionStatement(
      btypes.assignmentExpression(
        '=',
        EH.memberExpression(EH.windowXprototype(what), orig),
        EH.makeIdentifier(newv)
      )
    )
  }

  static redefPropNoSetter (iface, prop, ...body) {
    return btypes.expressionStatement(
      btypes.callExpression(rewriterProps.defineProperty, [
        EH.windowXprototype(typeof iface === 'string' ? iface : iface.name),
        EH.makeStringLiteral(typeof prop === 'string' ? prop : prop.name),
        EH.nameLessFuncExpression([], ...body),
        btypes.identifier('undefined')
      ])
    )
  }

  static thisXAndThisXY (x, y) {
    const thisx = EH.thisMember(x)
    return btypes.logicalExpression('&&', thisx, EH.memberExpression(thisx, y))
  }
}

module.exports = EH
