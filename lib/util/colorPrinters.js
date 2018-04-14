const chalk = require('chalk')

const warnColor = chalk.keyword('orange')

function warning (m) {
  console.log(warnColor(m))
}

module.exports = { warning }
