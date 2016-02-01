var MapOrSimilar = require('./maporsimilar');

module.exports = function (limit) {
    var cache = new MapOrSimilar(),
        lru = [];
        
    return function(fn) {
        var memoizerific = function () {
            var currentCache = cache,
                newMap,
                fnResult,
                argsLength = arguments.length,
                lruPath = Array(argsLength),
                isMemoized = true,
                i;

            // loop through each argument to traverse the map tree
            for (i = 0; i < argsLength - 1; i++) {
                lruPath[i] = { cacheItem: currentCache, arg: arguments[i] };

        	    // if all arguments exist in map tree, the memoized result will be last value to be retrieved
        		if (currentCache.has(arguments[i])) {
        			currentCache = currentCache.get(arguments[i]);
        			continue;
        		}

    		    isMemoized = false;

    		    // make maps until last value
                newMap = new Map();
				currentCache.set(arguments[i], newMap);
				currentCache = newMap;
        	}
        	
			// we are at the last arg, check if memoized
			if (isMemoized) {
        		if (currentCache.has(arguments[argsLength - 1])) {
        			fnResult = currentCache.get(arguments[argsLength - 1]);
        		}
    			else {
    			    isMemoized = false;
    			}        		
			}
			
			if (!isMemoized) {
                //memoizerific.memoizeMisses++;			    
    			fnResult = fn.apply(fn, arguments);
    			currentCache.set(arguments[argsLength - 1], fnResult);			    
			}
			else {
                //memoizerific.memoizeHits++;
			}
			
			
			if (limit && limit > 0) {	    
			    lruPath[argsLength - 1] = { cacheItem: currentCache, arg: arguments[argsLength - 1] };
			    
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
			
        	// at this point this variable is mis-named, and actually holding the fnResult or memoized fnResult, but for most of its life it was holding the current cache map, and only the at the very end does it turn into the result
        	return fnResult;
        };
        
        /*
        memoizerific.memoizeHits = 0;
        memoizerific.memoizeMisses = 0;
        memoizerific.lru = lru;
        memoizerific.cache = cache;
        */
        
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