const Finder = require('./lib/finder')
const Generator = require('./lib/generator')
const path = require('path')
const fs = require('fs-extra')
const program = require('commander')

program.version(fs.readJsonSync('package.json').version, '-v, --version')

program
  .command('identify <path>')
  .option(
    '-d, --dump',
    'Dumps the found interfaces in a file called "identified.json" where'
  )
  .option('-V, --verbose', 'Prints all parsing errors and other information')
  .description(
    'Identifies Web IDL interfaces found at path (file or directory)'
  )
  .action(async (p, options) => {
    const finder = new Finder(options.verbose)
    let dp = 'identified.json'
    if (options.dump) {
      dp = path.join(options.dump, dp)
    }
    await finder.findAndDump(p, dp)
  })

program
  .command('view <path>')
  .option('-V, --verbose', 'Prints all parsing errors and other information')
  .description(
    'Prints the identifies Web IDL interfaces found at path (file or directory)'
  )
  .action(async (p, options) => {
    const finder = new Finder(options.verbose)
    const found = await finder.find(p)
    for (const iface of found.values()) {
      console.log(`${iface}`)
    }
  })

program
  .command('generate <idls>')
  .option(
    '-d, --dump',
    'Dumps the found interfaces in a file called "identified.json" where'
  )
  .option('-n, --name', 'The name of the generated client-side rewriter')
  .description(
    'Generates a client-side rewriter from Web IDL interfaces found at idls (file or directory)'
  )
  .action(async p => {
    console.log('TODO')
  })

program.parse(process.argv)
