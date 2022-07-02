"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _logger = require("./logger.js");

function parseToken(tokens, p) {
  let token = tokens[p];

  if (token.type == 'parenOpen') {
    return parseStatement(tokens, p);
  } else if (token.type == 'number') {
    return [1, {
      type: 'number',
      value: token.value
    }];
  } else if (token.type == 'string') {
    return [1, {
      type: 'string',
      value: token.value
    }];
  } else if (token.type == 'identifier') {
    return [1, {
      type: 'identifier',
      value: token.value
    }];
  } else if (token.type == 'math') {
    return [1, {
      type: 'math',
      value: token.value
    }];
  }

  (0, _logger.ERROR)(`unexpected token: ${(0, _logger.PP)(token)}`);
  return [0, {
    type: 'error',
    value: 'Something broke!'
  }];
}

function parseStatement(tokens, p) {
  let tokensConsumed = 1;
  let params = [];

  while (p + tokensConsumed < tokens.length && tokens[p + tokensConsumed].type != 'parenClose') {
    let [consumed, token] = parseToken(tokens, p + tokensConsumed);
    tokensConsumed += consumed;

    if (token) {
      params.push(token);
    }
  }

  return [p + tokensConsumed + 1, {
    type: 'statement',
    params
  }];
}

function parse(tokens) {
  let p = 0;
  const ast = {
    type: 'statements',
    params: []
  };

  while (p < tokens.length) {
    let token;
    [p, token] = parseToken(tokens, p);

    if (token) {
      ast.params.push(token);
    }
  }

  return ast;
}