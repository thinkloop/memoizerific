var Memoizerific = require('../src/memoizerific');

describe("custom normalizer", () => {
	var memoizedFn;

	it("should be map or similar", () => {
		var normalizerFn1 = function() { return true; };
		var memoizedFn = Memoizerific(100, normalizerFn1)(function (obj) { return obj; });
		expect(memoizedFn.cache instanceof Map).toEqual(process.env.FORCE_SIMILAR_INSTEAD_OF_MAP !== 'true');
	});

	it("should always be memoized", () => {
		var normalizerFn1 = function() { return true; };
		var memoizedFn = Memoizerific(100, normalizerFn1)(function (obj) { return obj; });

		memoizedFn({a: 1});

		memoizedFn(1);
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn([1, 2, 3]);
		expect(memoizedFn.wasMemoized).toEqual(true);

		expect(memoizedFn.lru.length).toEqual(1);
	});

	it("should be memoized based on custom function", () => {
		var normalizerFn2 = function(i) { return i % 2; };
		var memoizedFn = Memoizerific(100, normalizerFn2)(function (obj) { return obj; });

		memoizedFn(1);
		memoizedFn(3);
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn(2);
		expect(memoizedFn.wasMemoized).toEqual(false);

		memoizedFn(4)
		expect(memoizedFn.wasMemoized).toEqual(true);

		expect(memoizedFn.lru.length).toEqual(2);
	});

	it("should handle common stringify case", () => {
		var normalizerFn3 = function(i) { return JSON.stringify(i); };
		var memoizedFn = Memoizerific(100, normalizerFn3)(function (obj) { return obj; });

		memoizedFn({ a: 1 }, [1,2], {c: 3});
		memoizedFn({ a: 1 }, [1,2], {c: 3});
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn({ a: 1 }, [1,2], {c: 3});
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn({ a: 1 }, [1,2,0], {c: 3});
		expect(memoizedFn.wasMemoized).toEqual(false);

		memoizedFn({ a: 1 }, [1,2,0], {c: 3});
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn({ a: 2 }, [1,2], {c: 3});
		expect(memoizedFn.wasMemoized).toEqual(false);

		memoizedFn({ a: 1 }, [1,2], {c: 3});
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn(null, undefined, NaN);
		expect(memoizedFn.wasMemoized).toEqual(false);

		memoizedFn(null, undefined, NaN);
		expect(memoizedFn.wasMemoized).toEqual(true);

		memoizedFn(undefined, null, NaN);
		expect(memoizedFn.wasMemoized).toEqual(false);

		expect(memoizedFn.lru.length).toEqual(5);
	});
});
