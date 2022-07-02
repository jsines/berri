import { 
    ERROR,
    WARN,
    SUCCESS,
    PP,
    PRINT,
    LOG
} from './logger.js';
import {
    Context,
    emptyContext,
    addReserved,
    isReserved,
    getReserved,
    addDefinition,
    isDefined,
    getDefinition,
    setResult,
    getResult
} from './context.js';
import { ASTNode } from './parser.js';

function interpretDefinition(params: ASTNode[], context: Context): Context {
    if (params.length != 2) {
        ERROR(`Interpreter: Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
    } else if (params[0].type != 'identifier') {
        ERROR(`Interpreter: Tried to write a definition to a non-identifier ${params[0]}!`);
    } else if (typeof(params[0].value) === 'string'){
        const newContext = interpret(params[1], context);
        return addDefinition(newContext, params[0].value, getResult(newContext));
    }
    ERROR(`Interpreter: Tried to define to an array of nodes: ${params[0]}`);
    return emptyContext;
}

function interpretPrint(params: ASTNode[], context: Context): Context {
    if (params.length > 1) {
        ERROR(`Interpreter: Tried to print too many params! Expected: 1, Received: ${params.length}`);
    }
    const newContext: Context = interpret(params[0], context);
    PRINT(getResult(newContext));
    return newContext;
}

function interpretStatements(node: ASTNode, context: Context): Context {
    return node.value.reduce(
        (previousContext, currentStatement) => {
            return interpret(currentStatement, previousContext);
        },
        context
    );
}

function interpretStatement(statement: ASTNode, context: Context): Context {
    const operand: ASTNode = statement.value[0];
    const params: ASTNode[] = statement.value.slice(1);
    let newContext;
    switch(operand.type) {
        case 'reserved':
            newContext = interpretReserved(operand, context);
            return getResult(newContext)(params, newContext);
            break;
        case 'identifier':
            newContext = interpretIdentifier(operand, context)
            return getResult(newContext)(params, newContext);
            break;
        case 'math':
            const first = interpret(params[0], context);
            const rest = params.slice(1);
            
            const operations = {
                "+": (a,b) => {return a+b},
                "-": (a,b) => {return a-b},
                "*": (a,b) => {return a*b},
                "/": (a,b) => {return a/b}
            };
            newContext = rest.reduce(
                (prevContext, currentNode) => {
                    const innerContext = interpret(currentNode, prevContext);
                    const newResult = operations[operand.value](getResult(prevContext), getResult(innerContext));
                    return setResult(innerContext, newResult);
                },
                first
            )
            return newContext;
            break;
    }
    ERROR(`Interpreter: Failed to interpret statement ${PP(statement)} in context ${PP(context)}`);
    return emptyContext;
}
function interpretReserved(node: ASTNode, context: Context): Context {
    return setResult(context, getReserved(context, node.value));
}
function interpretIdentifier(node: ASTNode, context: Context): Context {
    if (!isDefined(context, node.value))
        ERROR(`Interpreter: Failed to get interpret identifier ${node.value}`)
    return setResult(context, getDefinition(context, node.value))
}

export default function interpret(arg: ASTNode, context: Context = setReserved(emptyContext)): any {
    switch(arg.type) {
        case 'statements':
            return interpretStatements(arg, context);
            break;
        case 'statement':
            return interpretStatement(arg, context);
            break;
        case 'reserved':
            return interpretReserved(arg, context);
            break;
        case 'identifier':
            return interpretIdentifier(arg, context);
            break;
        case 'number':
            return setResult(context, Number(arg.value));
            break;
        case 'string':
            return setResult(context, arg.value);
            break;
        default:
            break;
    }
    ERROR(`Interpreter: Failed to interpret ${PP(arg)}`);
    return emptyContext;
}

function setReserved (context: Context): Context {
    context = addReserved(context, 'def', interpretDefinition);
    context = addReserved(context, 'print', interpretPrint);
    return context;
}