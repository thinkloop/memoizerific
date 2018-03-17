# Memoizerific.js
[![Build Status](https://travis-ci.org/thinkloop/memoizerific.svg?branch=master)](https://travis-ci.org/thinkloop/memoizerific)

Fast (see benchmarks), small (1k min/gzip), efficient, JavaScript memoization lib to memoize JS functions.

Uses JavaScript's new [Map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object for instant lookups, or a [performant polyfill](https://github.com/thinkloop/map-or-similar) if Map is not available - does not do expensive serialization or string manipulation.

Supports multiple complex arguments.
Includes least-recently-used (LRU) caching to maintain only the most recent specified number of results.

Compatible with the browser and nodejs.

Memoization is the process of caching function results so that they may be returned cheaply
without re-execution if the function is called again using the same arguments.
This is especially useful with the rise of [redux] (https://github.com/rackt/redux),
and the push to calculate all derived data on the fly instead of maintaining it in state.

## Install
Add to your project directly from npm:

```
npm install memoizerific --save
```

Or use one of the compiled distributions compatible in any environment (UMD):

- [memoizerific.js](https://raw.githubusercontent.com/thinkloop/memoizerific/master/memoizerific.js)
- [memoizerific.min.js](https://raw.githubusercontent.com/thinkloop/memoizerific/master/memoizerific.min.js) (minified)
- [memoizerific.min.gzip.js](https://github.com/thinkloop/memoizerific/raw/master/memoizerific.min.gzip.js) (minified + gzipped)


## Quick Start
```javascript
var memoizerific = require('memoizerific');

var memoized = memoizerific(50)(function(arg1, arg2, arg3) {
    // many long expensive calls here
});

memoized(1, 2, 3); // that took long to process
memoized(1, 2, 3); // this one was instant!

memoized(2, 3, 4); // expensive again :(
memoized(2, 3, 4); // this one was cheap!
```
Or with complex arguments:
```javascript
var complexArg1 = { a: { b: { c: 99 }}}, // hairy nested object
    complexArg2 = [{ z: 1}, { q: [{ x: 3 }]}], // objects within arrays within arrays
    complexArg3 = new Map([['d', 55],['e', 66]]), // new Map object
    complexArg4 = new Set(); // new Set object

memoized(complexArg1, complexArg2, complexArg3, complexArg4); // slow
memoized(complexArg1, complexArg2, complexArg3, complexArg4); // instant!
```

## Arguments
There are two arguments:

`limit (required):` the max number of items to cache before least recently used items are removed.

`fn (required):` the function to memoize.


```javascript
memoizerific(limit)(fn);

memoizerific(1)(function(arg1){}); // memoize the last result for a given argument
memoizerific(10000)(function(arg1, arg2){}); // memoize the last 10,000 unique argument combinations
memoizerific(0)(function(arg1){}); // memoize infinity results (not recommended)
```
The cache works using LRU logic, purging the least recently used results when the limit is reached.
For example:

```javascript
// memoize 1 result
var myMemoized = memoizerific(1)(function(arg1) {});

myMemoized(1); // function runs, result is cached
myMemoized(1); // cached result is returned
myMemoized(2); // function runs again, new result is cached, old cached result is purged
myMemoized(2); // new cached result is returned
myMemoized(1); // function runs again...
```

## Equality
Arguments are compared using strict equality, while taking into account small edge cases like NaN !== NaN.
A complex object will only trigger a cache hit if it refers to the exact same object in memory,
not just another object that has similar properties.
For example, the following code will not produce a cache hit even though the objects look the same:

```javascript
var myMemoized = memoizerific(1)(function(arg1) {});

myMemoized({ a: true });
myMemoized({ a: true }); // not cached, runs again

```

This is because a new object is being created on each invocation, rather than the same object being passed in.

A common scenario where this may appear is when providing options to functions, such as: `ajax(url, opts)`,  where `opts` is an object of options.

Typically this would be called with an inline object like this: `ajax('https://domain.com', {timeout: 10000})`.

If that function were memoized, it would not hit the cache because the `opts` object would be different each time.

There are several ways to _fix_ this:

#### Wrapper Function
Wrap your function in a higher-level function that does pre-processing:

```javascript
// memoize ajax() with wrapper function
var callAjax = memoizerific(1)(function(domain, timeout) {
  return ajax(domain, {timeout: timeout});
});

callAjax('http://domain.com', 10000);
callAjax('http://domain.com', 10000); // cache hit
```

#### Store Arguments
Store arguments that need to be reused later on:

```javascript
// memoize ajax() (signature of ajax(url, opts))
var callAjax = memoizerific(1)(ajax);

// store the argument
var opts = { timeout: 10000 };

callAjax('http://domain.com', opts);
callAjax('http://domain.com', opts); // cache hit

```

#### Use Immutability
The inherent challenges with comparison in Javascript have pushed developers towards immutability.
Rather than update an object when it needs to change, discard it completely, and replace it with a new object that has the changes reflected.
This way when it comes time for comparison, it can be done instantly using strict equality.


## Internals
The internals of the memoized function are available for introspection.
They should not be manipulated directly, but can be useful to read.
The following properties are available:

```Slim
memoizedFn.limit       : The cache limit that was passed in. This will never change.
memoizedFn.wasMemoized : Returns true if the last invocation was a cache hit, otherwise false.
memoizedFn.cache       : The cache object that stores all the memoized results.
memoizedFn.lru         : The lru object that stores the most recent arguments called.

```

## Compared
There are many memoization libs available for JavaScript. Some of them have specialized use-cases, such as memoizing file-system access, or server async requests.
While others, such as this one, tackle the more general case of memoizing standard synchronous functions.
Some criteria to look for for a production-worthy memoization solution:

- **Support for multiple arguments**: Some only support one argument.
- **Support for complex arguments**: Including large arrays, complex objects, arrays-within-objects, objects-within-arrays, etc. (not just primitives like strings or numbers).
- **Controlled cache**: A cache that grows unimpeded will quickly become a memory leak and source of bugs.
- **Consistent performance profile**: Many libs perform well within certain parameters, but start to vary wildly in others, for example if too many arguments are used, or the objects become too complex. Performance should degrade relatively linearly as the environment becomes less favorable.

Two libs that meet the criteria are:

:heavy_check_mark: [Memoizee](https://github.com/medikoo/memoizee) (@medikoo)

:heavy_check_mark: [LRU-Memoize](https://github.com/erikras/lru-memoize) (@erikras)


## Benchmarks

Benchmarks were done using large and complex data. Example arguments look like:
```javascript
myMemoized(
    { a: 1, b: [{ c: 2, d: { e: 3 }}] }, // 1st argument
    [{ x: 'x', q: 'q', }, { b: 8, c: 9 }, { b: 2, c: [{x: 5, y: 3}, {x: 2, y: 7}] }, { b: 8, c: 9 }, { b: 8, c: 9 }], // 2nd argument
    { z: 'z' }, // 3rd argument
    ... // 4th, 5th... argument
);

```
The process involves calling the memoized functions many times using varying numbers of arguments (between 2-8) and with varying amounts of repetition (more repetion means more cache hits and vice versa).
them to each library.

##### Measurements
Measurements from 5000 iterations of each combination on firefox 44:

| Cache Size | Num Args | Approx. Cache Hits (variance) | LRU-Memoize | Memoizee | Memoizerific | % Faster |
| :--------: | :------: | :---------------------------: | :---------: | :------: | :----------: | :------: |
| 10         | 2        | 99%                           | 19ms        | 31ms     | **10ms**     | _90%_    |
| 10         | 2        | 62%                           | 212ms       | 319ms    | **172ms**    | _23%_    |
| 10         | 2        | 7%                            | 579ms       | 617ms    | **518ms**    | _12%_    |
|            |          |                               |             |          |              |          |
| 100        | 2        | 99%                           | 137ms       | 37ms     | **20ms**     | _85%_    |
| 100        | 2        | 69%                           | 696ms       | 245ms    | **161ms**    | _52%_    |
| 100        | 2        | 10%                           | 1,057ms     | 649ms    | **527ms**    | _23%_    |
|            |          |                               |             |          |              |          |
| 500        | 4        | 95%                           | 476ms       | 67ms     | **62ms**     | _8%_     |
| 500        | 4        | 36%                           | 2,642ms     | 703ms    | **594ms**    | _18%_    |
| 500        | 4        | 11%                           | 3,619ms     | 880ms    | **725ms**    | _21%_    |
|            |          |                               |             |          |              |          |
| 1000       | 8        | 95%                           | 1,009ms     | **52ms** | 65ms         | _25%_    |
| 1000       | 8        | 14%                           | 10,477ms    | 659ms    | **635ms**    | _4%_     |
| 1000       | 8        | 1%                            | 6,943ms     | 1,501ms  | **1,466ms**  | _2%_     |

```
Cache Size                    : The maximum number of results to cache.
Num Args                      : The number of arguments the memoized function accepts, ex. fn(arg1, arg2, arg3) is 3.
Approx. Cache Hits (variance) : How varied the passed in arguments are. If the exact same arguments are always used, the cache would be hit 100% of the time. If the same arguments are never used, the cache would be hit 0% of the time.
% Faster                      : How much faster the 1st best performer was from the 2nd best performer (not against the worst performer).
```

##### Results

LRU-Memoize performed well with few arguments and lots of cache hits, but quickly degraded as the environment became more challenging. At 4+ arguments it was up to 20x slower, enough to cause material consequences.

Memoizee performed well and is a solid library.

Memoizerific was the fastest by about 30%. 

## License

Released under an MIT license.

## Related

- [Map or Similar](https://github.com/thinkloop/map-or-similar): A JavaScript (JS) Map or Similar object polyfill if Map is not available.
- [Multi Key Cache](https://github.com/thinkloop/multi-key-cache): A JavaScript (JS) cache that can have multiple complex values as keys.

## Other
- [todo-app](https://github.com/thinkloop/todo-app/): Example todo app of extreme decoupling of react, redux and selectors
- [link-react](https://github.com/thinkloop/link-react/): A generalized link <a> component that allows client-side navigation while taking into account exceptions
- [spa-webserver](https://github.com/thinkloop/spa-webserver/): Webserver that redirects to root index.html if path is missing for client-side SPA navigation

Like it? Star It
