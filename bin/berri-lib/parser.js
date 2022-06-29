import { ERROR } from "./logger.js";
function parseToken(tokens, p) {
    var token = tokens[p];
    if (token.type == 'parenOpen') {
        return parseStatement(tokens, p);
    }
    else if (token.type == 'number') {
        return [1, { type: 'number', value: token.value }];
    }
    else if (token.type == 'string') {
        return [1, { type: 'string', value: token.value }];
    }
    else if (token.type == 'identifier') {
        return [1, { type: 'identifier', value: token.value }];
    }
    ERROR("unexpected token: ".concat(token));
    return [0, { type: 'error', value: 'Something broke!' }];
}
function parseStatement(tokens, p) {
    var tokensConsumed = 1;
    var params = [];
    while (p + tokensConsumed < tokens.length && tokens[p + tokensConsumed].type != 'parenClose') {
        var _a = parseToken(tokens, p + tokensConsumed), consumed = _a[0], token = _a[1];
        tokensConsumed += consumed;
        if (token) {
            params.push(token);
        }
    }
    return [p + tokensConsumed + 1, { type: 'statement', params: params }];
}
export function parse(tokens) {
    var _a;
    var p = 0;
    var ast = {
        type: 'statements',
        params: []
    };
    while (p < tokens.length) {
        var token = void 0;
        _a = parseToken(tokens, p), p = _a[0], token = _a[1];
        if (token) {
            ast.params.push(token);
        }
    }
    return ast;
}
