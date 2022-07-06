<div align="center">
<h1>berri</h1>
[TOC](README.md)
<img src="https://img.shields.io/tokei/lines/github/jsines/berri">
</div>

# Directory Structure
`berri`

Starts berri in REPL mode

```sh
  berri [filename]
```

Runs berri on target file in the `examples/` directory.

```sh
  berri [filename] --save
```

Creates a new case file under `/test/cases/`. All cases are checked for accuracy as part of `/test/integration.test.ts`.