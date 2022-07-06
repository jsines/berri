"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = berri;
exports.saveTestCase = saveTestCase;

var _yargs = _interopRequireDefault(require("yargs"));

var _fs = _interopRequireDefault(require("fs"));

var _tokenizer = _interopRequireDefault(require("../berri-lib/tokenizer.js"));

var _parser = _interopRequireDefault(require("../berri-lib/parser.js"));

var _interpreter = _interopRequireDefault(require("../berri-lib/interpreter.js"));

var _logger = require("../berri-lib/logger.js");

var _context = require("../berri-lib/context.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const args = (0, _yargs.default)(process.argv.slice(2)).parseSync();
const testCaseDir = './test/cases';
const readDir = 'examples';

function saveTestCase(fileName, code, tokens, ast, out) {
  if (!_fs.default.existsSync(testCaseDir)) {
    _fs.default.mkdirSync(testCaseDir);
  }

  const caseDir = `${testCaseDir}/${fileName.slice(0, -4)}.case`;
  if (!_fs.default.existsSync(caseDir)) _fs.default.mkdirSync(caseDir);

  _fs.default.writeFileSync(`${caseDir}/raw`, code);

  _fs.default.writeFileSync(`${caseDir}/tok`, (0, _logger.PP)(tokens));

  _fs.default.writeFileSync(`${caseDir}/ast`, (0, _logger.PP)(ast));

  _fs.default.writeFileSync(`${caseDir}/out`, (0, _logger.PP)(out));
}
/**
 * In debug, returns resultant (Debug). 
 * When not, returns resultant (Context)
 */


function berri(code, context = _context.emptyContext, debug = false) {
  const tokens = (0, _tokenizer.default)(code); //LOG(tokens)

  const ast = (0, _parser.default)(tokens); //LOG(ast)

  const out = (0, _interpreter.default)(ast, context); //LOG(out)

  if (debug) {
    return [tokens, ast, out];
  } else {
    return out;
  }
}

if (args._.length > 1) {
  (0, _logger.ERROR)('Please provide one file name');
} else if (args._.length === 1) {
  const fileName = `${readDir}/${args._[0]}`;

  const code = _fs.default.readFileSync(fileName, 'utf8');

  const [tokens, ast, out] = berri(code, _context.emptyContext, true);

  if (typeof args._['save'] !== undefined) {
    try {
      saveTestCase(args._[0], code, tokens, ast, out);
    } catch (e) {
      (0, _logger.ERROR)(e);
    }
  }
} else {
  let currentContext = Object.assign({}, _context.emptyContext);
  var stdin = process.openStdin();
  (0, _logger.PRINT)('berri repl v1.0.0');
  stdin.addListener("data", d => {
    currentContext = berri(d.toString().trim(), currentContext);
    (0, _logger.PRINT)(currentContext.result);
  });
}