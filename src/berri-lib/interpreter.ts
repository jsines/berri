import { 
    ERROR,
    WARN,
    SUCCESS,
    PP,
    PRINT
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
import {
    ASTNode, ASTLeaf
} from './parser.js';

type ReservedInterpreter = (params: any, context: Context) => Context;

function interpretDefinition(params: (ASTNode|ASTLeaf)[], context: Context): Context {
    if (params.length != 2) {
        ERROR(`Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
    } else if (params[0].type != 'identifier') {
        ERROR(`Tried to write a definition to a non-identifier ${params[0]}!`);
    } else if (isLeaf(params[0])){
        if (isReserved(context, params[0].value)) {
            ERROR(`Tried to overwrite a reserved identifier ${params[0]}`);
        }
        return addDefinition(context, params[0].value, interpret(params[1]));
    }
    ERROR(`Tried to define to an ASTNode: ${params[0]}`);
    return emptyContext;
}

function interpretPrint(params: (ASTNode|ASTLeaf)[], context: Context): Context {
    if (params.length > 1) {
        ERROR(`Tried to print too many params! Expected: 1, Received: ${params.length}`);
    }
    const newContext: Context = interpret(params[0], context);
    PRINT(getResult(newContext));
    return newContext;
}

function interpretStatements(node: ASTNode, context: Context): Context {
    return node.params.reduce(
        (previousContext, currentStatement) => {
            return interpret(currentStatement, previousContext);
        },
        context
    );
}

function interpretStatement(statement: ASTNode, context: Context): Context {
    const operand: ASTNode | ASTLeaf = statement.params[0];
    const params: (ASTNode | ASTLeaf)[] = statement.params.splice(1);
    if (isLeaf(operand) && operand.type === 'identifier') {
        const op: string = operand.value;
        if (isReserved(context, op)) {
            const opFunction: ReservedInterpreter = getReserved(context, op);
            const newContext: Context = opFunction(params, context);
            return setResult(newContext, getResult(context));
        } else if (isDefined(context, op)) {
            return setResult(context, getDefinition(context, op));
        }
    }
    ERROR(`Failed to interpret statement ${PP(statement)} in context ${PP(context)}`);
    return emptyContext;
}

function interpretIdentifier(leaf: ASTLeaf, context: Context): Context {
    return setResult(context, getDefinition(context, leaf.value))
}

function isNode(x: ASTNode | ASTLeaf): x is ASTNode {
    return (x as ASTNode).params !== undefined;
}
function isLeaf(x: ASTNode | ASTLeaf): x is ASTLeaf {
    return (x as ASTLeaf).value !== undefined;
}
export function interpret(arg: (ASTNode | ASTLeaf), context: Context = setReserved(emptyContext)): any {
    if (isNode(arg)){
        switch(arg.type) {
            case 'statements':
                return interpretStatements(arg, context);
                break;
            case 'statement':
                return interpretStatement(arg, context);
                break;
            default:
                break;
        }
    } else {
        switch(arg.type) {
            case 'identifier':
                return interpretIdentifier(arg, context);
                break;
            case 'number':
                return arg.value;
                break;
            case 'string':
                return arg.value;
                break;
            default:
                break;
        }
    }
    ERROR(`Failed to interpret ${arg}`);
    return emptyContext;
}

function setReserved (context: Context): Context {
    context = addReserved(context, 'def', interpretDefinition);
    context = addReserved(context, 'print', interpretPrint);
    return context;
}