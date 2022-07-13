import yargs from 'yargs'
import fs from 'fs';
import repl from 'repl';
import chalk from 'chalk';
import tokenize, { Token } from '../berri-lib/tokenizer.js';
import parse, { ASTNode } from '../berri-lib/parser.js';
import interpret from '../berri-lib/interpreter.js';
import { 
    ERROR,
    WARN,
    PP,
    LOG,
    PRINT
} from '../berri-lib/logger.js';
import { Context, emptyContext } from '../berri-lib/context.js'
import { Config } from './config-type.js'

type Debug = [
    tokens: Token[],
    ast: ASTNode,
    result: Context
]
type Arguments = {
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
}
const args: Arguments = yargs(process.argv.slice(2)).parseSync();

const testCaseDir = './test/cases';
const readDir = 'examples';

export function saveTestCase (fileName, code, tokens, ast, out) {
    if (!fs.existsSync(testCaseDir)) {
        fs.mkdirSync(testCaseDir);
    }
    const caseDir = `${testCaseDir}/${fileName.slice(0,-4)}.case`;
    if (!fs.existsSync(caseDir))
        fs.mkdirSync(caseDir);
    fs.writeFileSync(`${caseDir}/raw`, code)
    fs.writeFileSync(`${caseDir}/tok`, PP(tokens))
    fs.writeFileSync(`${caseDir}/ast`, PP(ast))
    fs.writeFileSync(`${caseDir}/out`, PP(out))
}
/**
 * In debug, returns resultant (Debug). 
 * When not, returns resultant (Context)
 */
export default function berri (code: string, context: Context = emptyContext, config: Config): any {
    const tokens: Token[] = tokenize(code);
    //LOG(tokens)
    const ast: ASTNode = parse(tokens);
    //LOG(ast)
    const out: Context = interpret(ast, context);
    //LOG(out)
    switch(config.berriOutput) {
        case 'all':
            return [tokens, ast, out];
        case 'context':
            return out;
    }
    if (config.berriOutput === 'debug') {
        return [tokens, ast, out];
    } else {
        return out;
    }
} 


if (args._.length > 1) {
    ERROR('Please provide one file name');
} else if (args._.length === 1) {
    const fileName: string = `${readDir}/${args._[0]}`;
    const code: string = fs.readFileSync(fileName, 'utf8');

    const config = JSON.parse(fs.readFileSync('./ber-config.json', 'utf-8'));
    const [tokens, ast, out] = berri(code, emptyContext, config);
    if (typeof(args._['save']) !== undefined) {
        try {
            saveTestCase(args._[0], code, tokens, ast, out);
        } catch (e) {
            ERROR(e);
        }
    }
} else {
    const config = JSON.parse(fs.readFileSync('./ber-repl-config.json', 'utf-8'));
    const replOptions = {
        useColors: true
    }
    const instance = repl.start();
    instance.on('exit', ()=> {
        PRINT('quitting...');
        process.exit();
    })
    instance.on(')
    let currentContext = Object.assign({}, emptyContext);
    var stdin = process.openStdin();
    PRINT('berri repl v1.0.0')
    stdin.addListener("data", (d) => {
        currentContext = berri(d.toString().trim(), currentContext, config);
        PRINT(currentContext.result);
    });
}   
