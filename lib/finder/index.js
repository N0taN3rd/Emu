const path = require('path')
const fs = require('fs-extra')
const { getIdls, parseIdlFile, isWebIdlFile } = require('../util/readParseIdl')
const {
  knownURLProps,
  constructorURLProps,
  checkSpecial
} = require('../idl/identifiers')
const Identified = require('../idl/identified')
const { Interface, TypeDefs } = require('../idl')
const { warning } = require('../util/colorPrinters')

class Finder {
  constructor (verbose = false) {
    this.verbose = verbose
    this.interfaces = new Map()
    this.typeDefs = new TypeDefs()
  }

  _checkClear () {
    if (this.interfaces.size) {
      this.interfaces.clear()
    }
    if (this.typeDefs.size()) {
      this.typeDefs.clear()
    }
  }

  async find (dirOrFilePath) {
    this._checkClear()
    const stat = await fs.stat(dirOrFilePath)
    if (stat.isFile()) {
      if (isWebIdlFile(dirOrFilePath)) {
        const parsed = await parseIdlFile(dirOrFilePath)
        this.cache(parsed)
      } else {
        throw new Error(
          `Emu cannot parse a file with extension ${path.extname(
            dirOrFilePath
          )}.\n${dirOrFilePath}`
        )
      }
    } else if (stat.isDirectory()) {
      const idls = await getIdls(dirOrFilePath)
      if (idls.length === 0) {
        throw new Error(
          `Emu did not find any Web IDL files found in the directory ${dirOrFilePath}`
        )
      }
      for (let i = 0; i < idls.length; ++i) {
        let { fpath } = idls[i]
        try {
          const parsed = await parseIdlFile(fpath)
          this.cache(parsed)
        } catch (e) {
          if (this.verbose) {
            warning(
              `Non-fatal parsing error occurred for ${fpath}. Displaying error message:\n${e}\n`
            )
          }
        }
      }
    } else {
      throw new Error(`Emu does not know how to handle ${dirOrFilePath}`)
    }
    return this._findLogic()
  }

  async findAndDump (dirOrFilePath, dumpTo) {
    const found = await this.find(dirOrFilePath)
    await fs.writeJson(dumpTo, [...found.values()])
    return found
  }

  async findAndDumpForGen (dirOrFilePath, dumpTo) {
    const found = await this.find(dirOrFilePath)
    const dump2 = {
      htmlElements: [],
      others: []
    }
    for (const iface of found.values()) {
      if (iface.isHTMLElement) {
        // console.log(iface.toString())
        // dump.push(iface)
        dump2.htmlElements.push(iface)
      } else {
        dump2.others.push(iface)
      }
      // console.log()
    }
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

  getInterface (name) {
    return this.interfaces.get(name)
  }

  _findLogic () {
    this.mergeInheritance()
    let found = new Map()
    for (const iface of this.interfaces.values()) {
      if (!iface.noObject) {
        if (iface.isHTMLElement()) {
          let foundAttributes = iface.getAttributesNamed(knownURLProps)
          let foundMethod = iface.getOperationsWithArgsName(knownURLProps)
          if (foundAttributes.length) {
            let id = new Identified(iface)
            found.set(iface.name, id)
            id.addAttributes(foundAttributes)
          }
          if (foundMethod.length) {
            if (found.has(iface.name)) {
              found.get(iface.name).addOperations(foundMethod)
            } else {
              let id = new Identified(iface)
              found.set(iface.name, id)
              id.addOperations(foundMethod)
            }
          }
          let maybeConstructor = iface.getConstructorsWithArgsName(
            knownURLProps
          )
          if (maybeConstructor.length) {
            if (found.has(iface.name)) {
              found.get(iface.name).addConstructors(maybeConstructor)
            } else {
              let id = new Identified(iface)
              found.set(iface.name, id)
              id.addConstructors(maybeConstructor)
            }
          }
        } else {
          let foundAttributes = iface.getAttributesNamed(constructorURLProps)
          let foundMethod = iface.getOperationsWithArgsName(constructorURLProps)
          if (foundAttributes.length) {
            let id = new Identified(iface)
            found.set(iface.name, id)
            id.addAttributes(foundAttributes)
          }
          if (foundMethod.length) {
            if (found.has(iface.name)) {
              found.get(iface.name).addOperations(foundMethod)
            } else {
              let id = new Identified(iface)
              found.set(iface.name, id)
              id.addOperations(foundMethod)
            }
          }
          let maybeConstructor = iface.getConstructorsWithArgsName(
            constructorURLProps
          )
          if (maybeConstructor.length) {
            if (found.has(iface.name)) {
              found.get(iface.name).addConstructors(maybeConstructor)
            } else {
              let id = new Identified(iface)
              found.set(iface.name, id)
              id.addConstructors(maybeConstructor)
            }
          }
        }

        if (checkSpecial.has(iface.name)) {
          const cs = checkSpecial.get(iface.name)
          if (cs.funs) {
            let opts = iface.getOperationsNamed(cs.funs)
            if (opts.length) {
              if (found.has(iface.name)) {
                found.get(iface.name).addOperations(opts)
              } else {
                let id = new Identified(iface)
                found.set(iface.name, id)
                id.addOperations(opts)
              }
            }
          }
          if (cs.props) {
            let props = iface.getAttributesNamed(cs.props)
            if (props.length) {
              if (found.has(iface.name)) {
                found.get(iface.name).addAttributes(props)
              } else {
                let id = new Identified(iface)
                found.set(iface.name, id)
                id.addAttributes(props)
              }
            }
          }
        }
      }
    }

    let foundIfaces = Array.from(found.keys())
    for (let i = 0; i < foundIfaces.length; ++i) {
      const name = foundIfaces[i]
      if (this.isTypeDefed(name)) {
        let typeDefs = this.getTypeDefsForName(name)
        for (const iface of this.interfaces.values()) {
          let maybeOpts = iface.getOperationsWithArgsOfType(typeDefs)
          let maybeConstr = iface.getConstructorsWithArgsOfType(typeDefs)
          if (maybeOpts.length) {
            if (found.has(iface.name)) {
              found.get(iface.name).addOperations(maybeOpts)
            } else {
              let id = new Identified(iface)
              found.set(iface.name, id)
              id.addOperations(maybeOpts)
            }
          }
          if (maybeConstr.length) {
            if (found.has(iface.name)) {
              found.get(iface.name).addConstructors(maybeConstr)
            } else {
              let id = new Identified(iface)
              found.set(iface.name, id)
              id.addConstructors(maybeConstr)
            }
          }
        }
      }
    }
    for (const fid of foundIfaces) {
      let id = found.get(fid)
      if (id.ok()) {
        if (id.notBaseInterfaceOrHTMLElement()) {
          for (const fid2 of found.keys()) {
            let iface = this.interfaces.get(fid2)
            if (iface.notBaseInterfaceOrHTMLElement()) {
              let maybeProp = iface.getDirectAttributesOfType([id.name])
              if (maybeProp.length) {
                let exposer = found.get(iface.name)
                for (let i = 0; i < maybeProp.length; ++i) {
                  let at = maybeProp[i]
                  let type = at.type.toString()
                  exposer.addExposedFound(type, at)
                  found.get(type).addExposedFoundOn(type)
                }
              }
            }
          }
        }
      }
    }
    return found
  }
}

module.exports = Finder
