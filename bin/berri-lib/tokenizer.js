var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function tokenizeCharacter(type, value, input, current) {
    return (value == input[current]) ? [1, { type: type, value: value }] : [0, null];
}
var charTokenizers = [
    { type: "parenOpen", value: "(" },
    { type: "parenClose", value: ")" },
    { type: "equal", value: "=" },
    { type: "semi", value: ";" },
    { type: "gt", value: ">" },
    { type: "lt", value: "<" },
    { type: "braketOpen", value: "[" },
    { type: "braketClose", value: "]" },
    { type: "braceOpen", value: "{" },
    { type: "braceClose", value: "}" },
    { type: "comma", value: "," },
    { type: "dot", value: "." },
].map(function (token) {
    return (function (input, current) { return tokenizeCharacter(token.type, token.value, input, current); });
});
function tokenizePattern(type, pattern, input, current) {
    var char = input[current];
    var consumed = 0;
    if (pattern.test(char)) {
        var value = '';
        while (char && pattern.test(char)) {
            value += char;
            consumed++;
            char = input[current + consumed];
        }
        return [consumed, { type: type, value: value }];
    }
    return [0, null];
}
var patternTokenizers = [
    { type: "identifier", pattern: /[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: "number", pattern: /[0-9]+/ },
].map(function (token) {
    return function (input, current) { return tokenizePattern(token.type, token.pattern, input, current); };
});
var tokenizeString = function (input, current) {
    if (input[current] == '"') {
        var value = '';
        var consumed = 1;
        var char = input[current + consumed];
        while (char && char != '"') {
            value += char;
            consumed++;
            char = input[current + consumed];
        }
        return [consumed + 1, { type: "string", value: value }];
    }
    return [0, null];
};
var skipWhiteSpace = function (input, current) { return (/\s/.test(input[current])) ? [1, null] : [0, null]; };
var tokenizers = __spreadArray(__spreadArray(__spreadArray([], charTokenizers, true), patternTokenizers, true), [
    skipWhiteSpace,
    tokenizeString,
], false);
export function tokenize(code) {
    var p = 0;
    var tokens = [];
    var _loop_1 = function () {
        var tokenized = false;
        tokenizers.forEach(function (tokenizer) {
            if (tokenized) {
                return;
            }
            var _a = tokenizer(code, p), consumed = _a[0], token = _a[1];
            if (consumed != 0) {
                tokenized = true;
                p += consumed;
            }
            if (token) {
                tokens.push(token);
            }
        });
        if (!tokenized) {
            console.log("[ERROR]", "Unexpected character: ".concat(code[p]));
        }
    };
    while (p < code.length) {
        _loop_1();
    }
    return tokens;
}
