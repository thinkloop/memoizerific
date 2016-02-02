# Memoizerific.js
Fastest (see benchmarks), smallest (923b min/gzip), most-efficient, dependency-free, JavaScript memoization lib to memoize JS functions. 
Fully supports multiple complex object arguments. 
Implements LRU (least recently used) cache to maintain only the most recent results. 

For the browser and nodejs.

Memoization is the process of caching function results, so that they can be returned cheaply, 
without re-running the function when it is called again with the same arguments.

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
There is one option available: 

`limit:` the max number of results to cache. 


```javascript
memoizerific(limit)(fn);

memoizerific(1)(function(){}); // memoize 1 result
memoizerific(10000)(function(){}); // memoize 10,000 results
memoizerific(0)(function(){}); // memoize infinity results (not recommended)
```
The cache works using LRU logic, purging the least recently used results when the limit is reached.

```javascript
// memoize 1 result
var myMemoized = memoizerific(1)(function(arg1, arg2, arg3, arg4) {});

myMemoized(1, 2, 3, 'a'); // function runs
myMemoized(1, 2, 3, 'a'); // cached result is returned
myMemoized(1, 2, 3, 'X'); // function runs again, new result is cached, old cached result is purged
myMemoized(1, 2, 3, 'X'); // new cached result is returned
myMemoized(1, 2, 3, 'a'); // function runs again...
```

## Comparison
There are many memoization libs available for JavaScript. Some of them have specialized use-cases, such as memoizing file-system access, or server async requests. 
While others, such as this one, tackle the more general case of memoizing standard synchronous functions.
Following are the minimum criteria I look for in a production-worthy memoization solution:

- **Support for multiple arguments**: One argument memoizers start to fall short quickly when solving real problems.
- **Support for complex arguments**: Including large arrays, complex objects, arrays-within-objects, objects-within-arrays, etc. (not just primitives like strings or numbers).
- **Dynamic Cache**: An uncontrolled cache that grows unimpeded will quickly become a memory leak and source of bugs.
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

This library is intended for real-world use-cases, and is therefore benchmarked against other libraries using large, complex, real-world data. 
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
them to each library. For the full details and source of the benchmarks see [memoize-js-libs-benchmarks](https://github.com/thinkloop/memoize-js-libs-benchmarks).

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


##### Results

The results from the tests are interesting. 
While LRU-Memoize performed quite well with few arguments and lots of cache hits, it quickly started to fall apart as the environment became more challenging.
At 4+ arguments it was 5x-10x-20x slower than the other contenders, and began to hit severe performance issues that could potentially cause real-world problems. 
I would not recommend it for heavy production use.

Memoizee came in a solid second place, around 31% less performant than Memoizerific.
In most scenarios this would not be very noticeable. In some demanding ones,
such as memoizing in a loop, or through a long recursion chain, it might be.
Importantly though, it degraded very gracefully, and remained within sub 1s levels almost all the time.
Memoizee is a sturdy, well-built library that I would recommend for production use.

Memoizerific was the performance winner. It is built with complex real-world use in mind. 
I would, of course, recommend it for serious production use.