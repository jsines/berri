# Directory Structure

`bin/`

Contains output of typescript compilation.

`docs/`

Contains this documentation.

`examples/`

Contains examples of berri code. Files ran by `yarn berri <file>` must be located here (for now!)

`src/`

Contains berri intepreter, in Typescript. `berri-cli` contains `berri.ts`, `berri-lib` contains all modules used by `berri.ts`. 

`test/`

Contains unit tests, as well as integration tests. When integration tests are run, all cases within `test/cases/` get checked to ensure that

```js
tokenizer(x.case/raw) === x.case/tok
parser(x.case/tok) === x.case/ast
interpreter(x.case/ast) === x.case/out
```