var MapOrSimilar = require('map-or-similar');

module.exports = function (limit) {
    var cache = new MapOrSimilar(),
        lru = [];

    return function(fn) {
        var memoizerific = function () {
            var currentCache = cache,
                newMap,
                fnResult,
                argsLengthMinusOne = arguments.length - 1,
                lruPath = Array(argsLengthMinusOne + 1),
                isMemoized = true,
                i;

            // loop through each argument to traverse the map tree
            for (i = 0; i < argsLengthMinusOne; i++) {
                lruPath[i] = { cacheItem: currentCache, arg: arguments[i] };

        	    // if all arguments exist in map tree, the memoized result will be last value to be retrieved
        		if (currentCache.has(arguments[i])) {
        			currentCache = currentCache.get(arguments[i]);
        			continue;
        		}

    		    isMemoized = false;

    		    // make maps until last value
                newMap = new MapOrSimilar();
				currentCache.set(arguments[i], newMap);
				currentCache = newMap;
        	}

			// we are at the last arg, check if it is really memoized
			if (isMemoized) {
        		if (currentCache.has(arguments[argsLengthMinusOne])) {
        			fnResult = currentCache.get(arguments[argsLengthMinusOne]);
        		}
    			else {
    			    isMemoized = false;
    			}
			}

			if (!isMemoized) {
    			fnResult = fn.apply(null, arguments);
    			currentCache.set(arguments[argsLengthMinusOne], fnResult);
			}

			if (limit > 0) {
			    lruPath[argsLengthMinusOne] = { cacheItem: currentCache, arg: arguments[argsLengthMinusOne] };

                if (isMemoized) {
                    moveToMostRecentLru(lru, lruPath);
                }
                else {
				    lru.push(lruPath);
                }

                if (lru.length > limit) {
				    removeCachedResult(lru.shift());
				}
			}

			memoizerific.wasMemoized = isMemoized;

        	return fnResult;
        };

        memoizerific.cache = cache;
        memoizerific.lru = lru;

        return memoizerific;
    };
};

// move current args to most recent position
function moveToMostRecentLru(lru, lruPath) {
    var lruLen = lru.length,
        lruPathLen = lruPath.length,
        isMatch,
        i, ii;

    for (i = 0; i < lruLen; i++) {
        isMatch = true;
	    for (ii = 0; ii < lruPathLen; ii++) {
	        if (lru[i][ii].arg !== lruPath[ii].arg) {
	            isMatch = false;
	            break;
	        }
	    }
	    if (isMatch) {
	        break;
	    }
    }

    lru.push(lru.splice(i, 1)[0]);
}

// remove least recently used cache item and all dead branches
function removeCachedResult(removedLru) {
    var removedLruLen = removedLru.length,
        currentLru = removedLru[removedLruLen - 1],
        tmp,
        i;

    currentLru.cacheItem.delete(currentLru.arg);

    // walk down the tree removing dead branches (size 0) along the way
    for (i = removedLruLen - 2; i >= 0; i--) {
        currentLru = removedLru[i];
        tmp = currentLru.cacheItem.get(currentLru.arg);

        if (!tmp || !tmp.size) {
            currentLru.cacheItem.delete(currentLru.arg);
        }
        else {
            break;
        }
    }
}