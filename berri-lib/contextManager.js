const { 
  ERROR,
  WARN,
  SUCCESS,
  LOG,
  PP,
  PRINT
} = require('../berri-lib/logger.js');

const emptyContext = {
  result: undefined,
  reserved: {},
  memory: {}
}

function addReserved(context, identifier, value) {
  context.reserved[identifier] = value;
  return context;
}
function isReserved(context, identifier)  {
  return context.reserved.hasOwnProperty(identifier);
}
function getReserved(context, identifier) {
  if (!isReserved(context, identifier)) {
    ERROR(`Failed to get definition of '${identifier}' in given context: ${context}`);
  }
  return context.reserved[identifier];
}
function addDefinition(context, identifier, value) {
  context.memory[identifier] = value;
  return context;
}
function isDefined(context, identifier) {
  return context.memory.hasOwnProperty(identifier);
}
function getDefinition(context, identifier) {
  if (!isDefined(context, identifier)) {
    ERROR(`Failed to get definition of '${identifier}' in given context: ${context}`);
  }
  return context.memory[identifier];
}
function setResult(context, value) {
  context.result = value;
  return context;
}
function getResult(context){
  return context.result;
}

module.exports = {
  emptyContext,
  addReserved,
  isReserved,
  getReserved,
  addDefinition,
  isDefined,
  getDefinition,
  setResult,
  getResult
}