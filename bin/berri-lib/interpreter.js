import { ERROR, PP, PRINT } from './logger.js';
import { emptyContext, addReserved, isReserved, getReserved, addDefinition, isDefined, getDefinition, setResult, getResult } from './context.js';
function interpretDefinition(params, context) {
    if (params.length != 2) {
        ERROR("Incorrect number of arguments for definition. Expected: 2, Received: ".concat(params.length));
    }
    else if (params[0].type != 'identifier') {
        ERROR("Tried to write a definition to a non-identifier ".concat(params[0], "!"));
    }
    else if (isLeaf(params[0])) {
        if (isReserved(context, params[0].value)) {
            ERROR("Tried to overwrite a reserved identifier ".concat(params[0]));
        }
        return addDefinition(context, params[0].value, interpret(params[1]));
    }
    ERROR("Tried to define to an ASTNode: ".concat(params[0]));
    return emptyContext;
}
function interpretPrint(params, context) {
    if (params.length > 1) {
        ERROR("Tried to print too many params! Expected: 1, Received: ".concat(params.length));
    }
    var newContext = interpret(params[0], context);
    PRINT(getResult(newContext));
    return newContext;
}
function interpretStatements(node, context) {
    return node.params.reduce(function (previousContext, currentStatement) {
        return interpret(currentStatement, previousContext);
    }, context);
}
function interpretStatement(statement, context) {
    var operand = statement.params[0];
    var params = statement.params.splice(1);
    if (isLeaf(operand) && operand.type === 'identifier') {
        var op = operand.value;
        if (isReserved(context, op)) {
            var opFunction = getReserved(context, op);
            var newContext = opFunction(params, context);
            return setResult(newContext, getResult(context));
        }
        else if (isDefined(context, op)) {
            return setResult(context, getDefinition(context, op));
        }
    }
    ERROR("Failed to interpret statement ".concat(PP(statement), " in context ").concat(PP(context)));
    return emptyContext;
}
function interpretIdentifier(leaf, context) {
    return setResult(context, getDefinition(context, leaf.value));
}
function isNode(x) {
    return x.params !== undefined;
}
function isLeaf(x) {
    return x.value !== undefined;
}
export function interpret(arg, context) {
    if (context === void 0) { context = setReserved(emptyContext); }
    if (isNode(arg)) {
        switch (arg.type) {
            case 'statements':
                return interpretStatements(arg, context);
                break;
            case 'statement':
                return interpretStatement(arg, context);
                break;
            default:
                break;
        }
    }
    else {
        switch (arg.type) {
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
    ERROR("Failed to interpret ".concat(arg));
    return emptyContext;
}
function setReserved(context) {
    context = addReserved(context, 'def', interpretDefinition);
    context = addReserved(context, 'print', interpretPrint);
    return context;
}
