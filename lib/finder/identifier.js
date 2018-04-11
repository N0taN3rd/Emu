const { Interface, TypeDefs } = require('../idl')

class Identifier {
  constructor () {
    this.interfaces = new Map()
    this.typeDefs = new TypeDefs()
    this.enum = new Map()
    this.callback = new Map()
    this.dictionary = new Map()
    this.identified = new Map()
    this.origCache = new Map()
  }

  getInterface (name) {
    return this.interfaces.get(name)
  }

  isTypeDefed (name) {
    return this.typeDefs.isTypeDefed(name)
  }

  getTypeDefsForName (name) {
    return this.typeDefs.getTypeDefsForName(name)
  }

  cache (idlFile) {
    for (let i = 0; i < idlFile.length; ++i) {
      let what = idlFile[i]
      switch (what.type) {
        case 'interface':
          if (this.interfaces.has(what.name)) {
            if (what.partial) {
              this.interfaces.get(what.name).addPartial(what)
            } else {
              console.log('boooo', what.name)
            }
          } else {
            this.interfaces.set(what.name, new Interface(what))
          }
          break
        case 'implements':
          this.interfaces.get(what.target).addImplements(what.implements)
          break
        case 'typedef':
          this.typeDefs.addTypeDef(what)
          break
      }
    }
  }

  mergeInheritance () {
    for (const iface of this.interfaces.values()) {
      if (iface.directlyInherits) {
        let inheritedIface = this.interfaces.get(iface.directlyInherits)
        while (inheritedIface) {
          iface.addInherited(inheritedIface)
          inheritedIface = this.interfaces.get(inheritedIface.directlyInherits)
        }
      }
      for (let imp of iface.implements) {
        let implemented = this.interfaces.get(imp)
        if (implemented) {
          iface.addImplementedIface(implemented)
        }
      }
    }
  }
}

module.exports = Identifier
