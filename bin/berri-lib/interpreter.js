"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = interpret;

var _logger = require("./logger.js");

var _context = require("./context.js");

function interpretDefinition(params, context) {
  if (params.length != 2) {
    (0, _logger.ERROR)(`Interpreter: Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
  } else if (params[0].type != 'identifier') {
    (0, _logger.ERROR)(`Interpreter: Tried to write a definition to a non-identifier ${params[0]}!`);
  } else if (typeof params[0].value === 'string') {
    const newContext = interpret(params[1], context);
    return (0, _context.addDefinition)(newContext, params[0].value, (0, _context.getResult)(newContext));
  }

  (0, _logger.ERROR)(`Interpreter: Tried to define to an array of nodes: ${params[0]}`);
  return _context.emptyContext;
}

function interpretPrint(params, context) {
  if (params.length > 1) {
    (0, _logger.ERROR)(`Interpreter: Tried to print too many params! Expected: 1, Received: ${params.length}`);
  }

  const newContext = interpret(params[0], context);
  (0, _logger.PRINT)((0, _context.getResult)(newContext));
  return newContext;
}

function interpretStatements(node, context) {
  return node.value.reduce((previousContext, currentStatement) => {
    return interpret(currentStatement, previousContext);
  }, context);
}

function interpretStatement(statement, context) {
  const operand = statement.value[0];
  const params = statement.value.slice(1);
  let newContext;

  switch (operand.type) {
    case 'reserved':
      newContext = interpretReserved(operand, context);
      return (0, _context.getResult)(newContext)(params, newContext);
      break;

    case 'identifier':
      newContext = interpretIdentifier(operand, context);
      return (0, _context.getResult)(newContext)(params, newContext);
      break;

    case 'math':
      const first = interpret(params[0], context);
      const rest = params.slice(1);
      const operations = {
        "+": (a, b) => {
          return a + b;
        },
        "-": (a, b) => {
          return a - b;
        },
        "*": (a, b) => {
          return a * b;
        },
        "/": (a, b) => {
          return a / b;
        }
      };
      newContext = rest.reduce((prevContext, currentNode) => {
        const innerContext = interpret(currentNode, prevContext);
        const newResult = operations[operand.value]((0, _context.getResult)(prevContext), (0, _context.getResult)(innerContext));
        return (0, _context.setResult)(innerContext, newResult);
      }, first);
      return newContext;
      break;
  }

  (0, _logger.ERROR)(`Interpreter: Failed to interpret statement ${(0, _logger.PP)(statement)} in context ${(0, _logger.PP)(context)}`);
  return _context.emptyContext;
}

function interpretReserved(node, context) {
  return (0, _context.setResult)(context, (0, _context.getReserved)(context, node.value));
}

function interpretIdentifier(node, context) {
  if (!(0, _context.isDefined)(context, node.value)) (0, _logger.ERROR)(`Interpreter: Failed to get interpret identifier ${node.value}`);
  return (0, _context.setResult)(context, (0, _context.getDefinition)(context, node.value));
}

function interpret(arg, context = setReserved(_context.emptyContext)) {
  switch (arg.type) {
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
      return (0, _context.setResult)(context, Number(arg.value));
      break;

    case 'string':
      return (0, _context.setResult)(context, arg.value);
      break;

    default:
      break;
  }

  (0, _logger.ERROR)(`Interpreter: Failed to interpret ${(0, _logger.PP)(arg)}`);
  return _context.emptyContext;
}

function setReserved(context) {
  context = (0, _context.addReserved)(context, 'def', interpretDefinition);
  context = (0, _context.addReserved)(context, 'print', interpretPrint);
  return context;
}