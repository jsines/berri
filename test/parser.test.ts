import tokenize from '../bin/berri-lib/tokenizer.js';
import { 
  ParserResult, 
  ASTNode, 
  parseStatement } from '../bin/berri-lib/parser.js'
import _ from 'lodash'


describe('parser', () => {
  test('parseStatement', () => {
    const res: ParserResult = parseStatement(tokenize('(+ 2 2)'), 0)[1];
    expect(_.isEqual(res, {
      "type": "statement",
      "value": [
        {
          "type": "math", 
          "value": "+"
        }, 
        {
          "type": "number", 
          "value": "2"
        }, 
        {"type": "number", 
        "value": "2"
      }]
    })).toBe(true);
  })
});
