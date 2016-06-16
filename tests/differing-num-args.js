var Memoizerific = require('../src/memoizerific');

describe("different number of args between calls", () => {
	var memoizedFn,
		arg1 = 1,
		arg2 = 2;

	beforeEach(function() {
		memoizedFn = Memoizerific(50)(function(arg1, arg2) {
			return true;
		});
		memoizedFn(arg1);
	});

	it("should be map or similar", () => { expect(memoizedFn.cache instanceof Map).toEqual(process.env.TEST_MAPORSIMILAR !== 'true'); });

	it("should not be memoized", () => {
		expect(memoizedFn.wasMemoized).toEqual(false);
		expect(memoizedFn.lru.length).toEqual(1);
	});

	it("should be memoized", () => {
		memoizedFn(arg1, arg2);
		expect(memoizedFn.wasMemoized).toEqual(true);
		expect(memoizedFn.lru.length).toEqual(1);
	});

/*
	it("should have multiple cached items", () => {
		memoizedFn(arg1, arg2, arg3);
		memoizedFn(arg1, arg2, 1);
		expect(memoizedFn.wasMemoized).toEqual(false);
		expect(memoizedFn.lru.length).toEqual(2);
	});
*/
});
