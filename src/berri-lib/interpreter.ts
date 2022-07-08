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
import _ from 'lodash';

function interpretDefinition(params: ASTNode[], context: Context): Context {
    if (params.length != 2) {
        ERROR(`Interpreter: Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
    } else if (params[0].type != 'identifier') {
        ERROR(`Interpreter: Tried to write a definition to a non-identifier ${params[0]}!`);
    } else if (typeof(params[0].value) === 'string'){
        const newContext = interpret(params[1], context);
        return setResult(addDefinition(newContext, params[0].value, getResult(newContext)), params[0].value);
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
    switch(operand.type) {
        case 'reserved':
            const reservedContext = interpretReserved(operand, context);
            return getResult(reservedContext)(params, reservedContext);
            break;
        case 'identifier':
            const identifierContext = interpretIdentifier(operand, context)
            if (params.length > 0)
                return getResult(identifierContext)(params, identifierContext);
            else
                return getResult(identifierContext)
            break;
        case 'math':
            const mathContext = interpret(params[0], context);
            const mathArgumentNodes = params.slice(1);
            
            const operationsRecord = {
                "+": (a,b) => {return a+b},
                "-": (a,b) => {return a-b},
                "*": (a,b) => {return a*b},
                "/": (a,b) => {return a/b}
            };
            const newContext = mathArgumentNodes.reduce(
                (prevContext, currentNode) => {
                    const innerContext = interpret(currentNode, prevContext);
                    const newResult = operationsRecord[operand.value](getResult(prevContext), getResult(innerContext));
                    return setResult(innerContext, newResult);
                },
                mathContext
            )
            return newContext;
            break;
        case 'statement': 
            // statement as operand must evaluate to function
            const statementContext = interpretStatement(operand, context);
            return getResult(statementContext)(params, statementContext);
            break;
        case 'function':
            const functionContext = interpretFunction(operand, context);
            return getResult(functionContext)(params, functionContext)
            break;
    }
    ERROR(`Interpreter: Failed to interpret statement ${PP(statement)} in context ${PP(context)}`);
    return emptyContext;
}
function interpretFunction(node: ASTNode, context: Context): Context {
    const evalFunction = (functionParameters: ASTNode[], functionContext: Context): Context => {
        let localContext = Object.assign({}, functionContext)
        if (functionParameters.length !== node.value[0].value.length) {
            ERROR(`Incorrect number of parameters for function`);
        }
        node.value[0].value.forEach(
            (astNode, i) => {
                localContext = addDefinition(localContext, astNode.value, getResult(interpret(functionParameters[i])));
            } 
        )
        return setResult(functionContext, getResult(interpretStatements(node.value[1], localContext)))
    }
    return setResult(context, evalFunction);
}

function interpretReserved(node: ASTNode, context: Context): Context {
    return setResult(context, getReserved(context, node.value));
}
function interpretIdentifier(node: ASTNode, context: Context): Context {
    if (!isDefined(context, node.value))
        ERROR(`Interpreter: Failed to get interpret identifier ${node.value}`)
    return setResult(context, getDefinition(context, node.value))
}
function interpretArray(node: ASTNode, context: Context): Context {
    let res: any[] = [];
    node.value.reduce((prevContext, currentNode) => {
        let newContext = interpret(currentNode, prevContext);
        res.push(getResult(newContext))
        return newContext;
    }, context) 
    return setResult(context, res);
}

export default function interpret(arg: ASTNode, context: Context = emptyContext): any {
    if(_.isEqual(context.reserved, {})) {
        context = setReserved(context);
    }
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
        case 'function':
            return interpretFunction(arg, context);
            break;
        case 'array':
            return interpretArray(arg, context);
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