# Memoizerific.js
Fastest (see benchmarks), smallest (923b min/gzip), most-efficient, dependency-free, JavaScript (JS) memoization lib. 
Fully supports multiple complex object arguments. 
Implements LRU (least recently used) cache to maintain only the most recent results. 

For the browser and nodejs.

Memoization is the process of caching function results so that they can be returned cheaply 
without re-running the function when it is re-invoked with the same arguments.

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

memoizerific(1)(function(){}); // memoize 1 result
memoizerific(10000)(function(){}); // memoize 10,000 results
memoizerific(0)(function(){}); // memoize infinity results (not recommended)
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

## Comparison
There are many memoization libs available for JavaScript. Some of them have specialized use-cases, such as memoizing file-system access, or server async requests. 
While others, such as this library, tackle the more general use-case of memoizing standard synchronous functions. Few, however, are suitable for real-world production environments.
Following are the minimum criteria I look for in a memoization solution:

- **Support for multiple arguments**: One argument memoizers aren't going to get us far in solving real problems.
- **Support for complex arguments**: Including large arrays, complex objects, arrays-of-objects, arrays-within-objects, etc. (not just primitives like strings or numbers).
- **Dynamic Cache**: A cache that grows unimpeded will quickly become a memory leak and source of bugs.
- **Consistent performance profile**: Many libs perform well within certain parameters, but fail wildly in others, like if a large cache is chosen, or arguments are many or complex. It is important that performance degrade predictably and linearly as the environment becomes less favorable to avoid nasty surprises.

Using this simply list, we can narrow down the field of possible candidates dramatically. 
The popular [lodash](https://lodash.com/docs#memoize), for example, only supports one argument out of the box and has no cache-size control. 
These others support multiple complex arguments, but also do not provide a cache-size control solution:

:heavy_multiplication_x: [Memoizejs](https://github.com/addyosmani/memoize.js) (@addyosmani) 

:heavy_multiplication_x: [Memoize-strict](https://github.com/jshanson7/memoize-strict) (@jshanson7)

:heavy_multiplication_x: [Deep-memoize](https://github.com/rjmk/deep-memoize) (@rjmk)

:heavy_multiplication_x: [Mem](https://github.com/sindresorhus/mem) (@sindresorhus)

I found three libs that met the first three criteria that had decent traction:

- [Memoizee](https://github.com/medikoo/memoizee) (@medikoo)
- [LRU-Memoize](https://github.com/erikras/lru-memoize) (@erikras)
- ~~[LRU-Memoize](https://github.com/neilk/lru-memoize) (@neilk)~~

After a little fiddling, however, the library by @neilk was simply producing incorrect results, so we dropped it out of the running, leaving two viable options.
Time to test their performance.

## Benchmarks

This library is intended for real-world use-cases, and is therefore benchmarked against other libraries using complex real-world data. 
Humanity doesn't need any more fibonacci solvers.
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
the same ones to each memoization lib. For the full details and source see [memoize-js-libs-benchmarks](https://github.com/thinkloop/memoize-js-libs-benchmarks).

##### Data
Here is data from running each lib through 5000 iterations on firefox 44:

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

The results from this test are interesting. 
While LRU-Memoize performed quite well when there were few arguments, and lots of cache hits, it quickly started to fall apart as the environment became more challenging.
Once we got to 4 arguments it became 5x-10x-20x slower than the other two, and began to hit severe levels that could potentially cause real-life problems. 
I would not recommend it for heavy production use.
Memoizee came in a solid second place, being outperformed by Memoizerific by an average of 31%.
While not insignificant, in many real-world scenarios this will not make a huge difference, unless the memoized function is being 
called repetitively in a loop, or through heavy recursion. What counts, is that it degraded nicely, and stayed within reasonable sub 1s levels. 
It is a sturdy library and I would be comfortable recommending it for production use.
Memoizerific was clearly the big performance winner. It was built with complex real-world use in mind, and I would biasedly recommend it. 