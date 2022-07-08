"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WARN = exports.SUCCESS = exports.PRINT = exports.PP = exports.LOG = exports.ERROR = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isPrimitive(x) {
  return typeof x == 'number' || typeof x == 'string' || typeof x == 'boolean';
}

function generateLogger(colorFunction, prefix, shouldThrow = false) {
  return x => {
    if (Array.isArray(x)) {
      console.log(colorFunction(prefix, ...x.map(value => isPrimitive(value) ? value : PP(value))));
    } else if (shouldThrow) {
      throw colorFunction(prefix, isPrimitive(x) ? x : PP(x));
    } else {
      console.log(colorFunction(prefix, isPrimitive(x) ? x : PP(x)));
    }
  };
}

const ERROR = generateLogger(_chalk.default.red, '|🍓|', true);
exports.ERROR = ERROR;
const WARN = generateLogger(_chalk.default.yellow, '|🍋|');
exports.WARN = WARN;
const SUCCESS = generateLogger(_chalk.default.green, '|🍏|');
exports.SUCCESS = SUCCESS;
const LOG = generateLogger(_chalk.default.blue, '|🫐|');
exports.LOG = LOG;
const PRINT = generateLogger(_chalk.default.magenta, '|🍇|');
exports.PRINT = PRINT;

const PP = x => {
  return JSON.stringify(x, null, 2);
};

exports.PP = PP;

const verboseFunction = (key, val) => {
  if (typeof val === 'function' || val && val.constructor === RegExp) {
    return String(val);
  }

  return val;
};