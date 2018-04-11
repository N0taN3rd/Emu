const Identifier = require('./identifier')
const { getIdls, parseIdlFile } = require('../util/readParseIdl')
const {
  knownURLProps,
  constructorURLProps,
  checkSpecial
} = require('../idl/identifiers')
const Identified = require('../idl/identified')

class Finder {
  static async find (idlPath) {
    const identifier = new Identifier()
    const idls = await getIdls(idlPath)
    let pidls = []
    for (let i = 0; i < idls.length; ++i) {
      let { fpath } = idls[i]
      const parsed = await parseIdlFile(fpath)
      if (parsed) {
        identifier.cache(parsed)
        pidls.push(parsed)
      }
    }
    identifier.mergeInheritance()
    let found = new Map()
    for (const iface of identifier.interfaces.values()) {
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
      if (identifier.isTypeDefed(name)) {
        let typeDefs = identifier.getTypeDefsForName(name)
        for (const iface of identifier.interfaces.values()) {
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
    foundIfaces = Array.from(found.keys()).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
    for (const fid of foundIfaces) {
      let id = found.get(fid)
      if (id.ok()) {
        if (id.notBaseInterfaceOrHTMLElement()) {
          for (const fid2 of found.keys()) {
            let iface = identifier.interfaces.get(fid2)
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
