const Multimap = require('../util/multimap')

class TypeDef {
  constructor (tdInfo) {
    this.name = tdInfo.name
    this.sequence = tdInfo.idlType.sequence
    this.generic = tdInfo.idlType.generic
    this.nullable = tdInfo.idlType.nullable
    this.isUnion = tdInfo.idlType.union
    this.for = new Set()
    let type = tdInfo.idlType
    if (this.isUnion) {
      for (let i = 0; i < type.idlType.length; ++i) {
        this.for.add(type.idlType[i].idlType)
      }
    } else {
      if (typeof type.idlType === 'object') {
        this.for.add(type.idlType.idlType)
      } else {
        this.for.add(type.idlType)
      }
    }
  }

  toJSON () {
    return {
      sequence: this.sequence,
      generic: this.generic,
      nullable: this.nullable,
      isUnion: this.isUnion,
      for: Array.from(this.for)
    }
  }
}

class TypeDefs {
  constructor () {
    this._typeDefs = new Map()
    this._typeDefed = new Multimap()
  }

  addTypeDef (typeDef) {
    this._typeDefs.set(typeDef.name, new TypeDef(typeDef))
    if (typeDef.idlType.union) {
      let idlTypes = typeDef.idlType.idlType
      for (let i = 0; i < idlTypes.length; ++i) {
        this._typeDefed.set(idlTypes[i].idlType, typeDef.name)
      }
    } else {
      this._typeDefed.set(typeDef.idlType.idlType, typeDef.name)
    }
  }

  getTypeDefTypes (name) {
    return this._typeDefs.get(name)
  }

  isTypeDefed (name) {
    return this._typeDefed.has(name)
  }

  getTypeDefsForName (name) {
    return this._typeDefed.get(name)
  }

  size () {
    return this._typeDefed.size
  }

  clear () {
    this._typeDefed.clear()
    this._typeDefs.clear()
  }
}

module.exports = TypeDefs
