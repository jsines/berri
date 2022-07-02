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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const testCaseDir = './test/cases';
const readDir = 'examples';

function saveTestCase(fileName, code, tokens, ast, result) {
  if (!_fs.default.existsSync(testCaseDir)) {
    _fs.default.mkdirSync(testCaseDir);
  }

  const caseDir = `${testCaseDir}/${fileName.slice(0, -4)}.case`;
  if (!_fs.default.existsSync(caseDir)) _fs.default.mkdirSync(caseDir);

  _fs.default.writeFileSync(`${caseDir}/raw`, code);

  _fs.default.writeFileSync(`${caseDir}/tok`, (0, _logger.PP)(tokens));

  _fs.default.writeFileSync(`${caseDir}/ast`, (0, _logger.PP)(ast));

  _fs.default.writeFileSync(`${caseDir}/out`, (0, _logger.PP)(result));
}

function berri(args) {
  const fileName = `${readDir}/${args._[0]}`;

  const code = _fs.default.readFileSync(fileName, 'utf8');

  const tokens = (0, _tokenizer.default)(code);
  const ast = (0, _parser.default)(tokens);
  const result = (0, _interpreter.default)(ast);

  if (typeof args._['save'] !== undefined) {
    try {
      saveTestCase(args._[0], code, tokens, ast, result);
    } catch (e) {
      (0, _logger.ERROR)(e);
    }
  }
}

const args = (0, _yargs.default)(process.argv.slice(2)).parseSync();

if (args._.length != 1) {
  (0, _logger.ERROR)('Please provide one file name');
} else {
  berri(args);
}