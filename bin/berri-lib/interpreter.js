"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = interpret;

var _logger = require("./logger.js");

var _context = require("./context.js");

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function interpretDefinition(params, context) {
  if (params.length != 2) {
    (0, _logger.ERROR)(`Interpreter: Incorrect number of arguments for definition. Expected: 2, Received: ${params.length}`);
  } else if (params[0].type != 'identifier') {
    (0, _logger.ERROR)(`Interpreter: Tried to write a definition to a non-identifier ${params[0]}!`);
  } else if (typeof params[0].value === 'string') {
    const newContext = interpret(params[1], context);
    return (0, _context.setResult)((0, _context.addDefinition)(newContext, params[0].value, (0, _context.getResult)(newContext)), params[0].value);
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

  switch (operand.type) {
    case 'reserved':
      const reservedContext = interpretReserved(operand, context);
      return (0, _context.getResult)(reservedContext)(params, reservedContext);
      break;

    case 'identifier':
      const identifierContext = interpretIdentifier(operand, context);
      if (params.length > 0) return (0, _context.getResult)(identifierContext)(params, identifierContext);else return (0, _context.getResult)(identifierContext);
      break;

    case 'math':
      const mathContext = interpret(params[0], context);
      const mathArgumentNodes = params.slice(1);
      const operationsRecord = {
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
      const newContext = mathArgumentNodes.reduce((prevContext, currentNode) => {
        const innerContext = interpret(currentNode, prevContext);
        const newResult = operationsRecord[operand.value]((0, _context.getResult)(prevContext), (0, _context.getResult)(innerContext));
        return (0, _context.setResult)(innerContext, newResult);
      }, mathContext);
      return newContext;
      break;

    case 'statement':
      // statement as operand must evaluate to function
      const statementContext = interpretStatement(operand, context);
      return (0, _context.getResult)(statementContext)(params, statementContext);
      break;

    case 'function':
      const functionContext = interpretFunction(operand, context);
      return (0, _context.getResult)(functionContext)(params, functionContext);
      break;
  }

  (0, _logger.ERROR)(`Interpreter: Failed to interpret statement ${(0, _logger.PP)(statement)} in context ${(0, _logger.PP)(context)}`);
  return _context.emptyContext;
}

function interpretFunction(node, context) {
  const evalFunction = (functionParameters, functionContext) => {
    let localContext = Object.assign({}, functionContext);

    if (functionParameters.length !== node.value[0].value.length) {
      (0, _logger.ERROR)(`Incorrect number of parameters for function`);
    }

    node.value[0].value.forEach((astNode, i) => {
      localContext = (0, _context.addDefinition)(localContext, astNode.value, (0, _context.getResult)(interpret(functionParameters[i])));
    });
    return (0, _context.setResult)(functionContext, (0, _context.getResult)(interpretStatements(node.value[1], localContext)));
  };

  return (0, _context.setResult)(context, evalFunction);
}

function interpretReserved(node, context) {
  return (0, _context.setResult)(context, (0, _context.getReserved)(context, node.value));
}

function interpretIdentifier(node, context) {
  if (!(0, _context.isDefined)(context, node.value)) (0, _logger.ERROR)(`Interpreter: Failed to get interpret identifier ${node.value}`);
  return (0, _context.setResult)(context, (0, _context.getDefinition)(context, node.value));
}

function interpretArray(node, context) {
  let res = [];
  node.value.reduce((prevContext, currentNode) => {
    let newContext = interpret(currentNode, prevContext);
    res.push((0, _context.getResult)(newContext));
    return newContext;
  }, context);
  return (0, _context.setResult)(context, res);
}

function interpret(arg, context = _context.emptyContext) {
  if (_lodash.default.isEqual(context.reserved, {})) {
    context = setReserved(context);
  }

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

    case 'function':
      return interpretFunction(arg, context);
      break;

    case 'array':
      return interpretArray(arg, context);

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