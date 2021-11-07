# Changelog

### [0.17.0](https://github.com/grimmer0125/d4c-queue/compare/v0.16.0.1...v0.17.0) (2021-10-03)

- Remove image manipulation which may cause mac m1 installation failure, also it may be not needed in some use cases. 
- Add TypeScript and typing for parameters and return value.
- Use ES6 syntax: const/let, and class and `import` 
- Remove karma tests
- Building results can be used by `require (commonjs)` and es6 `import`, including TypeScript typing. Use https://github.com/bitjson/typescript-starter to build instead of grunt. Also, it ships with a main.js, and a  javascript  tree-shakable javascript module.
- Remove `expect.js` and use built-in chai test api (`expect().to.throw()`) instead.
- Fix rot90 missing ndim comparison bug, [commit](https://github.com/grimmer0125/numjs/pull/4/commits/dbf70845cbb784748fbc16d87bfb69b47053f7c2)
- Fix inspect log part using util.inspect.custom on Node.js
- Add Istanbul nyc coverage
- Use yarn stead
- Fix function return type, [commit](https://github.com/grimmer0125/numjs/pull/4/commits/d77f2a0788353f4680ec0befd3b974969d8524d2)