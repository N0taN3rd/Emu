const Argument = require('./argument')

class Constructor {
  constructor (constructr) {
    this.args = []
    this.argsM = new Map()
    this._argNames = new Set()
    this.identifiedArgs = new Set()
    if (constructr.arguments) {
      for (let i = 0; i < constructr.arguments.length; ++i) {
        let arg = new Argument(constructr.arguments[i])
        this.args.push(arg)
        this._argNames.add(arg.name)
        this.argsM.set(arg.name, arg)
      }
    }
  }

  hasArgNamed (names) {
    if (Array.isArray(names)) {
      for (let i = 0; i < names.length; ++i) {
        if (this._argNames.has(names[i])) {
          this.identifiedArgs.add(names[i])
          return true
        }
      }
      return false
    }
    let has = this._argNames.has(names)
    if (has) {
      this.identifiedArgs.add(names)
    }
    return has
  }

  hasArgOfTypes (types) {
    for (let i = 0; i < this.args.length; ++i) {
      let arg = this.args[i]
      for (const type of types) {
        if (arg.type.isUnion && arg.type.unionHasType(type)) {
          this.identifiedArgs.add(arg.name)
          return true
        } else if (arg.type.is === type) {
          this.identifiedArgs.add(arg.name)
          return true
        }
      }
    }
    return false
  }

  isNamed () {
    return false
  }

  argsNames () {
    return this.args.map(a => a.name).join(', ')
  }

  toString () {
    return `Constructor(${this.argsNames()})`
  }

  toJSON () {
    return {
      what: 'constructor',
      args: this.args,
      identifiedArg: Array.from(this.identifiedArgs)
    }
  }
}

class NamedConstructor extends Constructor {
  constructor (constructr) {
    super(constructr)
    this.name = constructr.rhs.value
  }

  isNamed () {
    return true
  }

  toString () {
    return `${this.name}(${this.argsNames()})`
  }

  toJSON () {
    return {
      what: 'namedConstructor',
      name: this.name,
      args: this.args,
      identifiedArg: Array.from(this.identifiedArgs)
    }
  }
}

module.exports = {
  Constructor,
  NamedConstructor
}
