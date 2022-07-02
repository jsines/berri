import { LOG } from "./logger.js";
import { ERROR, PP } from "./logger.js";
import { Token } from "./tokenizer.js";

export interface ASTNode {
    type: string,
    params: (ASTNode|ASTLeaf)[]
}
export interface ASTLeaf {
    type: string,
    value: string
}
type ParserResult = [consumed: number, element: ASTNode | ASTLeaf];

function parseToken (tokens: Token[], p: number): ParserResult  {
    let token: Token = tokens[p];
    if (token.type == 'parenOpen') {
        return parseStatement(tokens, p);
    } else if (token.type == 'number') {
        return [1, {type: 'number', value: token.value}];
    } else if (token.type == 'string') {
        return [1, {type: 'string', value: token.value}];
    } else if (token.type == 'identifier') {
        return [1, {type: 'identifier', value: token.value}];
    } else if (token.type == 'math') {
        return [1, {type: 'math', value: token.value}]
    }
    ERROR(`unexpected token: ${PP(token)}`);
    return [0, {type: 'error', value: 'Something broke!'}];
}

function parseStatement (tokens: Token[], p: number): ParserResult {
    let tokensConsumed = 1;
    let params: (ASTNode|ASTLeaf)[] = [];
    while (p + tokensConsumed < tokens.length && tokens[p + tokensConsumed].type != 'parenClose') {
        let [consumed, token] = parseToken(tokens, p + tokensConsumed);
        tokensConsumed += consumed;
        if (token) {
            params.push(token);
        }
    }
    return [p + tokensConsumed + 1, { type: 'statement', params }];
}

export default function parse (tokens: Token[]): ASTNode {
    let p = 0;
    const ast: ASTNode = {
        type: 'statements',
        params: []
    };
    while (p < tokens.length) {
        let token: ASTNode | ASTLeaf;
        [p, token] = parseToken(tokens, p);
        if (token) {
            ast.params.push(token);
        }
    }
    return ast;
}