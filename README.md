# Memoizerific.js
Fastest (see benchmarks), smallest (923b min/gzip), most-efficient, dependency-free, JavaScript (JS) lib to memoize functions.
Fully supports multiple complex object arguments. 
Implements LRU (least recently used) cache to keep the most recently used results up to the provided limit. 
For the browser as well as node.

Memoization is the process of caching function results to be returned cheaply when the same arguments are used to call the function again. 

## Install
```javascript
npm install memoizerific --save
```

## Use
```javascript
var memoizerific = require('memoizerific');

var myExpensiveFunctionMemoized = memoizerific(50)(function(arg1, arg2, arg3) {
    // so many long expensive calls in here
});

myExpensiveFunction(1, 2, 3); // damn, that took looooong to process
myExpensiveFunction(1, 2, 3); // wow, that one was instant!
myExpensiveFunction(2, 3, 4); // expensive again :(
myExpensiveFunction(2, 3, 4); // woah, this one was dirt cheap, I'll take 2!
```

## Options
There is one option available: the max number of results to cache. 
```javascript
memoizerific(limit)(fn);

memoizerific(1)(function(){}); // cache 1 result
memoizerific(10000)(function(){}); // cache 10,000 results
memoizerific(0)(function(){}); // cache infinity results (not recommended)
```
The cache works using LRU logic (least recently used), purging the oldest results when the limit is reached.

```javascript
// memoize 1 result
var myMemoized = memoizerific(1)(function(arg1, arg2, arg3, arg4) {});

myMemoized(1, 2, 3, 'a'); // function runs
myMemoized(1, 2, 3, 'a'); // cached result is returned
myMemoized(1, 2, 3, 'X'); // function runs again, new result is cached, old cached result is purged
myMemoized(1, 2, 3, 'X'); // new cached result is returned
myMemoized(1, 2, 3, 'a'); // function runs again...
```
## Benchmarks

This library was built for real-world use-cases, we will not be using the easy one-argument fibonacci test commonly used for memoization.
Instead we will test with multiple complex arguments, that look something like this:
```javascript
myMemoized(
    { a: 1, b: 2}, // complex object argument
    [{ x: 'x', q: 'q', }, { b: 8, c: 9 }], // array argument
    { z: 'z' }, 
    ...
);

```

We generate a list of varying numbers of complex arguments (1 to 8 arguments), with varying degrees of variance, to increase and decrease cache hits and misses, 
then run each memoization lib through them, timing the results. 
For full details see the source at the [memoize-js-libs-benchmarks](https://github.com/thinkloop/memoize-js-libs-benchmarks) project.

Here are results of some top projects:
```
// low variance, mostly cache hits:

no memoization: 
memoizerific:
lodash:
erikras:
neilk:

// medium variance, lots of cache hits:

no memoization: 
memoizerific:
lodash:
erikras:
neilk:

// high variance, few cache hits:

no memoization: 
memoizerific:
lodash:
erikras:
neilk: