const Multimap = require('../util/multimap')

class TypeDefs {
  constructor () {
    this._typeDefs = new Multimap()
    this._typeDefed = new Multimap()
  }

  addTypeDef (typeDef) {
    if (typeDef.idlType.union) {
      let idlTypes = typeDef.idlType.idlType
      for (let i = 0; i < idlTypes.length; ++i) {
        this._typeDefs.set(typeDef.name, idlTypes[i].idlType)
        this._typeDefed.set(idlTypes[i].idlType, typeDef.name)
      }
    } else {
      this._typeDefs.set(typeDef.name, typeDef.idlType.idlType)
      this._typeDefed.set(typeDef.idlType.idlType, typeDef.name)
    }
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
