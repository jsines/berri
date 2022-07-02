"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = interpret;

var _logger = require("./logger.js");

var _context = require("./context.js");

function interpretDefinition(params, context) {
  if (params.length != 2) {
    (0, _logger.ERROR)(`Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
  } else if (params[0].type != 'identifier') {
    (0, _logger.ERROR)(`Tried to write a definition to a non-identifier ${params[0]}!`);
  } else if (isLeaf(params[0])) {
    if ((0, _context.isReserved)(context, params[0].value)) {
      (0, _logger.ERROR)(`Tried to overwrite a reserved identifier ${params[0]}`);
    }

    return (0, _context.addDefinition)(context, params[0].value, interpret(params[1]));
  }

  (0, _logger.ERROR)(`Tried to define to an ASTNode: ${params[0]}`);
  return _context.emptyContext;
}

function interpretPrint(params, context) {
  if (params.length > 1) {
    (0, _logger.ERROR)(`Tried to print too many params! Expected: 1, Received: ${params.length}`);
  }

  const newContext = interpret(params[0], context);
  (0, _logger.PRINT)((0, _context.getResult)(newContext));
  return newContext;
}

function interpretStatements(node, context) {
  return node.params.reduce((previousContext, currentStatement) => {
    return interpret(currentStatement, previousContext);
  }, context);
}

function interpretStatement(statement, context) {
  const operand = statement.params[0];
  const params = statement.params.slice(1);

  if (isLeaf(operand) && operand.type === 'identifier') {
    const op = operand.value;

    if ((0, _context.isReserved)(context, op)) {
      const opFunction = (0, _context.getReserved)(context, op);
      const newContext = opFunction(params, context);
      return (0, _context.setResult)(newContext, (0, _context.getResult)(context));
    } else if ((0, _context.isDefined)(context, op)) {
      return (0, _context.setResult)(context, (0, _context.getDefinition)(context, op));
    }
  } else if (isLeaf(operand) && operand.type === 'math') {
    const rest = params.slice(1);
    let res;

    switch (operand.value) {
      case "+":
        res = params.reduce((prev, cur) => prev + (0, _context.getResult)(interpret(cur, context)), 0);
        break;

      case "-":
        res = rest.reduce((prev, cur) => prev - (0, _context.getResult)(interpret(cur, context)), (0, _context.getResult)(interpret(params[0], context)));
        break;

      case "*":
        res = params.reduce((prev, cur) => prev * (0, _context.getResult)(interpret(cur, context)), 1);
        break;

      case "/":
        res = rest.reduce((prev, cur) => prev / (0, _context.getResult)(interpret(cur, context)), (0, _context.getResult)(interpret(params[0], context)));
        break;
    }

    return (0, _context.setResult)(context, res);
  }

  (0, _logger.ERROR)(`Failed to interpret statement ${(0, _logger.PP)(statement)} in context ${(0, _logger.PP)(context)}`);
  return _context.emptyContext;
}

function interpretIdentifier(leaf, context) {
  return (0, _context.setResult)(context, (0, _context.getDefinition)(context, leaf.value));
}

function isNode(x) {
  return x.params !== undefined;
}

function isLeaf(x) {
  return x.value !== undefined;
}

function interpret(arg, context = setReserved(_context.emptyContext)) {
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
  } else {
    switch (arg.type) {
      case 'identifier':
        return interpretIdentifier(arg, context);
        break;

      case 'number':
        return (0, _context.setResult)(context, Number(arg.value));
        break;

      case 'string':
        return (0, _context.setResult)(context, arg.value);
        break;

      default:
        break;
    }
  }

  (0, _logger.ERROR)(`Failed to interpret ${arg}`);
  return _context.emptyContext;
}

function setReserved(context) {
  context = (0, _context.addReserved)(context, 'def', interpretDefinition);
  context = (0, _context.addReserved)(context, 'print', interpretPrint);
  return context;
}