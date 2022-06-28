const chalk = require('chalk');

const ERROR = (...args) => {
    console.log(chalk.red('|🍓|'), ...args);
    process.exit(1);
}
const WARN = (...args) => console.log(chalk.yellow('|🍋|'), ...args);
const SUCCESS = (...args) => console.log(chalk.green('|🍏|'), ...args);
const LOG = (...args) => console.log(chalk.blue('|🫐|'), ...args);
const PRINT = (...args) => console.log(chalk.magenta('|🍇|', ...args));
const PP = (obj) => JSON.stringify(obj, null, 2);

module.exports = {
    ERROR,
    WARN,
    SUCCESS,
    LOG,
    PP,
    PRINT
}