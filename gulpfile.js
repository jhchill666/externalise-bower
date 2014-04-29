var gulp = require('gulp')
  , packager = require('./lib/packager')({debug: true})
  , browserify = require('gulp-browserify')
  , concat = require('gulp-concat')
  , sequence = require('gulp-run-sequence')
  , connect = require('gulp-connect-multi')();


gulp.task('default', function () {
    sequence('dist-vendor','dist-js','dist-html', 'connect');
});


/**
 * Browserify using a dummy entry point, 'requiring' the bower components on prebundle
 */
gulp.task('dist-vendor', function() {
    return gulp.src('./lib/noop.js' , {read: false})
        .pipe(browserify())
        .on('prebundle', function(bundle) {
            packager.require(bundle);
        })
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./build'));
})


/**
 * Browserify using your main application entry point, 'external'ising the bower components on prebundle
 */
gulp.task('dist-js', function() {
    return gulp.src('./src/js/app.js', {read: false})
        .pipe(browserify())
        .on('prebundle', function(bundle) {
            packager.external(bundle);
        })
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./build'));
})


/**
 * Copy over our html
 */
gulp.task('dist-html', function() {
    return gulp.src('./src/index.html')
        .pipe(gulp.dest('./build'));
})


/**
 * Finally launch the html to see if it all worked
 */
gulp.task('connect', connect.server({
    root: ['./build'],
    port: '3000',
    livereload: { port: 35729 },
    open: {
        file: 'index.html'
    }
}));