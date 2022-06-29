import chalk from 'chalk';
function isPrimitive(x) {
    return (typeof x == 'number' || typeof x == 'string' || typeof x == 'boolean');
}
function generateLogger(colorFunction, prefix, shouldExit) {
    if (shouldExit === void 0) { shouldExit = false; }
    return function (x) {
        console.log(colorFunction(prefix, (isPrimitive(x) ? x : PP(x))));
        if (shouldExit) {
            process.exit(1);
        }
    };
}
export var ERROR = generateLogger(chalk.red, '|🍓|', true);
export var WARN = generateLogger(chalk.yellow, '|🍋|');
export var SUCCESS = generateLogger(chalk.green, '|🍏|');
export var LOG = generateLogger(chalk.blue, '|🫐|');
export var PRINT = generateLogger(chalk.magenta, '|🍇|');
export var PP = function (x) {
    JSON.stringify(x, null, 2);
};
