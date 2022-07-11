<div align="center">
<h1>berri</h1>
<a href="./README.md">TOC</a><br />
<img src="https://img.shields.io/tokei/lines/github/jsines/berri">
</div>

Statements in berri are wrapped in parenthesis.

`(print "Hello world!")`
>`"Hello world!"`

All operators are prefixed to their operands.

`(+ 2 2)`
>`4`

Statements can be nested within one another.

`(/ (* 71 5) (+ (* 4 25) 13))`
>`3.1415929203539825`

Variables are dynamically typed (for now?).

`(def testVar (+ 3 5))`
`testVar`
>`8`

Conditionals

```
  (if
    (= var 5) {
      (+ var 1)
    }
    (= var 6) {
      (- var 1)
    }
    {
      (var)
    }
  )
```

Lambda functions can be declared and assigned to a variable. Lambda functions are of the form `@[Array of arguments]{Block of statements}`

```
(def myFunction @[x y z]{
  (print (+ x y z))
})
(print (myFunction 1 2 3))
```
>`6`

