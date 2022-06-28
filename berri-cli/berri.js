const args = require('yargs')(process.argv.slice(2)).argv;
const fs = require('fs');

const { tokenize } = require('../berri-lib/tokenizer.js');
const { parse } = require('../berri-lib/parser.js');
const { interpret } = require('../berri-lib/interpreter.js');
const { 
    ERROR,
    WARN,
    SUCCESS,
    LOG,
    PP
} = require('../berri-lib/logger.js');

function berri(args){
    const fileName = args._[0]
    const code = fs.readFileSync(fileName, 'utf8');
    const tokens = tokenize(code);
//    LOG(PP(tokens))
    const ast = parse(tokens);
//    LOG(PP(ast))
    const result = interpret(ast);
//    LOG(result)
}


if (args._.length != 1) {
    ERROR('Please provide one file name');
} else {
    berri(args);
}
/** 
 * TODO
 * 
 * 
 */