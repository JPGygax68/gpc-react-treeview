"use strict";

var gulp = require("gulp");
var gutil = require("gulp-util");
//var plumber = require("gulp-plumber");
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var watchify = require('watchify');
var transform = require("vinyl-transform");
var source = require("vinyl-source-stream");
var buffer = require('vinyl-buffer');
var notify = require("gulp-notify");
var babel = require("gulp-babel");
var nib = require("nib");
var react = require("gulp-react");
var assign = require("lodash").assign;

// Browserify ---------------------------------------------

gulp.task("browserify", function() {

  var b = browserify({ standalone: 'gpc.treeview' });
  //b.transform('stylify', { use: [ nib() ] });
  //b.transform('reactify', { extension: 'jsx' });
  b.add('./src/treeview.jsx');

  return b
    .on('error', notify.onError('Error: <%= error.message %>'))
    //.pipe( sourcemaps.init({ loadMaps: true }) )
    .bundle()
    //.pipe( sourcemaps.write('./') )
    //.pipe( buffer() )
    //.pipe(babel() )
    .pipe( source('gpc-treeview.js') ) // TODO: define at top of gulpfile ?
    .pipe( gulp.dest('./dist') )
    .pipe( notify({ message: 'Browserify bundling completed', onLast: true }) )
    .on('log', gutil.log)
});

// Complete build task ------------------------------------

gulp.task('build', ['browserify']);

// Test ---------------------------------------------------

gulp.task('test-browserify', function () {
  
  var opts = assign({}, watchify.args, { paths: ['./src'], debug: true });
  var b = watchify( browserify(opts) );

  b.add('./testpage/src/main.jsx');

  return bundle();
  
  function bundle() {
    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify error on test script') )
      .pipe( source('main.js') )
      .pipe( buffer() )
      .pipe( sourcemaps.init({ loadMaps: true }) ) // loads maps from browserify file
      .pipe( sourcemaps.write('./') )
      .pipe( gulp.dest('./testpage/stage/scripts') )
      .pipe( notify({ message: 'Test script bundling completed', onLast: true }) )
      .on('log', gutil.log);
  }
});

gulp.task("test", ['test-browserify']);

/*, function() {
  // Copy stuff to test directory
  
  return gulp.src('dist/*.js', {base: 'dist/'})
    .pipe( gulp.dest('testpage/scripts/') )
    .pipe( notify({ message: "Test setup task complete", onLast: true }) );
}); */

// Watch and default --------------------------------------

// NOT IN USE
gulp.task('watch', function() {
 
  gulp.watch(['src/**/*.*', 'testpage/src/**/*.*'], ['test']);  
});


gulp.task("default", ['test']);
