import chalk from 'chalk'

type Logger = (x: any) => void;

function isPrimitive(x: any): x is number | string | boolean {
    return (typeof x == 'number'||typeof x == 'string'||typeof x == 'boolean');
}

function generateLogger(colorFunction: any, prefix: string, shouldThrow: boolean = false): Logger {
    return (x: any) => {
        if(Array.isArray(x)) {
            console.log(colorFunction(prefix, ...x.map((value) => isPrimitive(value) ? value : PP(value))));
        } else if (shouldThrow) {
            throw(colorFunction(prefix, isPrimitive(x) ? x : PP(x)));
        } else {
            console.log(colorFunction(prefix, isPrimitive(x) ? x : PP(x)));
        }
    }
}
export const ERROR: Logger = generateLogger(chalk.red, '|🍓|', true);
export const WARN: Logger = generateLogger(chalk.yellow, '|🍋|');
export const SUCCESS: Logger = generateLogger(chalk.green, '|🍏|');
export const LOG: Logger = generateLogger(chalk.blue, '|🫐|');
export const PRINT: Logger = generateLogger(chalk.magenta, '|🍇|');
export const PP = (x: any) => {
    return JSON.stringify(x, null, 2)
}
const verboseFunction = (key, val) => {
    if (typeof val === 'function' || val && val.constructor === RegExp) {
        return String(val)
    }
    return val;
}