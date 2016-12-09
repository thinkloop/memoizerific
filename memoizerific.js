(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.memoizerific = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var i;i="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,i.mapOrSimilar=t()}}(function(){var t,i,e;return function t(i,e,s){function n(o,l){if(!e[o]){if(!i[o]){var a="function"==typeof _dereq_&&_dereq_;if(!l&&a)return a(o,!0);if(r)return r(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var h=e[o]={exports:{}};i[o][0].call(h.exports,function(t){var e=i[o][1][t];return n(e?e:t)},h,h.exports,t,i,e,s)}return e[o].exports}for(var r="function"==typeof _dereq_&&_dereq_,o=0;o<s.length;o++)n(s[o]);return n}({1:[function(t,i,e){i.exports=function(i){if("function"!=typeof Map||i){var e=t("./similar");return new e}return new Map}},{"./similar":2}],2:[function(t,i,e){function s(){return this.list=[],this.lastItem=void 0,this.size=0,this}s.prototype.get=function(t){var i;return this.lastItem&&this.isEqual(this.lastItem.key,t)?this.lastItem.val:(i=this.indexOf(t),i>=0?(this.lastItem=this.list[i],this.list[i].val):void 0)},s.prototype.set=function(t,i){var e;return this.lastItem&&this.isEqual(this.lastItem.key,t)?(this.lastItem.val=i,this):(e=this.indexOf(t),e>=0?(this.lastItem=this.list[e],this.list[e].val=i,this):(this.lastItem={key:t,val:i},this.list.push(this.lastItem),this.size++,this))},s.prototype.delete=function(t){var i;if(this.lastItem&&this.isEqual(this.lastItem.key,t)&&(this.lastItem=void 0),i=this.indexOf(t),i>=0)return this.size--,this.list.splice(i,1)[0]},s.prototype.has=function(t){var i;return!(!this.lastItem||!this.isEqual(this.lastItem.key,t))||(i=this.indexOf(t),i>=0&&(this.lastItem=this.list[i],!0))},s.prototype.forEach=function(t,i){var e;for(e=0;e<this.size;e++)t.call(i||this,this.list[e].val,this.list[e].key,this)},s.prototype.indexOf=function(t){var i;for(i=0;i<this.size;i++)if(this.isEqual(this.list[i].key,t))return i;return-1},s.prototype.isEqual=function(t,i){return t===i||t!==t&&i!==i},i.exports=s},{}]},{},[1])(1)});

},{}],2:[function(_dereq_,module,exports){
var MapOrSimilar = _dereq_('map-or-similar');

module.exports = function (limit) {
	var cache = new MapOrSimilar(undefined === 'true'),
		lru = [];

	return function (fn) {
		var memoizerific = function () {
			var currentCache = cache,
				newMap,
				fnResult,
				argsLengthMinusOne = arguments.length - 1,
				lruPath = Array(argsLengthMinusOne + 1),
				isMemoized = true,
				i;

			if ((memoizerific.numArgs || memoizerific.numArgs === 0) && memoizerific.numArgs !== argsLengthMinusOne + 1) {
				throw new Error('Memoizerific functions should always be called with the same number of arguments');
			}

			// loop through each argument to traverse the map tree
			for (i = 0; i < argsLengthMinusOne; i++) {
				lruPath[i] = {
					cacheItem: currentCache,
					arg: arguments[i]
				};

				// climb through the hierarchical map tree until the second-last argument has been found, or an argument is missing.
				// if all arguments up to the second-last have been found, this will potentially be a cache hit (determined later)
				if (currentCache.has(arguments[i])) {
					currentCache = currentCache.get(arguments[i]);
					continue;
				}

				isMemoized = false;

				// make maps until last value
				newMap = new MapOrSimilar(undefined === 'true');
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
				lruPath[argsLengthMinusOne] = {
					cacheItem: currentCache,
					arg: arguments[argsLengthMinusOne]
				};

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
			memoizerific.numArgs = argsLengthMinusOne + 1;

			return fnResult;
		};

		memoizerific.limit = limit;
		memoizerific.wasMemoized = false;
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
			if (!isEqual(lru[i][ii].arg, lruPath[ii].arg)) {
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

// check if the numbers are equal, or whether they are both precisely NaN (isNaN returns true for all non-numbers)
function isEqual(val1, val2) {
	return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
},{"map-or-similar":1}]},{},[2])(2)
});