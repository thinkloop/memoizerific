var Memoizerific = require('../src/memoizerific');

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
