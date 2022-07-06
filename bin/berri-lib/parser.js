"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;
exports.parseStatement = parseStatement;

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

function parseStatement(tokens, startIndex) {
  let tokensConsumed = 1;
  let value = [];

  while (startIndex + tokensConsumed < tokens.length && tokens[startIndex + tokensConsumed].type != 'parenClose') {
    let [consumed, astNode] = parseToken(tokens, startIndex + tokensConsumed);
    tokensConsumed += consumed;

    if (astNode) {
      value.push(astNode);
    }
  }

  if (startIndex + tokensConsumed === tokens.length) {
    (0, _logger.ERROR)(`Parser: Expected ')'`);
  }

  return [tokensConsumed + 1, {
    type: 'statement',
    value
  }];
}

function parse(tokens) {
  let p = 0;
  let consumed;
  const ast = {
    type: 'statements',
    value: []
  };

  while (p < tokens.length) {
    let token;
    [consumed, token] = parseToken(tokens, p);
    p += consumed;

    if (token) {
      ast.value.push(token);
    }
  }

  return ast;
}