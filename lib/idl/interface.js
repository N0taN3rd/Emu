const Attribute = require('./attributte')
const Operation = require('./operation')
const {Constructor, NamedConstructor} = require('./constructors')

const baseInterface = new Set(['Attr', 'Node', 'Element'])

class Interface {
  constructor (ifaceDef) {
    this.name = ifaceDef.name
    this.attributes = new Map()
    this.operations = new Map()
    this.inheritedInterfaces = new Map()
    this.implemented = new Map()
    this.setterOperations = []
    this.getterOperations = []
    this.otherMembers = []
    this.construtors = []
    this.namedConstrutors = []
    this.exposedOn = []
    this.noObject = false
    this.unforgeable = false
    this.implementedAs = ''
    this.what = 'interface'
    this.implements = new Set()
    this.directlyInherits = ifaceDef.inheritance
    this.partial = ifaceDef.partial
    this._addMembers(ifaceDef.members)
    this._addExtAttrs(ifaceDef.extAttrs)
  }

  toString () {
    return this.name
  }

  _addMembers (members) {
    for (let i = 0; i < members.length; ++i) {
      let member = members[i]
      switch (member.type) {
        case 'attribute':
          this.attributes.set(member.name, new Attribute(member))
          break
        case 'operation':
          if (member.setter) {
            this.setterOperations.push(member)
          } else if (member.getter) {
            this.getterOperations.push(member)
          } else if (!member.stringifier) {
            if (this.operations.has(member.name)) {
              // let old = this.operations.get(member.name)
              // console.log(old,member)
              if (member.arguments) {
                if (
                  this.operations.get(member.name).args.size <
                  member.arguments.length
                ) {
                  this.operations.set(member.name, new Operation(member))
                }
              }
            } else {
              this.operations.set(member.name, new Operation(member))
            }
          }
          break
        default:
          // console.log(member)
          this.otherMembers.push(member)
          break
      }
    }
  }

  _addExtAttrs (extAttrs) {
    for (let i = 0; i < extAttrs.length; ++i) {
      let eattr = extAttrs[i]
      if (eattr) {
        switch (eattr.name) {
          case 'Constructor':
            this.construtors.push(new Constructor(eattr))
            break
          case 'NamedConstructor':
            this.namedConstrutors.push(new NamedConstructor(eattr))
            break
          case 'NoInterfaceObject':
            this.noObject = true
            break
          case 'Unforgeable':
            this.unforgeable = true
            break
          case 'Exposed':
            this.exposedOn = this.exposedOn.concat(eattr.rhs.value)
            break
          case 'ImplementedAs':
            this.implementedAs = eattr.rhs.value
            break
        }
      }
    }
  }

  addPartial (ifaceDef) {
    let members = ifaceDef.members
    for (let i = 0; i < members.length; ++i) {
      let member = members[i]
      switch (member.type) {
        case 'attribute':
          if (this.attributes.has(member.name)) {
            console.log(this.name, 'already has', member.name)
          } else {
            this.attributes.set(member.name, new Attribute(member))
          }
          break
        case 'operation':
          if (member.setter) {
            this.setterOperations.push(member)
          } else if (member.getter) {
            this.getterOperations.push(member)
          } else if (!member.stringifier) {
            if (this.operations.has(member.name)) {
              console.log(this.name, 'already has', member.name)
            } else {
              this.operations.set(member.name, new Operation(member))
            }
          }
          break
        default:
          this.otherMembers.push(member)
          break
      }
    }
    // this.partials.push(new Interface(ifaceDef))
  }

  getAttributesNamed (names) {
    let found = []
    let alreadyFound = new Set()
    for (let i = 0; i < names.length; ++i) {
      let name = names[i]
      if (this.attributes.has(name) && !alreadyFound.has(name)) {
        alreadyFound.add(name)
        found.push(this.attributes.get(name))
      }
    }
    for (const iface of this.inheritedInterfaces.values()) {
      let maybeFound = iface.getAttributesNamedTrackingSeen(names, alreadyFound)
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    for (const iface of this.implemented.values()) {
      let maybeFound = iface.getAttributesNamedTrackingSeen(names, alreadyFound)
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    return found
  }

  getAttributesOfType (types) {
    let found = []
    let alreadyFound = new Set()
    const atts = Array.from(this.attributes.values())
    for (let i = 0; i < types.length; i++) {
      let t = types[i]
      for (let j = 0; j < atts.length; j++) {
        let attr = atts[j]
        if (attr.isType(t) && !alreadyFound.has(attr.name)) {
          found.push(attr)
          alreadyFound.add(attr.name)
        }
      }
    }
    for (const iface of this.implemented.values()) {
      let maybeFound = iface.getAttributesOfTypeTrackingSeen(
        types,
        alreadyFound
      )
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    return found
  }

  getDirectAttributesOfType (types) {
    let found = []
    let alreadyFound = new Set()
    const atts = Array.from(this.attributes.values())
    for (let i = 0; i < types.length; i++) {
      let t = types[i]
      for (let j = 0; j < atts.length; j++) {
        let attr = atts[j]
        if (attr.isType(t) && !alreadyFound.has(attr.name)) {
          found.push(attr)
          alreadyFound.add(attr.name)
        }
      }
    }
    return found
  }

  getDirectOperationsWithArgsOfType (types) {
    let found = []
    let alreadyFound = new Set()
    for (const [opName, opt] of this.operations.entries()) {
      if (!alreadyFound.has(opName) && opt.hasArgOfTypes(types)) {
        found.push(opt)
        alreadyFound.add(opName)
        // console.log(this.name, opName,opt.argsNames())
      }
    }
    return found
  }

  getAttributesOfTypeTrackingSeen (types, seen) {
    let found = []
    const atts = Array.from(this.attributes.values())
    for (let i = 0; i < types.length; i++) {
      let t = types[i]
      for (let j = 0; j < atts.length; j++) {
        let attr = atts[j]
        if (attr.isType(t) && !seen.has(attr.name)) {
          found.push(attr)
          seen.add(attr.name)
        }
      }
    }
    return found
  }

  getOperationsWithArgsOfType (types, typeDefInfo = null) {
    let found = []
    let alreadyFound = new Set()
    for (const [opName, opt] of this.operations.entries()) {
      if (!alreadyFound.has(opName) && opt.hasArgOfTypes(types, typeDefInfo)) {
        found.push(opt)
        alreadyFound.add(opName)
        // console.log(this.name, opName,opt.argsNames())
      }
    }
    for (const iface of this.inheritedInterfaces.values()) {
      let maybeFound = iface.getOperationsWithArgsOfTypeTrackingSeen(
        types,
        alreadyFound,
        typeDefInfo
      )
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    for (const iface of this.implemented.values()) {
      let maybeFound = iface.getOperationsWithArgsOfTypeTrackingSeen(
        types,
        alreadyFound,
        typeDefInfo
      )
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    return found
  }

  getOperationsWithArgsOfTypeTrackingSeen (types, seen, typeDefInfo = null) {
    let found = []
    for (const [opName, opt] of this.operations.entries()) {
      if (!seen.has(opName) && opt.hasArgOfTypes(types, typeDefInfo)) {
        found.push(opt)
        seen.add(opName)
        // console.log(this.name, opName,opt.argsNames())
      }
    }
    return found
  }

  getOperationsWithArgsName (names) {
    let found = []
    let alreadyFound = new Set()
    for (const [opName, opt] of this.operations.entries()) {
      if (!alreadyFound.has(opName) && opt.hasArgNames(names)) {
        found.push(opt)
        alreadyFound.add(opName)
        // console.log(this.name, opName,opt.argsNames())
      }
    }

    for (const iface of this.inheritedInterfaces.values()) {
      let maybeFound = iface.getOperatiosWithArgsNamedTrackingSeen(
        names,
        alreadyFound
      )
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    for (const iface of this.implemented.values()) {
      let maybeFound = iface.getOperatiosWithArgsNamedTrackingSeen(
        names,
        alreadyFound
      )
      if (maybeFound.length) {
        found = found.concat(maybeFound)
      }
    }
    return found
  }

  getAttributesNamedTrackingSeen (names, seen) {
    let found = []
    for (let i = 0; i < names.length; ++i) {
      let name = names[i]
      if (this.attributes.has(name) && !seen.has(name)) {
        seen.add(name)
        found.push(this.attributes.get(name))
      }
    }
    return found
  }

  getOperatiosWithArgsNamedTrackingSeen (names, seen) {
    let found = []
    for (const [opName, op] of this.operations.entries()) {
      if (!seen.has(opName) && op.hasArgNames(names)) {
        found.push(op)
        seen.add(opName)
        // console.log(this.name, opName,opt.argsNames())
      }
    }
    return found
  }

  getOperationsNamed (names) {
    let found = []
    let toFind = new Set([...names])
    const seen = new Set()
    for (const [opName, op] of this.operations.entries()) {
      if (!seen.has(opName) && toFind.has(opName)) {
        found.push(op)
        seen.add(opName)
        // console.log(this.name, opName,opt.argsNames())
      }
    }
    return found
  }

  addImplements (imp) {
    this.implements.add(imp)
  }

  addInherited (inherited) {
    this.inheritedInterfaces.set(inherited.name, inherited)
  }

  addImplementedIface (inherited) {
    this.implemented.set(inherited.name, inherited)
  }

  getConstructorsWithArgsName (names) {
    let found = []
    let seen = new Set()
    for (let i = 0; i < this.construtors.length; ++i) {
      let c = this.construtors[i]
      if (c.hasArgNamed(names)) {
        let names = c.argsNames()
        if (!seen.has(names)) {
          seen.add(names)
          found.push(c)
        }
      }
    }
    for (let i = 0; i < this.namedConstrutors.length; ++i) {
      let c = this.namedConstrutors[i]
      if (c.hasArgNamed(names)) {
        let names = c.argsNames()
        if (!seen.has(names)) {
          seen.add(names)
          found.push(c)
        }
      }
    }
    return found
  }

  getConstructorsWithArgsOfType (types, typeDefInfo = null) {
    let found = []
    let seen = new Set()
    for (let i = 0; i < this.construtors.length; ++i) {
      let c = this.construtors[i]
      if (c.hasArgOfTypes(types, typeDefInfo)) {
        let names = c.argsNames()
        if (!seen.has(names)) {
          seen.add(names)
          found.push(c)
        }
      }
    }
    for (let i = 0; i < this.namedConstrutors.length; ++i) {
      let c = this.namedConstrutors[i]
      if (c.hasArgOfTypes(types, typeDefInfo)) {
        let names = c.argsNames()
        if (!seen.has(names)) {
          seen.add(names)
          found.push(c)
        }
      }
    }
    return found
  }

  isHTMLElement () {
    return this.inheritedInterfaces.has('HTMLElement')
  }

  isWindowOrDocument () {
    return this.name === 'Window' || this.name === 'Document'
  }

  notBaseInterface () {
    return !baseInterface.has(this.name)
  }

  notBaseInterfaceOrHTMLElement () {
    return (
      !baseInterface.has(this.name) &&
      !this.inheritedInterfaces.has('HTMLElement')
    )
  }
}

module.exports = Interface
