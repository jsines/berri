"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDefinition = addDefinition;
exports.addReserved = addReserved;
exports.emptyContext = void 0;
exports.getDefinition = getDefinition;
exports.getReserved = getReserved;
exports.getResult = getResult;
exports.isDefined = isDefined;
exports.isReserved = isReserved;
exports.setResult = setResult;

var _logger = require("./logger.js");

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const emptyContext = Object.freeze({
  result: 0,
  reserved: {},
  memory: {}
});
exports.emptyContext = emptyContext;

function addReserved(context, identifier, value) {
  const newContext = _lodash.default.cloneDeep(context);

  newContext.reserved[identifier] = value;
  return newContext;
}

function isReserved(context, identifier) {
  return context.reserved.hasOwnProperty(identifier);
}

function getReserved(context, identifier) {
  if (!isReserved(context, identifier)) {
    (0, _logger.ERROR)(`Failed to get definition of '${identifier}' in given context: ${context}`);
  }

  return context.reserved[identifier];
}

function addDefinition(context, identifier, value) {
  if (isReserved(context, identifier)) {
    (0, _logger.ERROR)(`Tried to overwrite reserved identifier ${identifier}`);
  }

  const newContext = _lodash.default.cloneDeep(context);

  newContext.memory[identifier] = value;
  return newContext;
}

function isDefined(context, identifier) {
  return context.memory.hasOwnProperty(identifier);
}

function getDefinition(context, identifier) {
  return context.memory[identifier];
}

function setResult(context, value) {
  const newContext = Object.assign({}, context);
  newContext.result = value;
  return newContext;
}

function getResult(context) {
  return context.result;
}