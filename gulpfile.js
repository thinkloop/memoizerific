var packageJSON = require('./package.json'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	vinylsource = require('vinyl-source-stream'),
	vinylbuffer = require('vinyl-buffer'),

	browserify = require('browserify'),
	derequire = require('gulp-derequire'),
	rename = require('gulp-rename'),
	streamify = require('gulp-streamify'),
	uglify = require('gulp-uglify'),
	gzip = require('gulp-gzip'),

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
	return browserify({
			entries : [path.ENTRY_POINT],
			standalone: 'memoizerific',
			debug : false,
			cache : {}, packageCache : {}, fullPaths : false
		})
		.bundle()
		    .on("error", handleError)
			.pipe(vinylsource(path.OUT))
			.pipe(vinylbuffer())
			.pipe(derequire())
			.pipe(gulp.dest(path.DEST))
			.pipe(rename(path.OUT_MIN))
			.pipe(streamify(uglify()))
			.pipe(gulp.dest(path.DEST))
			.pipe(rename(path.OUT_GZIP))
			.pipe(gzip({ append: false, gzipOptions: { level: 9 }}))
			.pipe(gulp.dest(path.DEST));
});

function handleError(err) {
	gutil.log(err.toString());
}