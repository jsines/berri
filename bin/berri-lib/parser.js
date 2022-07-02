"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _logger = require("./logger.js");

function parseToken(tokens, p) {
  let token = tokens[p];

  switch (token.type) {
    case 'parenOpen':
      return parseStatement(tokens, p);
      break;

    case 'number':
      return [1, {
        type: 'number',
        value: token.value
      }];
      break;

    case 'string':
      return [1, {
        type: 'string',
        value: token.value
      }];
      break;

    case 'reserved':
      return [1, {
        type: 'reserved',
        value: token.value
      }];

    case 'identifier':
      return [1, {
        type: 'identifier',
        value: token.value
      }];
      break;

    case 'math':
      return [1, {
        type: 'math',
        value: token.value
      }];
      break;
  }

  (0, _logger.ERROR)(`Parser: Unexpected token: ${(0, _logger.PP)(token)}`);
  return [0, {
    type: 'error',
    value: 'Something broke!'
  }];
}

function parseStatement(tokens, p) {
  let tokensConsumed = 1;
  let value = [];

  while (p + tokensConsumed < tokens.length && tokens[p + tokensConsumed].type != 'parenClose') {
    let [consumed, astNode] = parseToken(tokens, p + tokensConsumed);
    tokensConsumed += consumed;

    if (astNode) {
      value.push(astNode);
    }
  }

  return [p + tokensConsumed + 1, {
    type: 'statement',
    value
  }];
}

function parse(tokens) {
  let p = 0;
  const ast = {
    type: 'statements',
    value: []
  };

  while (p < tokens.length) {
    let token;
    [p, token] = parseToken(tokens, p);

    if (token) {
      ast.value.push(token);
    }
  }

  return ast;
}