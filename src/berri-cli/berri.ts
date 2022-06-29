import yargs from 'yargs'
const args = yargs(process.argv.slice(2)).argv;
import fs from 'fs';

import { tokenize } from '../berri-lib/tokenizer.js';
import { parse } from '../berri-lib/parser.js';
import { interpret } from '../berri-lib/interpreter.js';
import { 
    ERROR,
    WARN,
    SUCCESS,
    LOG,
} from '../berri-lib/logger.js';

function berri(args: any){
    const fileName: string = args._[0]
    const code = fs.readFileSync(fileName, 'utf8');
    const tokens = tokenize(code);
    //LOG(tokens)
    const ast = parse(tokens);
    //LOG(ast)
    const result = interpret(ast);
    //LOG(result)
}


if (args._.length != 1) {
    ERROR('Please provide one file name');
} else {
    berri(args);
}