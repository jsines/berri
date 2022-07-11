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

const reservedKeywords = ['def', 'print', 'true', 'false', 'if'];
const charTokenizers = [{
  type: "parenOpen",
  value: "("
}, {
  type: "parenClose",
  value: ")"
}, {
  type: "semi",
  value: ";"
}, {
  type: "bracketOpen",
  value: "["
}, {
  type: "bracketClose",
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
  value: "="
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
}, {
  type: "math",
  value: "%"
}, {
  type: "math",
  value: "&"
}, {
  type: "math",
  value: "!"
}, {
  type: "math",
  value: "^"
}, {
  type: "math",
  value: "|"
}, {
  type: "atSign",
  value: "@"
}].map(token => (input, current) => tokenizeCharacter(token.type, token.value, input, current));

function tokenizePattern(type, pattern, input, current) {
  const matching = input.slice(current).match(pattern);

  if (matching) {
    const value = matching[0];

    if (reservedKeywords.includes(value)) {
      return [value.length, {
        type: 'reserved',
        value
      }];
    }

    return [value.length, {
      type,
      value
    }];
  }

  return [0, null];
}

const patternTokenizers = [{
  type: "identifier",
  pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/
}, {
  type: "number",
  pattern: /^[+-]?(\d*\.)?\d+/
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

const tokenizers = [...patternTokenizers, ...charTokenizers, skipWhiteSpace, tokenizeString];

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