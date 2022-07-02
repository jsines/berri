import { LOG } from "./logger.js";
import { ERROR, PP } from "./logger.js";
import { Token } from "./tokenizer.js";

export interface ASTNode {
    type: string,
    value: any
}

type ParserResult = [consumed: number, element: ASTNode];

function parseToken (tokens: Token[], p: number): ParserResult  {
    let token: Token = tokens[p];
    switch (token.type) {
        case 'parenOpen':
            return parseStatement(tokens, p);
            break;
        case 'number':
            return [1, {type: 'number', value: token.value}];
            break;
        case 'string': 
            return [1, {type: 'string', value: token.value}];
            break;
        case 'reserved':
            return [1, {type: 'reserved', value: token.value}];
        case 'identifier': 
            return [1, {type: 'identifier', value: token.value}];
            break;
        case 'math':
            return [1, {type: 'math', value: token.value}];
            break;
    }
    ERROR(`Parser: Unexpected token: ${PP(token)}`);
    return [0, {type: 'error', value: 'Something broke!'}];
}

function parseStatement (tokens: Token[], p: number): ParserResult {
    let tokensConsumed = 1;
    let value: ASTNode[] = [];
    while (p + tokensConsumed < tokens.length && tokens[p + tokensConsumed].type != 'parenClose') {
        let [consumed, astNode] = parseToken(tokens, p + tokensConsumed);
        tokensConsumed += consumed;
        if (astNode) {
            value.push(astNode);
        }
    }
    return [p + tokensConsumed + 1, { type: 'statement', value }];
}

export default function parse (tokens: Token[]): ASTNode {
    let p = 0;
    const ast: ASTNode = {
        type: 'statements',
        value: []
    };
    while (p < tokens.length) {
        let token: ASTNode;
        [p, token] = parseToken(tokens, p);
        if (token) {
            ast.value.push(token);
        }
    }
    return ast;
}