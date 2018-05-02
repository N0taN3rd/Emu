const Type = require('./type')

class Attribute {
  constructor (att) {
    this.name = att.name
    this.static = att.static
    this.readonly = att.readonly
    this.extAttrs = att.extAttrs
    this.unforgeable = false
    this.implementedAs = ''
    this.putForwards = ''
    this.type = new Type(att.idlType)
    this._addExtAttrs(att.extAttrs)
    this.what = 'attribute'
  }

  toJSON () {
    return {
      what: 'attribute',
      name: this.name,
      static: this.static,
      readonly: this.readonly,
      unforgeable: this.unforgeable,
      putForwards: this.putForwards,
      type: this.type,
      implementedAs: this.implementedAs,
      extAttrs: this.extAttrs
    }
  }

  _addExtAttrs (extAttrs) {
    for (let i = 0; i < extAttrs.length; ++i) {
      let eattr = extAttrs[i]
      if (eattr) {
        switch (eattr.name) {
          case 'Unforgeable':
            this.unforgeable = true
            break
          case 'ImplementedAs':
            this.implementedAs = eattr.rhs.value
            // console.log(this.name, eattr)
            break
          case 'PutForwards':
            this.putForwards = eattr.rhs.value
            break
          default:
            break
        }
      }
    }
  }

  isType (type) {
    let maybeFound
    if (this.type.isUnion) {
      maybeFound = this.type.unionHasType(type)
    } else {
      maybeFound = this.type.is === type
    }
    return maybeFound
  }

  isTypes (type) {
    if (typeof type[Symbol.iterator] === 'function') {
      for (const t of type) {
        if (this.type.union && this.type.unionHasType(t)) {
          return true
        } else if (this.type.is === t) {
          return true
        }
      }
    } else {
      if (this.type.union) {
        return this.type.unionHasType(type)
      }
      return this.type.is === type
    }
  }

  toString () {
    let modifiers = ''
    if (this.putForwards !== '') {
      if (this.readonly && this.unforgeable) {
        modifiers += `[PutForwards=${this.putForwards}, Unforgeable] readonly `
      } else if (this.readonly && !this.unforgeable) {
        modifiers += `[PutForwards=${this.putForwards}] readonly `
      } else if (!this.readonly && this.unforgeable) {
        modifiers += `[PutForwards=${this.putForwards}, Unforgeable] `
      }
    } else {
      if (this.readonly && this.unforgeable) {
        modifiers += '[Unforgeable] readonly '
      } else if (this.readonly && !this.unforgeable) {
        modifiers += 'readonly '
      } else if (!this.readonly && this.unforgeable) {
        modifiers += '[Unforgeable] '
      }
    }
    return `${modifiers}${this.type.toString()} ${this.name}`
  }
}

module.exports = Attribute
