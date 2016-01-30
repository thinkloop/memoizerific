/*
 * memoize-lru.js
 * by @thinkloop
 * MIT license.
 */
(function(root, factory) {
        if (typeof define === 'function' && define.amd) {
            define([], factory);
        }
        else if (typeof exports === 'object') {
            module.exports = factory();
        }
        else {
            root.memoize = factory();
        }
    }(this, function() {"use strict";

return function (limit) {
    var cache = new Map(),
        lru = [];
        
    return function(fn) {
        return function () {
            var currentCache = cache,
                newMap,
                fnResult,
                argsLength = arguments.length,
                args = Array(argsLength),
                isMemoized = true,
                i;

            // loop through each argument to traverse the map tree
            for (i = 0; i < argsLength; i++) {
                args[i] = arguments[i];

        	    // if all arguments exist in map tree, the memoized result will be last value to be retrieved
        		if (currentCache.has(args[i])) {
        			currentCache = currentCache.get(args[i]);
        		}

        		// if args not yet cached and result not yet memoized, build the missing parts of the cache tree
        		else {

        		    isMemoized = false;

        		    // make maps until last value
                    if (i < argsLength - 1) {
                        newMap = new Map();
        				currentCache.set(args[i], newMap);
        				currentCache = newMap;
        			}

        			// if we are at the last arg, run the fn to get the result to memoize
                    else {
        				fnResult = fn.apply(fn, args);
        				currentCache.set(args[i], fnResult);
        				currentCache = fnResult;
        				
        				if (limit && limit > 0) {
            				lru.push(args);
            				if (lru.length > limit) {
            				    removeCachedResult();
            				}
        				}
        			}
        		}
        	}

        	if (isMemoized && limit && limit > 0) {
        	    moveToMostRecentLru();
        	}

        	// at this point this variable is mis-named, and actually holding the fnResult or memoized fnResult, but for most of its life it was holding the current cache map, and only the at the very end does it turn into the result
        	return currentCache;

        	function moveToMostRecentLru() {
        	    var lruLen = lru.length,
        	        isMatch,
        	        i, ii;

        	    for (i = lruLen - 1; i >= 0; i--) {
        	        isMatch = true;
            	    for (ii =0; ii < argsLength; ii++) {
            	        if (lru[i][ii] !== args[ii]) {
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
            function removeCachedResult() {
                var removedLru = lru.shift(),
                    removedLruLen = removedLru.length,
                    currentCacheItem = cache,
                    lruarray = [currentCacheItem],
                    tmp,
                    i;

                // walk up map tree to get the relevant maps that are holding each arg key
                for (i = 0; i < removedLruLen - 1; i++) {
                    currentCacheItem = currentCacheItem.get(removedLru[i]);
                    lruarray.push(currentCacheItem);
                }

                // walk down the tree removing dead branches (size 0) along the way
                for (i = removedLruLen - 1; i >= 0; i--) {
                    tmp = lruarray[i].get(removedLru[i]);

                    if (!tmp || !tmp.size) {
                        lruarray[i].delete(removedLru[i]);
                    }
                    else {
                        break;
                    }
                }
        	}
        };
    };
}}));