const { 
    ERROR,
    WARN,
    SUCCESS,
    LOG,
    PP,
    PRINT
} = require('./logger.js');
const { 
    emptyContext,
    addReserved,
    isReserved,
    getReserved,
    addDefinition,
    isDefined,
    getDefinition,
    setResult,
    getResult
} = require('./contextManager.js');

/*
*   Takes in a statement and context, returns resultant context
*/
function interpretDefinition(params, context) {
    if (params.length != 2) {
        ERROR(`Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
    } else if (params[0].type != 'identifier') {
        ERROR(`Tried to write a definition to a non-identifier ${params[0]}!`);
    } else if (isReserved(context, params[0].value)) {
        ERROR(`Tried to overwrite a reserved identifier ${params[0]}`);
    }
    return addDefinition(context, params[0].value, interpret(params[1]));
}
function interpretPrint(params, context) {
    if (params.length > 1) {
        ERROR(`Tried to print too many params! Expected: 1, Received: ${params.length}`);
    }
    context = interpret(params[0], context);
    PRINT(getResult(context));
    return context;
}
/*
*   Takes in a statement and context, returns resultant context
*/
function interpretStatement(statement, context){
    const operand = statement.params[0];
    const params = statement.params.splice(1);
    if (operand.type != 'identifier') {
        ERROR(`Tried to interpret statement with operand type ${operand.type}`);
    }
    const op = operand.value;
    if (isReserved(context, op)) {
        return setResult(context, getReserved(context, op)(params, context));
    } else if (isDefined(context, op)) {
        return setResult(context, getDefinition(context, op));
    }
    return;
}

function interpretIdentifier(value, context) {
    return setResult(context, getDefinition(context, value))
}

function interpret(arg, context = setReserved(emptyContext)){
    switch (arg.type){
        case 'statements':
            return arg.params.reduce(
                (prev, cur) => {
                    return interpretStatement(cur, prev);
                },
                context
            );
            break;
        case 'statement':
            return interpretStatement(arg.params, context);
            break;
        case 'identifier':
            return interpretIdentifier(arg.value, context);
            break;
        case 'number':
            return arg.value;
            break;
        default:
            break;
    }
}

function setReserved (context) {
    context = addReserved(context, 'def', interpretDefinition);
    context = addReserved(context, 'print', interpretPrint);
    return context;
}

module.exports = {
    interpret,
}