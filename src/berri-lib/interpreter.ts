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
function interpretConditional(params: ASTNode[], context: Context): any {
    for (let i = 0; i+1 < params.length; i+=2) {
        const conditionalContext = interpret(params[i], context);
        if (conditionalContext?.result) {
            return interpret(params[i+1], conditionalContext);
        } 
    }
    const hasElse = params.length % 2;
    if (hasElse) {
        return interpret(params[params.length-1], context)
    }
    return context  
}

function interpretWhile(params: ASTNode[], context: Context): any {
    let curContext = context;
    while (getResult(interpret(params[0], curContext))) {
        curContext = interpretBlock(params[1], curContext);
    }
    return curContext;
}

function interpretMap(params: ASTNode[], context: Context): Context {
    const callback = getResult(interpretFunction(params[1], context));
    
    return setResult(params[0].value.map((x) => {
        return getResult(callback([x], context));
    }), context);
}

function interpretReduce(params: ASTNode[], context: Context): Context {
    const callback = getResult(interpretFunction(params[1], context));
    return interpret(params[0].value.reduce((acc, cur) => {
        return {type: params[2].type, value: getResult(callback([acc, cur], context))}
    }, params[2]), context)
}

function interpretSum(params: ASTNode[], context: Context): Context {
    return interpretADD(params[0].value, context)
}
function interpretMath (comparisonFunction: (a: any, b: any) => any, shouldCoalesceResult: boolean = false ) {
    return function(params: ASTNode[], context: Context): Context {
        const firstTermContext = interpret(params[0], context);
        const mathArgumentNodes = params.slice(1);
        return shouldCoalesceResult ?
            setResult(context, mathArgumentNodes.reduce(
                (prevContext, currentNode) => {
                    const innerContext = interpret(currentNode, prevContext);
                    const newResult = comparisonFunction(getResult(prevContext), getResult(innerContext));
                    return setResult(innerContext, newResult);
                },
                firstTermContext
            ).result !== false) :
            mathArgumentNodes.reduce(
                (prevContext, currentNode) => {
                    const innerContext = interpret(currentNode, prevContext);
                    const newResult = comparisonFunction(getResult(prevContext), getResult(innerContext));
                    return setResult(innerContext, newResult);
                },
                firstTermContext
            );
    }
}
const interpretADD = interpretMath((a, b) => { return a+b; });
const interpretSUB = interpretMath((a, b) => { return a-b; });
const interpretMUL = interpretMath((a, b) => { return a*b; });
const interpretDIV = interpretMath((a, b) => { return a/b; });
const interpretNOT = (params, context) => {
    if (params.length === 1) {
        return setResult(context, !getResult(interpret(params[0], context)));
    }
    return setResult(context, !getResult(interpretOR(params, context)));// demorgans of !(!a & !b)
}
const interpretMOD = interpretMath((a, b) => { return ((a%b)+b)%b; });
const interpretAND = interpretMath((a, b) => { return a&&b; });
const interpretOR = interpretMath((a, b) => { return a||b; });
const interpretXOR = interpretMath((a, b) => { return a^b; });
const interpretEQUAL = interpretMath((a, b) => { return a === b;  })
// https://stackoverflow.com/a/53833345
const interpretLT = interpretMath((a, b) => { return a !== false && a < b && b; }, true);
// https://stackoverflow.com/a/53833345
const interpretGT = interpretMath((a, b) => { return a !== false && a > b && b; }, true);


function interpretBlock(node: ASTNode, context: Context): Context {
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
        case 'identifier':
            const identifierContext = interpretIdentifier(operand, context)
            if (params.length > 0)
                return getResult(identifierContext)(params, identifierContext);
            else
                return getResult(identifierContext)
        case 'math':
            switch (operand.value) {
                case '+':
                    return interpretADD(params, context);
                case '-':
                    return interpretSUB(params, context);
                case '*':
                    return interpretMUL(params, context);
                case '/':
                    return interpretDIV(params, context);
                case '!':
                    return interpretNOT(params, context);
                case '%':
                    return interpretMOD(params, context);
                case '&':
                    return interpretAND(params, context);
                case '|':
                    return interpretOR (params, context);
                case '^':
                    return interpretXOR(params, context);
                case '=':
                    return interpretEQUAL(params, context);
                case '<':
                    return interpretLT(params, context);
                case '>':
                    return interpretGT(params, context);
            }
        case 'statement': 
            // statement as operand must evaluate to function
            const statementContext = interpretStatement(operand, context);
            return getResult(statementContext)(params, statementContext);
        case 'function':
            const functionContext = interpretFunction(operand, context);
            return getResult(functionContext)(params, functionContext)
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
        return setResult(functionContext, getResult(interpretBlock(node.value[1], localContext)))
    }
    return setResult(context, evalFunction);
}

function interpretReserved(node: ASTNode, context: Context): Context {
    return setResult(context, getReserved(context, node.value));
}
function interpretIdentifier(node: ASTNode, context: Context): Context {
    if (!isDefined(context, node.value)){
        ERROR(`Interpreter: Failed to get interpret identifier ${node.value}`)
        return context;
    }
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

export default function interpret(arg: ASTNode, context: Context = emptyContext): Context {
    if(_.isEqual(context.reserved, {})) {
        context = setReserved(context);
    }
    switch(arg.type) {
        case 'block':
            return interpretBlock(arg, context);
        case 'statement':
            return interpretStatement(arg, context);
        case 'reserved':
            return interpretReserved(arg, context);
        case 'identifier':
            return interpretIdentifier(arg, context);
        case 'number':
            return setResult(context, Number(arg.value));
        case 'string':
            return setResult(context, arg.value);
        case 'function':
            return interpretFunction(arg, context);
        case 'array':
            return interpretArray(arg, context);
        default:
    }
    ERROR(`Interpreter: Failed to interpret ${PP(arg)}`);
    return emptyContext;
}

function setReserved (context: Context): Context {
    let newContext = addReserved(context, 'def', interpretDefinition);
    newContext = addReserved(newContext, 'print', interpretPrint);
    newContext = addReserved(newContext, 'true', true);
    newContext = addReserved(newContext, 'false', false);
    newContext = addReserved(newContext, 'if', interpretConditional);
    newContext = addReserved(newContext, 'while', interpretWhile);
    newContext = addReserved(newContext, 'map', interpretMap);
    newContext = addReserved(newContext, 'reduce', interpretReduce);
    newContext = addReserved(newContext, 'sum', interpretSum);
    return newContext;
}