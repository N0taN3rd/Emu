const Type = require('./type')

class Argument {
  constructor (arg) {
    this.name = arg.name
    this.optional = arg.optional
    this.variadic = arg.variadic
    this.extAttrs = arg.extAttrs
    this.type = new Type(arg.idlType)
  }

  isOfType (type) {
    if (this.type.union) {
      return this.type.unionHasType(type)
    }
    return this.type.is === type
  }

  toString () {
    return `${this.type.toString()} ${this.name}`
  }

  toJSON () {
    return {
      what: 'argument',
      name: this.name,
      optional: this.optional,
      variadic: this.variadic,
      extAttrs: this.extAttrs,
      type: this.type
    }
  }
}

module.exports = Argument
