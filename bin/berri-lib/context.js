import { ERROR } from "./logger.js";
export var emptyContext = {
    result: 0,
    reserved: {},
    memory: {}
};
export function addReserved(context, identifier, value) {
    var newContext = Object.assign({}, context);
    newContext.reserved[identifier] = value;
    return newContext;
}
export function isReserved(context, identifier) {
    return context.reserved.hasOwnProperty(identifier);
}
export function getReserved(context, identifier) {
    if (!isReserved(context, identifier)) {
        ERROR("Failed to get definition of '".concat(identifier, "' in given context: ").concat(context));
    }
    return context.reserved[identifier];
}
export function addDefinition(context, identifier, value) {
    var newContext = Object.assign({}, context);
    newContext.memory[identifier] = value;
    return newContext;
}
export function isDefined(context, identifier) {
    return context.memory.hasOwnProperty(identifier);
}
export function getDefinition(context, identifier) {
    if (!isDefined(context, identifier)) {
        ERROR("Failed to get definition of '".concat(identifier, "' in given context: ").concat(context));
    }
    return context.memory[identifier];
}
export function setResult(context, value) {
    var newContext = Object.assign({}, context);
    newContext.result = value;
    return newContext;
}
export function getResult(context) {
    return context.result;
}
