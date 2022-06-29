import chalk, { ChalkInstance } from 'chalk';

type Logger = (x: any) => void;

function isPrimitive(x: any): x is number | string | boolean {
    return (typeof x == 'number'||typeof x == 'string'||typeof x == 'boolean');
}

function generateLogger(colorFunction: ChalkInstance, prefix: string, shouldExit: boolean = false): Logger {
    return (x: any) => {
        console.log(colorFunction(prefix, (isPrimitive(x) ? x : PP(x))));
        if (shouldExit) {
            process.exit(1);
        }
    }
}
export const ERROR: Logger = generateLogger(chalk.red, '|🍓|', true);
export const WARN: Logger = generateLogger(chalk.yellow, '|🍋|');
export const SUCCESS: Logger = generateLogger(chalk.green, '|🍏|');
export const LOG: Logger = generateLogger(chalk.blue, '|🫐|');
export const PRINT: Logger = generateLogger(chalk.magenta, '|🍇|');
export const PP = (x: any) => {
    JSON.stringify(x, null, 2)
}