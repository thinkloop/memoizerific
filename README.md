# Memoize-lru.js
Fastest (see benchmarks), smallest (780b), most-efficient, dependency-free, JavaScript (JS) memoization lib. 
Uses JavaScript [Map]([https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), compatible with: Chrome 38+, Firefox 13+, IE11+, Safari 7.1+, Opera 25+.
Fully supports complex object arguments. 
Implements LRU (least recently used) logic to keep the most recently used results purging the oldest result (when needed). 
Works in the browser as well as node.

Memoization is the process of caching function results to be returned cheaply when the same arguments are used to call it again. 

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
There is one option available, the max number of results to cache. 
The cache works using LRU logic (least recently used), purging the oldest results when the limit is reached.
In the above example, the cache is limited to a size of 50. 
When the 51st unique combination of arguments is passed in, the least recently used combination of arguments is purged.

We can also limit the cache to a size of 1:

```javascript
var myExpensiveFunctionMemoized = memoizerific(1)(function(arg1, arg2, arg3, arg4) {
    // so many long expensive calls in here
});

myExpensiveFunctionMemoized(1, 2, 3, 4); // function is fully invoked
myExpensiveFunctionMemoized(1, 2, 3, 4); // fast cached result is returned
myExpensiveFunctionMemoized(1, 2, 3, 'X'); // function is fully invoked, new result is saved in cache, old cached result is purged
myExpensiveFunctionMemoized(1, 2, 3, 'X'); // fast new cached result is returned
myExpensiveFunctionMemoized(1, 2, 3, 4); // function is fully invoked again

```
We can also have an unlimited cache size (not recommended):
```javascript
var myExpensiveFunctionMemoized = memoizerific(0)(function(arg1, arg2, arg3) {
    // so many long expensive calls in here
});
```
## Benchmarks

This library was built with real-world use-cases in mind, so the standard one-argument fibonacci test case will not be used. 
Instead we test with multiple complex arguments like this:
```javascript
myExpensiveFunctionMemoized({ a: 1, b: 2}, [{ x: 'x', q: 'q', }, { b: 8, c: 9 }], { z: 'z' }, ...);

```

Here are results against some of the top libraries:
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