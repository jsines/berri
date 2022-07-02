import tokenize from '../bin/berri-lib/tokenizer.js';
import parse from '../bin/berri-lib/parser.js';
import interpret from '../bin/berri-lib/interpreter.js';
import _ from 'lodash';
import fs from 'fs';

const contextEquals = (contextA, contextB) => {
  return (contextA.result === contextB.result) && (_.isEqual(contextA.memory,contextB.memory));
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
      expect(contextEquals(interpret(ast), out)).toBe(true);
    })
  });
});