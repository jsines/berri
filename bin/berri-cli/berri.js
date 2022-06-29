import yargs from 'yargs';
var args = yargs(process.argv.slice(2)).argv;
import fs from 'fs';
import { tokenize } from '../berri-lib/tokenizer.js';
import { parse } from '../berri-lib/parser.js';
import { interpret } from '../berri-lib/interpreter.js';
import { ERROR, } from '../berri-lib/logger.js';
function berri(args) {
    var fileName = args._[0];
    var code = fs.readFileSync(fileName, 'utf8');
    var tokens = tokenize(code);
    //LOG(tokens)
    var ast = parse(tokens);
    //LOG(ast)
    var result = interpret(ast);
    //LOG(result)
}
if (args._.length != 1) {
    ERROR('Please provide one file name');
}
else {
    berri(args);
}
