"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _readline = require("readline");

const rl = (0, _readline.createInterface)({
  input: process.stdin,
  output: process.stdout
});

const question = questionText => new Promise(resolve => rl.question(questionText, resolve)).finally(() => rl.close());

var _default = question;
exports.default = _default;