"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;
exports.parseBlock = parseBlock;
exports.parseStatement = parseStatement;

var _logger = require("./logger.js");

function parseToken(tokens, p) {
  let token = tokens[p];

  switch (token.type) {
    case 'parenOpen':
      return parseStatement(tokens, p);

    case 'bracketOpen':
      return parseArray(tokens, p);

    case 'braceOpen':
      return parseBlock(tokens, p);

    case 'number':
      return [1, {
        type: 'number',
        value: token.value
      }];

    case 'string':
      return [1, {
        type: 'string',
        value: token.value
      }];

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

    case 'math':
      return [1, {
        type: 'math',
        value: token.value
      }];

    case 'atSign':
      return parseFunction(tokens, p);
  }

  (0, _logger.ERROR)(`Parser: Unexpected token: ${(0, _logger.PP)(token)}`);
  return [0, {
    type: 'error',
    value: 'Something broke!'
  }];
}

function parseFunction(tokens, startIndex) {
  let [argumentConsumed, argumentNode] = parseArray(tokens, startIndex + 1);
  let [procedureConsumed, procedureNode] = parseBlock(tokens, startIndex + argumentConsumed + 1);
  return [argumentConsumed + procedureConsumed + 1, {
    type: 'function',
    value: [argumentNode, procedureNode]
  }];
}

function parseArray(tokens, startIndex) {
  let tokensConsumed = 1;
  let value = [];

  while (startIndex + tokensConsumed < tokens.length && tokens[startIndex + tokensConsumed].type != 'bracketClose') {
    let [consumed, astNode] = parseToken(tokens, startIndex + tokensConsumed);
    tokensConsumed += consumed;

    if (astNode) {
      value.push(astNode);
    }
  }

  if (startIndex + tokensConsumed === tokens.length) {
    (0, _logger.ERROR)(`Parser: Expected ']' Token ${startIndex + tokensConsumed}`);
  }

  return [tokensConsumed + 1, {
    type: 'array',
    value
  }];
}

function parseBlock(tokens, startIndex) {
  let tokensConsumed = 1;
  let value = [];

  while (startIndex + tokensConsumed < tokens.length && tokens[startIndex + tokensConsumed].type != 'braceClose') {
    let [consumed, astNode] = parseToken(tokens, startIndex + tokensConsumed);
    tokensConsumed += consumed;

    if (astNode) {
      value.push(astNode);
    }
  }

  if (startIndex + tokensConsumed === tokens.length) {
    (0, _logger.ERROR)(`Parser: Expected '}' Token ${startIndex + tokensConsumed}`);
  }

  return [tokensConsumed + 1, {
    type: 'block',
    value
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
    (0, _logger.ERROR)(`Parser: Expected ')' Token ${startIndex + tokensConsumed}`);
  }

  return [tokensConsumed + 1, {
    type: 'statement',
    value
  }];
}

function parse(tokens) {
  let p = 0;
  const ast = {
    type: 'block',
    value: []
  };

  while (p < tokens.length) {
    let [consumed, token] = parseToken(tokens, p);
    p += consumed;

    if (token) {
      ast.value.push(token);
    }
  }

  return ast;
}