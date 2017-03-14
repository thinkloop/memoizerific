# Memoizerific.js
[![Build Status](https://travis-ci.org/thinkloop/memoizerific.svg?branch=master)](https://travis-ci.org/thinkloop/memoizerific)

Fast (see benchmarks), small (1k min/gzip), efficient, JavaScript memoization lib to memoize JS functions.

Uses JavaScript's new [Map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object for instant lookups, or a [performant polyfill](https://github.com/thinkloop/map-or-similar) if Map is not available - does not do expensive serialization or string manipulation.

Fully supports multiple complex arguments.
Implements least recently used (LRU) caching to maintain only the most recent results.

Made for the browser and nodejs.

Memoization is the process of caching function results so that they can be returned cheaply
without re-execution, when the function is called again with the same arguments.
This is especially useful with the rise of [redux-philosophy](https://github.com/rackt/redux),
and the push to calculate derived data on the fly to maintain minimal state.

## Install
Add to your project directly from npm:

```
npm install memoizerific --save
```

Or use one of the compiled distributions compatible in any environment (UMD):

- [memoizerific.js](https://raw.githubusercontent.com/thinkloop/memoizerific/master/memoizerific.js)
- [memoizerific.min.js](https://raw.githubusercontent.com/thinkloop/memoizerific/master/memoizerific.min.js) (minified)
- [memoizerific.min.gzip.js](https://github.com/thinkloop/memoizerific/raw/master/memoizerific.min.gzip.js) (minified + gzipped)


## Use
```javascript
var memoizerific = require('memoizerific');

var myExpensiveFunctionMemoized = memoizerific(50)(function(arg1, arg2, arg3) {
    // so many long expensive calls in here
});

myExpensiveFunctionMemoized(1, 2, 3); // that took long to process
myExpensiveFunctionMemoized(1, 2, 3); // wow, that one was instant!

myExpensiveFunctionMemoized(2, 3, 4); // expensive again :(
myExpensiveFunctionMemoized(2, 3, 4); // woah, this one was dirt cheap
```
Or with complex arguments:
```javascript
var complexArg1 = { a: { b: { c: 99 }}}, // hairy nested object
    complexArg2 = [{ z: 1}, { q: [{ x: 3 }]}], // objects within arrays within arrays
    complexArg3 = new Map([['d', 55],['e', 66]]), // new Map object
    complexArg4 = new Set(); // new Set object

myExpensiveFunctionMemoized(complexArg1, complexArg2, complexArg3, complexArg4); // slow
myExpensiveFunctionMemoized(complexArg1, complexArg2, complexArg3, complexArg4); // instant!
```

## Options
There is one option available:

`limit:` the max number of results to cache.


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

## Strict Equality
Arguments are compared using strict equality.
A complex object will only trigger a cache hit if it refers to the exact same object in memory,
not just another object that has similar properties.
For example, the following code won't produce a cache hit even though the objects look the same:

```javascript
// memoize 1 result
var myMemoized = memoizerific(1)(function(arg1) {});

myMemoized({ a: true }); // function runs
myMemoized({ a: true }); // not cached, runs again

```

This is because a new object is being created on each invocation, rather than the same object being passed in.
To _fix_ it, the argument can be saved in a common variable:

```javascript
// memoize 1 result
var myMemoized = memoizerific(1)(function(arg1) {});
var arg = { a: true };

myMemoized(arg); // function runs
myMemoized(arg); // cache hit!

```

There is an open suggestion to allow for custom comparison functions.
If you think that would be useful please +1 [issue #10](https://github.com/thinkloop/memoizerific/issues/10).


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

## Comparison
There are many memoization libs available for JavaScript. Some of them have specialized use-cases, such as memoizing file-system access, or server async requests.
While others, such as this one, tackle the more general case of memoizing standard synchronous functions.
Following are the minimum criteria I look for in a production-worthy memoization solution:

- **Support for multiple arguments**: One argument memoizers start to fall short quickly when solving real problems.
- **Support for complex arguments**: Including large arrays, complex objects, arrays-within-objects, objects-within-arrays, etc. (not just primitives like strings or numbers).
- **Controlled cache**: A cache that grows unimpeded will quickly become a memory leak and source of bugs.
- **Consistent performance profile**: Many libs perform well within certain parameters, but start to fail wildly in others, usually when a large cache is chosen, or many arguments are used. It is important that performance degrades predictably and linearly as the environment becomes less favorable to avoid nasty surprises.

Using this list, we can narrow down the field of possible candidates quite a bit.
The popular [lodash memoize](https://lodash.com/docs#memoize), for example, only supports one argument out of the box and has no cache control.
Others support multiple complex arguments, but do not offer mechanisms to manage the cache-size:

- :heavy_multiplication_x: [Memoizejs](https://github.com/addyosmani/memoize.js) (@addyosmani)

- :heavy_multiplication_x: [Memoize-strict](https://github.com/jshanson7/memoize-strict) (@jshanson7)

- :heavy_multiplication_x: [Deep-memoize](https://github.com/rjmk/deep-memoize) (@rjmk)

- :heavy_multiplication_x: [Mem](https://github.com/sindresorhus/mem) (@sindresorhus)

Three libs with reasonable traction seem to meet the basic criteria:

- [Memoizee](https://github.com/medikoo/memoizee) (@medikoo)
- [LRU-Memoize](https://github.com/erikras/lru-memoize) (@erikras)
- ~~[LRU-Memoize](https://github.com/neilk/lru-memoize) (@neilk)~~

After some quick testing, however, we found the library by @neilk to be producing incorrect results, leaving only two viable candidates.

Time to test performance.

## Benchmarks

This library is intended for real-world use-cases, and is therefore benchmarked using large, complex, real-world data.
There are enough fibonacci solvers out there.
Example arguments look like this:
```javascript
myMemoized(
    { a: 1, b: [{ c: 2, d: { e: 3 }}] }, // 1st argument
    [{ x: 'x', q: 'q', }, { b: 8, c: 9 }, { b: 2, c: [{x: 5, y: 3}, {x: 2, y: 7}] }, { b: 8, c: 9 }, { b: 8, c: 9 }], // 2nd argument
    { z: 'z' }, // 3rd argument
    ... // 4th, 5th... argument
);

```
We generated sets of thousands of random argument combinations of varying variance (to increase and decrease cache hits and misses) and fed
them to each library.

##### Data
Following is data from 5000 iterations of each test on firefox 44:

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

The results from the tests are interesting.
While LRU-Memoize performed well with few arguments and lots of cache hits, it quickly degraded as the environment became more challenging. At 4+ arguments, it was 5x-10x-20x slower than the other contenders, and began to hit severe performance issues that could potentially cause real-world problems. I would not recommend it for heavy production use.

Memoizee came in a solid second place, around 31% less performant than Memoizerific.
In most scenarios this will not be very noticeable, in others, like memoizing in a loop,
or recursively, it might be. Importantly though, it degraded gracefully, and remained within
sub 1s levels almost all the time. Memoizee is acceptable for production use.

Memoizerific was fastest in all tests except one. It was built for production with
complex real-world use in mind.

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
