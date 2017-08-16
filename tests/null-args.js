var Memoizerific = require('../src/memoizerific');

describe("custom normalizer", () => {
	var memoizedFn;

	it("should always be memoized", () => {
    var memoizedFn =
      Memoizerific(100, function () { return true; })
      (function (obj) { return obj; });

    memoizedFn({a: 1});

    memoizedFn(1);
		expect(memoizedFn.wasMemoized).toEqual(true);
    memoizedFn([1, 2, 3]);
		expect(memoizedFn.wasMemoized).toEqual(true);
	});

	it("should be memoized based on custom function", () => {
    var memoizedFn =
      Memoizerific(100, function (i) { return i % 2; })
      (function (obj) { return obj; });

    memoizedFn(1);
    memoizedFn(3);
		expect(memoizedFn.wasMemoized).toEqual(true);

    memoizedFn(2);
		expect(memoizedFn.wasMemoized).toEqual(false);

    memoizedFn(4);
		expect(memoizedFn.wasMemoized).toEqual(true);
	});
});
