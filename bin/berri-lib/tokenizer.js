"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tokenize;

var _logger = require("./logger.js");

function tokenizeCharacter(type, value, input, current) {
  return value == input[current] ? [1, {
    type,
    value
  }] : [0, null];
}

const reservedKeywords = ['def', 'print'];
const charTokenizers = [{
  type: "parenOpen",
  value: "("
}, {
  type: "parenClose",
  value: ")"
}, {
  type: "equal",
  value: "="
}, {
  type: "semi",
  value: ";"
}, {
  type: "braketOpen",
  value: "["
}, {
  type: "braketClose",
  value: "]"
}, {
  type: "braceOpen",
  value: "{"
}, {
  type: "braceClose",
  value: "}"
}, {
  type: "comma",
  value: ","
}, {
  type: "dot",
  value: "."
}, {
  type: "math",
  value: "+"
}, {
  type: "math",
  value: "-"
}, {
  type: "math",
  value: "*"
}, {
  type: "math",
  value: "/"
}, {
  type: "math",
  value: ">"
}, {
  type: "math",
  value: "<"
}].map(token => (input, current) => tokenizeCharacter(token.type, token.value, input, current));

function tokenizePattern(type, pattern, input, current) {
  let char = input[current];
  let consumed = 0;

  if (pattern.test(char)) {
    let value = '';

    while (char && pattern.test(char)) {
      value += char;
      consumed++;
      char = input[current + consumed];
    }

    if (reservedKeywords.includes(value)) {
      return [consumed, {
        type: 'reserved',
        value
      }];
    }

    return [consumed, {
      type,
      value
    }];
  }

  return [0, null];
}

const patternTokenizers = [{
  type: "identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}, {
  type: "number",
  pattern: /[0-9]+/
}].map(token => (input, current) => tokenizePattern(token.type, token.pattern, input, current));

const tokenizeString = (input, current) => {
  if (input[current] == '"') {
    let value = '';
    let consumed = 1;
    let char = input[current + consumed];

    while (char && char != '"') {
      value += char;
      consumed++;
      char = input[current + consumed];
    }

    return [consumed + 1, {
      type: "string",
      value
    }];
  }

  return [0, null];
};

const skipWhiteSpace = (input, current) => /\s/.test(input[current]) ? [1, null] : [0, null];

const tokenizers = [...charTokenizers, ...patternTokenizers, skipWhiteSpace, tokenizeString];

function tokenize(code) {
  let p = 0;
  let tokens = [];

  while (p < code.length) {
    let tokenized = false;
    tokenizers.forEach(tokenizer => {
      if (tokenized) {
        return;
      }

      let [consumed, token] = tokenizer(code, p);

      if (consumed != 0) {
        tokenized = true;
        p += consumed;
      }

      if (token) {
        tokens.push(token);
      }
    });

    if (!tokenized) {
      (0, _logger.ERROR)(`Tokenizer: Unexpected character: ${code[p]}`);
    }
  }

  return tokens;
}