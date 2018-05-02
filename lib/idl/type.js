class Type {
  constructor (type) {
    this.sequence = type.sequence
    this.generic = type.generic
    this.nullable = type.nullable
    this.isUnion = type.union
    this.union = []
    this.is = ''
    this.what = 'type'
    if (this.isUnion) {
      for (let i = 0; i < type.idlType.length; ++i) {
        this.union.push(new Type(type.idlType[i]))
      }
    } else {
      if (typeof type.idlType === 'object') {
        this.is = type.idlType.idlType
      } else {
        this.is = type.idlType
      }
    }
  }

  unionHasType (type) {
    for (let i = 0; i < this.union.length; ++i) {
      if (this.union[i].is === type) return true
    }
    return false
  }

  isType (type) {
    if (this.isUnion) {
      return this.unionHasType(type)
    }
    return this.is === type
  }

  toString () {
    if (this.isUnion) {
      return this.union.map(it => it.toString()).join('|')
    }
    return this.is
  }

  toJSON () {
    return {
      what: 'type',
      sequence: this.sequence,
      generic: this.generic,
      nullable: this.nullable,
      isUnion: this.union,
      union: this.union,
      is: this.is
    }
  }
}

module.exports = Type
