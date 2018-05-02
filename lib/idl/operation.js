const Argument = require('./argument')
const Type = require('./type')

class Operation {
  constructor (operation) {
    this.name = operation.name
    this.static = operation.static
    this.returnType = new Type(operation.idlType)
    this.args = new Map()
    this.argTypes = []
    this.hasTypeDefArgs = false
    this.typeDefArgs = []
    this.identifiedArg = new Set()
    if (operation.arguments) {
      let _arguments = operation.arguments
      for (let i = 0; i < _arguments.length; ++i) {
        let arg = new Argument(_arguments[i])
        this.argTypes.push(arg.type)
        this.args.set(arg.name, arg)
      }
    }
  }

  hasArgNamed (name) {
    return this.args.has(name)
  }

  hasArgNames (names) {
    for (let i = 0; i < names.length; ++i) {
      if (this.args.has(names[i])) {
        this.identifiedArg.add(names[i])
        return true
      }
    }
    return false
  }

  hasArgOfTypes (types, typeDefInfo = null) {
    for (const arg of this.args.values()) {
      for (const type of types) {
        if (arg.isOfType(type)) {
          if (typeDefInfo != null) {
            // console.log(type)
            let maybeTD = typeDefInfo.getTypeDefTypes(type)
            if (maybeTD) {
              this.hasTypeDefArgs = true
              this.typeDefArgs.push(arg.name)
              arg.addTypedefInfo(maybeTD)
            }
          }
          this.identifiedArg.add(arg.name)
          return true
        }
      }
    }
    return false
  }

  argsNames () {
    return Array.from(this.args.keys())
  }

  toString () {
    return `${this.returnType.toString()} ${this.name}(${Array.from(
      this.args.values()
    )
      .map(it => it.toString())
      .join(', ')})`
  }

  what () {
    return 'operation'
  }

  toJSON () {
    return {
      what: 'operation',
      name: this.name,
      args: Array.from(this.args.values()),
      static: this.static,
      returnType: this.returnType,
      identifiedArg: Array.from(this.identifiedArg),
      hasTypeDefArgs: this.hasTypeDefArgs,
      typeDefArgs: this.typeDefArgs
    }
  }
}

module.exports = Operation
