import yargs from 'yargs'
import fs from 'fs';
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
import { Context } from '../berri-lib/context.js'

const testCaseDir = './test/cases';

interface Config {
    genTestCase: boolean,
}
export function saveTestCase (fileName, code, tokens, ast, result) {
    if (!fs.existsSync(testCaseDir)) {
        fs.mkdirSync(testCaseDir);
    }
    const caseDir = `${testCaseDir}/${fileName.slice(0,-4)}.case`;
    if (!fs.existsSync(caseDir))
        fs.mkdirSync(caseDir);
    fs.writeFileSync(`${caseDir}/raw`, code)
    fs.writeFileSync(`${caseDir}/tok`, PP(tokens))
    fs.writeFileSync(`${caseDir}/ast`, PP(ast))
    fs.writeFileSync(`${caseDir}/out`, PP(result))
}
export default function berri (args: any) {
    const fileName: string = args._[0]
    const code: string = fs.readFileSync(fileName, 'utf8');
    const tokens: Token[] = tokenize(code);
    const ast: ASTNode = parse(tokens);
    const result: Context = interpret(ast);

    if (typeof(args._['save']) !== undefined) {
        try {
            saveTestCase(fileName, code, tokens, ast, result);
        } catch (e) {
            ERROR(e);
        }
    }
}

type Arguments = {
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
}
const args: Arguments = yargs(process.argv.slice(2)).parseSync();

if (args._.length != 1) {
    ERROR('Please provide one file name');
} else {
    berri(args);
}