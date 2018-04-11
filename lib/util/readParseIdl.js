const fs = require('fs-extra')
const WebIDL2 = require('webidl2')
const path = require('path')

/**
 * @desc Read the directory containing the Web IDL files to be parsed
 * @param {string} dir The directory containing the Web IDL files
 * @returns {Promise<{name: string, fpath: string}[]>}
 */
async function getIdls (dir) {
  const files = await fs.readdir(dir)
  return files.map(it => ({ name: it, fpath: path.join(dir, it) }))
}

/**
 * @desc Parses a Web IDL file and returns an the syntax tree of the definition in an array
 * @param {string} fpath Path to the Web IDL file to be parsed
 * @returns {Promise<?Object[]>}
 */
async function parseIdlFile (fpath) {
  let value
  try {
    let fc = await fs.readFile(fpath, 'utf8')
    value = WebIDL2.parse(fc, { allowNestedTypedefs: false })
  } catch (error) {
    value = undefined
  }
  return value
}

module.exports = {
  getIdls,
  parseIdlFile
}
