<div align="center">
<h1>berri</h1>
<a href="./README.md">TOC</a><br />
<img src="https://img.shields.io/tokei/lines/github/jsines/berri">
</div>

# Directory Structure

```sh
  berri
```

Starts berri in REPL mode

```sh
  yarn berri [filename]
```

Runs berri on target file in the `examples/` directory.

```sh
  yarn berri [filename] --save
```

Creates a new case file under `/test/cases/`. All cases are checked for accuracy as part of `/test/integration.test.ts`.

```sh
  yarn build
```

Compiles TypeScript in `src/`to JavaScript in `bin/`

```sh
  yarn berri-c
```

Shorthand for `yarn build && yarn berri`

```sh
  yarn test
```

Runs unit tests as well as integration tests. Integration test definition can be found in `test/integration.test.ts`, runs test on every case found in `test/cases`