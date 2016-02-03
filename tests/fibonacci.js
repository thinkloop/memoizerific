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