import { 
  ERROR,
  WARN,
  SUCCESS,
  LOG
} from "./logger.js";
import _ from 'lodash';

export interface Context {
  result: any;
  reserved: Record<string, any>;
  memory: Record<string, any>;
}
export const emptyContext: Context = Object.freeze({
  result: 0,
  reserved: {},
  memory: {}
});

export function addReserved(context: Context, identifier: string, value: any): Context {
  const newContext: Context = _.cloneDeep(context);
  newContext.reserved[identifier] = value;
  return newContext;
}
export function isReserved(context: Context, identifier: string): boolean {
  return context.reserved.hasOwnProperty(identifier);
}
export function getReserved(context: Context, identifier: string): any {
  if (!isReserved(context, identifier)) {
    ERROR(`Failed to get definition of '${identifier}' in given context: ${context}`);
  }
  return context.reserved[identifier];
}
export function addDefinition(context: Context, identifier: string, value: any): Context {
  if (isReserved(context, identifier)) {
    ERROR(`Tried to overwrite reserved identifier ${identifier}`);
  }
  const newContext: Context = _.cloneDeep(context)
  newContext.memory[identifier] = value;
  return newContext;
}
export function isDefined(context: Context, identifier: string): boolean {
  return context.memory.hasOwnProperty(identifier);
}
export function getDefinition(context: Context, identifier: string): any {
  return context.memory[identifier];
}
export function setResult(context: Context, value: any): Context {
  const newContext: Context = Object.assign({}, context);
  newContext.result = value;
  return newContext;
}
export function getResult(context: Context): any {
  return context.result;
}
