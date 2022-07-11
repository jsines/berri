import tokenize from '../bin/berri-lib/tokenizer.js';
import parse from '../bin/berri-lib/parser.js';
import interpret from '../bin/berri-lib/interpreter.js';
import _ from 'lodash';
import fs from 'fs';
import { LOG, WARN } from '../bin/berri-lib/logger.js';

function memEq (c1, c2) {
  const c1Mem = Object.keys(c1.memory).filter(x => typeof(c1.memory[x]) !== 'function');
  const c2Mem = Object.keys(c2.memory).filter(x => typeof(c2.memory[x]) !== 'function');;
  return c1Mem.length === c2Mem.length && 
    c1Mem.length === _.union(c1Mem, c2Mem).length && 
    c1Mem.every((val) => {
      return typeof(c1.memory[val]) === typeof(c2.memory[val]) &&
        _.isEqual(c1.memory[val], c2.memory[val])
    })
}

const contextEquals = (contextA, contextB) => {
  return _.isEqual(contextA.result, contextB.result) && memEq(contextA, contextB);
}

const casesFolder = './test/cases';
describe('integration', () => {
  fs.readdirSync(casesFolder).map((x) => {
    const filePath = `${casesFolder}/${x}`;
    return [
      filePath,
      fs.readFileSync(`${filePath}/raw`, 'utf8'),
      JSON.parse(fs.readFileSync(`${filePath}/tok`, 'utf8')),
      JSON.parse(fs.readFileSync(`${filePath}/ast`, 'utf8')),
      JSON.parse(fs.readFileSync(`${filePath}/out`, 'utf8'))
    ]
  }).forEach(([name, raw, tok, ast, out]) => {
    it(name, () => {
      expect(tokenize(raw)).toStrictEqual(tok);
      expect(parse(tok)).toStrictEqual(ast);
      //expect(interpret(ast)).toBe(out)  
      expect(contextEquals(interpret(ast), out)).toBe(true);
    })
  });
});