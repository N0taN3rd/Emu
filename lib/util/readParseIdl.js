const fs = require('fs-extra')
const WebIDL2 = require('webidl2')
const path = require('path')

/**
 * @desc Checks to see if a file ends with an extension indicating it is a Web IDL file
 * @param fp Path or file name
 * @returns {boolean}
 */
function isWebIdlFile (fp) {
  return fp.endsWith('.idl') || fp.endsWith('.webidl')
}

/**
 * @desc Read the directory containing the Web IDL files to be parsed
 * @param {string} dir The directory containing the Web IDL files
 * @returns {Promise<{name: string, fpath: string}[]>}
 */
async function getIdls (dir) {
  const files = await fs.readdir(dir)
  const sanity = []
  for (let i = 0; i < files.length; ++i) {
    let file = files[i]
    if (isWebIdlFile(file)) {
      sanity.push({ name: file, fpath: path.join(dir, file) })
    }
  }
  return files.map(it => ({ name: it, fpath: path.join(dir, it) }))
}

/**
 * @desc Parses a Web IDL file and returns an the syntax tree of the definition in an array
 * @param {string} fpath Path to the Web IDL file to be parsed
 * @returns {Promise<?Object[]>}
 */
async function parseIdlFile (fpath) {
  let fc = await fs.readFile(fpath, 'utf8')
  return WebIDL2.parse(fc, { allowNestedTypedefs: true })
}

module.exports = {
  isWebIdlFile,
  getIdls,
  parseIdlFile
}
