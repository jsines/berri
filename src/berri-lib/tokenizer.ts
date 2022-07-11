import { isReserved } from './context.js';
import { ERROR, WARN } from './logger.js'

export interface Token {
    type: string,
    value: string
}
type TokenizerResult = [consumed: number, token: Token | null];
type Tokenizer = (input: string, current: number) => TokenizerResult;

function tokenizeCharacter (type: string, value: string, input:string, current:number): TokenizerResult {
    return (value == input[current]) ? [1, {type, value}] : [0, null];
}
const reservedKeywords = [
    'def',
    'print',
    'true',
    'false',
    'if'
]
const charTokenizers: Tokenizer[] = [
    {type: "parenOpen", value: "("},
    {type: "parenClose", value: ")"},
    {type: "semi", value: ";"},
    {type: "bracketOpen", value: "["},
    {type: "bracketClose", value: "]"},
    {type: "braceOpen", value: "{"},
    {type: "braceClose", value: "}"},
    {type: "comma", value: ","},
    {type: "dot", value: "."},
    {type: "math", value: "="},
    {type: "math", value: "+"},
    {type: "math", value: "-"},
    {type: "math", value: "*"},
    {type: "math", value: "/"},
    {type: "math", value: ">"},
    {type: "math", value: "<"},
    {type: "math", value: "%"},
    {type: "math", value: "&"},
    {type: "math", value: "!"},
    {type: "math", value: "^"},
    {type: "math", value: "|"},
    {type: "atSign", value: "@"}
].map(token => 
    ((input: string, current: number) => tokenizeCharacter(token.type, token.value, input, current))
);
function tokenizePattern (type: string, pattern: RegExp, input: string, current: number): TokenizerResult {
    const matching = input.slice(current).match(pattern);
    if (matching) {
        const value = matching[0];
        if (reservedKeywords.includes(value)) {
            return [value.length, {type: 'reserved', value}]
        }
        return [value.length, {type, value}];
    }
    return [0, null];
}
const patternTokenizers : Tokenizer[] = [
    {type: "identifier", pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/},
    {type: "number", pattern: /^[+-]?(\d*\.)?\d+/},
].map(token =>
    (input: string, current: number) => tokenizePattern(token.type, token.pattern, input, current)
);

const tokenizeString = (input: string, current: number): TokenizerResult => {
    if (input[current] == '"') {
        let value = '';
        let consumed = 1;
        let char = input[current + consumed];
        while (char && char != '"') {
            value += char;
            consumed++;
            char = input[current + consumed];
        }
        return [consumed + 1, {type: "string", value}];
    }
    return [0, null];
}
const skipWhiteSpace: Tokenizer = (input: string, current: number): TokenizerResult => (/\s/.test(input[current])) ? [1, null] : [0, null]

const tokenizers: Tokenizer[] = [
    ...patternTokenizers,
    ...charTokenizers,
    skipWhiteSpace,
    tokenizeString,
]

export default function tokenize (code: string): Token[] { 
    let p = 0;
    let tokens: Token[] = [];
    while (p < code.length) {
        let tokenized = false;
        tokenizers.forEach(tokenizer => {
            if (tokenized) {return;}
            let [consumed, token] = tokenizer(code, p);
            if (consumed != 0) {
                tokenized = true;
                p+=consumed;
            }
            if(token){
                tokens.push(token);
            }
        });
        if (!tokenized) {
            ERROR(`Tokenizer: Unexpected character: ${code[p]}`);
        }
    }
    return tokens;
}