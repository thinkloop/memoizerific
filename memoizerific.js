(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.memoizerific = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

if (typeof Map === 'function') {
    module.exports = Map;
} else {
    module.exports = Similar;
}

function Similar() {
    this.list = [];
    this.lastHas = null;
    this.size = 0;

    return this;
}

Similar.prototype.get = function (key) {
    var len = this.list.length,
        i;

    if (this.lastGet && this.lastGet.key === key) {
        return this.lastGet.val;
    }

    for (i = 0; i < len; i++) {
        if (this.list[i].key === key) {
            this.lastGet = this.list[i];
            return this.list[i];
        }
    }

    return null;
};

Similar.prototype.set = function (key, val) {
    this.list.push({ key: key, val: val });
    this.size++;
    return this;
};

Similar.prototype.delete = function (key) {
    var len = this.list.length,
        i;
    for (i = 0; i < len; i++) {
        if (this.list[i].key === key) {
            break;
        }
    }

    if (this.list.splice(i, 1).length) {
        this.size--;
    }

    return this;
};

Similar.prototype.has = Similar.prototype.get;

},{}],2:[function(require,module,exports){
'use strict';

var MapOrSimilar = require('./maporsimilar');

module.exports = function (limit) {
    var cache = new MapOrSimilar(),
        lru = [];

    return function (fn) {
        var memoizerific = function memoizerific() {
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
                } else {
                    isMemoized = false;
                }
            }

            if (!isMemoized) {
                //memoizerific.memoizeMisses++;			   
                fnResult = fn.apply(fn, arguments);
                currentCache.set(arguments[argsLength - 1], fnResult);
            } else {
                //memoizerific.memoizeHits++;
            }

            if (limit && limit > 0) {
                lruPath[argsLength - 1] = { cacheItem: currentCache, arg: arguments[argsLength - 1] };

                if (isMemoized) {
                    moveToMostRecentLru(lru, lruPath);
                } else {
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
        i,
        ii;

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
        } else {
            break;
        }
    }
}

},{"./maporsimilar":1}]},{},[2])(2)
});