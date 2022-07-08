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
        case 'atSign':
            return parseFunction(tokens, p);
            break;
        case 'bracketOpen':
            return parseArray(tokens, p);
            break;
    }
    ERROR(`Parser: Unexpected token: ${PP(token)}`);
    return [0, {type: 'error', value: 'Something broke!'}];
}

function parseFunction(tokens: Token[], startIndex: number): ParserResult {
    let [argumentConsumed, argumentNode] = parseArray(tokens, startIndex+1);
    let [procedureConsumed, procedureNode] = parseStatements(tokens, startIndex+argumentConsumed+1);
    return [argumentConsumed+procedureConsumed+1, {
        type: 'function',
        value: [
            argumentNode,
            procedureNode
        ]
    }]
}

function parseArray(tokens: Token[], startIndex: number): ParserResult {
    let tokensConsumed = 1;
    let value: ASTNode[] = [];
    while (startIndex + tokensConsumed < tokens.length && tokens[startIndex + tokensConsumed].type != 'bracketClose') {
        let [consumed, astNode] = parseToken(tokens, startIndex + tokensConsumed);
        tokensConsumed += consumed;
        if (astNode) {
            value.push(astNode);
        }
    }
    if (startIndex + tokensConsumed === tokens.length) {
        ERROR(`Parser: Expected ']' Token ${startIndex + tokensConsumed}`);
    }
    return [tokensConsumed + 1, { type: 'array', value }]
}
export function parseStatements (tokens: Token[], startIndex: number): ParserResult {
    let tokensConsumed = 1;
    let value: ASTNode[] = [];
    while (startIndex + tokensConsumed < tokens.length && tokens[startIndex + tokensConsumed].type != 'parenClose') {
        let [consumed, astNode] = parseToken(tokens, startIndex + tokensConsumed);
        tokensConsumed += consumed;
        if (astNode) {
            value.push(astNode);
        }
    }
    if (startIndex + tokensConsumed === tokens.length) {
        ERROR(`Parser: Expected ')' Token ${startIndex + tokensConsumed}`);
    }
    return [tokensConsumed+1, { type: 'statements', value }];
}
export function parseStatement (tokens: Token[], startIndex: number): ParserResult {
    let tokensConsumed = 1;
    let value: ASTNode[] = [];
    while (startIndex + tokensConsumed < tokens.length && tokens[startIndex + tokensConsumed].type != 'parenClose') {
        let [consumed, astNode] = parseToken(tokens, startIndex + tokensConsumed);
        tokensConsumed += consumed;
        if (astNode) {
            value.push(astNode);
        }
    }
    if (startIndex+tokensConsumed === tokens.length) {
        ERROR(`Parser: Expected ')' Token ${startIndex + tokensConsumed}`);
    }
    return [tokensConsumed+1, { type: 'statement', value }];
}

export default function parse (tokens: Token[]): ASTNode {
    let p = 0;
    const ast: ASTNode = {
        type: 'statements',
        value: []
    };
    while (p < tokens.length) {
        let [consumed, token] = parseToken(tokens, p);
        p+=consumed;
        if (token) {
            ast.value.push(token);
        }
    }
    return ast;
}