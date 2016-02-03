var Memoizerific = require('../src/memoizerific');

describe("wasMemoized", () => {
    var memoizedFn;

    beforeEach(function() {
        memoizedFn = Memoizerific(50)(function(arg1, arg2, arg3) {
            return arg1.num * arg2.num;
        });
        memoizedFn(1, 2, 3);
    });


    it("wasMemoized should be false", () => {
        expect(memoizedFn.wasMemoized).toEqual(false);
    });

    it("wasMemoized should be true", () => {
        memoizedFn(1, 2, 3);
        expect(memoizedFn.wasMemoized).toEqual(true);
    });

    it("wasMemoized should be false", () => {
        memoizedFn(1, 2, 3);
        memoizedFn(4, 5, 6);
        expect(memoizedFn.wasMemoized).toEqual(false);
    });
});