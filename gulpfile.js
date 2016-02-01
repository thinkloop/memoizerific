var packageJSON = require('./package.json'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	vinylsource = require('vinyl-source-stream'),
	vinylbuffer = require('vinyl-buffer'),
	runSequence = require('run-sequence'),

	browserify = require('browserify'),
	babelify = require('babelify'),
	streamify = require('gulp-streamify'),
	umdify = require('umdify'),
	uglify = require('gulp-uglify'),

	path = {
		SRC : 'src',
		ENTRY_POINT : 'src/memoizerific.js',
		OUT : 'memoizerific.js',
		OUT_MIN : 'memoizerific.min.js',
		OUT_GZIP : 'memoizerific.min.gzip.js',
		DEST : './'
	};


gulp.task('default', function(callback) {
	process.env.NODE_ENV = 'production';
	return runSequence('processJS', function() { gutil.log('done!'); });
});


gulp.task('processJS', function() {
	return browserify({
			entries : [path.ENTRY_POINT],
			standalone: 'memoizerific',
			debug : false,
			cache : {}, packageCache : {}, fullPaths : false
		})
		.transform("babelify", { presets: ["es2015"] })
		.bundle()
		    .on("error", handleError)
			.pipe(vinylsource(path.OUT))
			.pipe(vinylbuffer())
			.pipe(streamify(uglify()))
			.pipe(gulp.dest(path.DEST));
});

function handleError(err) {
	gutil.log(err.toString());
}