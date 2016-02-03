var Memoizerific = require('../src/memoizerific');

describe("fibonacci", () => {
    var fibonacci,
        fibonacciMemoized,
        fibonacciResult,
        fibonacciMemoizedResult,
        fibonacciTime,
        fibonacciMemoizedTime;

    fibonacci = function (n) {
        if (n < 2){
            return 1;
        }
        else {
            return fibonacci(n-2) + fibonacci(n-1);
        }
    };

    fibonacciMemoized = Memoizerific(50)(function (n) {
        if (n < 2){
            return 1;
        }
        else {
            return fibonacciMemoized(n-2) + fibonacciMemoized(n-1);
        }
    });

    fibonacciTime = process.hrtime();
    fibonacciResult = fibonacci(40);
    fibonacciTime = process.hrtime(fibonacciTime);

    fibonacciMemoizedTime = process.hrtime();
    fibonacciMemoizedResult = fibonacciMemoized(40);
    fibonacciMemoizedTime = process.hrtime(fibonacciMemoizedTime);

    it("should be map or similar", () => { expect(fibonacciMemoized.cache instanceof Map).toEqual(process.env.TEST_MAPORSIMILAR !== 'true'); });
    it("should equal non-memoized result", () => { expect(fibonacciResult).toEqual(fibonacciMemoizedResult); });
    it("should have proper lru length", () => { expect(fibonacciMemoized.lru.length).toEqual(41); });
    it("should have significantly higher performance", () => { expect(fibonacciTime[0] - fibonacciMemoizedTime[0] >= 2).toEqual(true); });
});

describe("complex args", () => {
    var memoizedFn,
        arg1 = { a: { b: 3 }, num: 3 },
        arg2 = { c: { d: 3 }, num: 7 },
        arg3 = [{ f: { g: 3 }, num: 11 }, { h: { i: 3 }, num: 4 }, { j: { k: 3 }, num: 6 }];

    beforeEach(function() {
        memoizedFn = Memoizerific(50)(function(arg1, arg2, arg3) {
            return arg1.num * arg2.num;
        });
        memoizedFn(arg1, arg2, arg3);
    });

    it("should be map or similar", () => { expect(memoizedFn.cache instanceof Map).toEqual(process.env.TEST_MAPORSIMILAR !== 'true'); });

    it("should not be memoized", () => {
        expect(memoizedFn.wasMemoized).toEqual(false);
        expect(memoizedFn.lru.length).toEqual(1);
    });

    it("should be memoized", () => {
        memoizedFn(arg1, arg2, arg3);
        expect(memoizedFn.wasMemoized).toEqual(true);
        expect(memoizedFn.lru.length).toEqual(1);
    });

    it("should have multiple cached items", () => {
        memoizedFn(arg1, arg2, arg3);
        memoizedFn(arg1, arg2, 1);
        expect(memoizedFn.wasMemoized).toEqual(false);
        expect(memoizedFn.lru.length).toEqual(2);
    });
});
