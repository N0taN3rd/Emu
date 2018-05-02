const ArrayMultiMap = require('../util/arrayMultiMap')
const { baseInterface } = require('./identifiers')

class Identified {
  constructor (iface) {
    // console.log(iface.name, iface.construtors)
    this.name = iface.name
    this.atts = []
    this.isHTMLElement = iface.isHTMLElement()
    this.noObject = iface.noObject
    this.unforgeable = iface.unforgeable
    this.exposedOn = iface.exposedOn
    this._attsplit = null
    this._atNames = new Set()
    this.operations = []
    this.constructors = []
    this.namedConstructors = []
    this.exposesFound = new ArrayMultiMap()
    this.exposedOnFound = new Set()
    this.foundOn = new ArrayMultiMap()
    this.hadConstructor = iface.construtors.length > 0
  }

  hasIdAtts () {
    return this.atts.length > 0
  }

  hasIdOperations () {
    return this.operations.length > 0
  }

  hasIdConstructors () {
    return this.constructors.length > 0
  }

  onlyOverrideViaConstructor() {
    return this.hasIdConstructors()
  }


  getAtts () {
    if (this._attsplit == null) {
      this._attsplit = {readOnly: [], normal: []}
      for (let i = 0; i < this.atts.length; ++i) {
        let att = this.atts[i]
        if (att.readonly) {
          this._attsplit.readOnly.push(att)
        } else {
          this._attsplit.normal.push(att)
        }
      }
    }
    return this._attsplit
  }

  addExtAtts (iface) {
    this.noObject = iface.noObject
    this.unforgeable = iface.unforgeable
    this.exposedOn = iface.exposedOn
  }

  addAttributes (atts) {
    for (let i = 0; i < atts.length; ++i) {
      let at = atts[i]
      if (!this._atNames.has(at.name)) {
        this.atts.push(at)
        this._atNames.add(at.name)
      }
    }
  }

  addExposedFound (type, at) {
    this.exposesFound.set(type, at)
  }

  addExposedFoundOn (on) {
    this.exposedOnFound.add(on)
  }

  attributeNames () {
    return this.atts.map(it => it.name)
  }

  addOperations (operations) {
    this.operations = this.operations.concat(operations)
  }

  operationsNames () {
    return this.operations.map(it => it.toString())
  }

  addConstructors (constructors) {
    // let [named, regular] = _.partition(constructors, it => it.isNamed())
    // if (named.length) {
    //   named = _.maxBy(named, it => it.args.length)
    //   this.constructors.push(named)
    // }
    // if (named.length) {
    //   named = _.maxBy(named, it => it.args.length)
    //   this.constructors.push(named)
    // }
    let named = null
    let reg = null
    for (let i = 0; i < constructors.length; ++i) {
      let c = constructors[i]
      // console.log(c.toString())
      if (c.isNamed()) {
        if (named === null) {
          named = c
        } else {
          if (c.args.length > named.args.length) {
            named = c
          }
        }
      } else {
        if (reg === null) {
          reg = c
        } else {
          if (c.args.length > reg.args.length) {
            reg = c
          }
        }
      }
    }
    if (named !== null) {
      this.constructors.push(named)
    }
    if (reg !== null) {
      this.constructors.push(reg)
    }
  }

  addNamedConstructors (namedConstructors) {
    this.namedConstructors = this.namedConstructors.concat(namedConstructors)
  }

  ok () {
    let fatts = this.atts.filter(at => !at.readonly)
    if (fatts.length > 0) {
      return true
    }
    return this.constructors.length > 0 || this.operations.length > 0
  }

  toString () {
    let s = `${this.unforgeable ? '[Unforgeable]\n' : ''}interface ${
      this.name
    } {\n`
    if (this.constructors.length > 0) {
      for (let i = 0; i < this.constructors.length; ++i) {
        s += `  ${this.constructors[i].toString()};\n`
      }
    } else if (this.hadConstructor) {
      s += `  Constructor();\n`
    }

    if (this.atts.length > 0) {
      for (let i = 0; i < this.atts.length; ++i) {
        s += `  ${this.atts[i].toString()};\n`
      }
    }
    if (this.operations.length > 0) {
      for (let i = 0; i < this.operations.length; ++i) {
        s += `  ${this.operations[i].toString()};\n`
      }
    }
    s += '};\n'
    return s
  }

  report () {
    if (this.atts.length) {
      console.log(
        `${this.name} & Attributes & ${this.atts
          .map(it => it.name)
          .join(', ')}\\\\`
      )
    }
    if (this.operations.length) {
      console.log(
        `${this.name} & Operations & ${this.operations
          .map(it => it.name)
          .join(', ')}\\\\`
      )
    }
    if (this.constructors.length) {
      console.log(
        `${this.name} & Constructors & ${this.constructors
          .map(it => it.toString())
          .join(', ')}\\\\`
      )
    }
  }

  isWindowOrDocument () {
    return this.name === 'Window' || this.name === 'Document'
  }

  notBaseInterface () {
    return !baseInterface.has(this.name)
  }

  notBaseInterfaceOrHTMLElement () {
    return !baseInterface.has(this.name) && !this.isHTMLElement
  }

  toJSON () {
    // for(const it of this.foundOn) {
    //   console.log(it)
    // }
    return {
      name: this.name,
      atts: this.atts,
      isHTMLElement: this.isHTMLElement,
      noObject: this.noObject,
      unforgeable: this.unforgeable,
      exposedOn: this.exposedOn,
      operations: this.operations,
      constructors: this.constructors,
      namedConstructors: this.namedConstructors,
      exposesFound: this.exposesFound,
      exposedOnFound: this.exposedOnFound,
      foundOn: this.foundOn,
      hadConstructor: this.hadConstructor
    }
  }

  fromJSON (info) {}
}

module.exports = Identified
