"use strict";

var gulp = require("gulp");
var gutil = require("gulp-util");
//var plumber = require("gulp-plumber");
var sourcemaps = require('gulp-sourcemaps');
var jade = require("gulp-jade");
var stylus = require("gulp-stylus");
var browserify = require('browserify');
var watchify = require('watchify');
var transform = require("vinyl-transform");
var source = require("vinyl-source-stream");
var buffer = require('vinyl-buffer');
var notify = require("gulp-notify");
var babel = require("gulp-babel");

// Jade ---------------------------------------------------

gulp.task('jade', [], function() {
  
  return gulp.src('src/**/*.jade', {base: 'src/'})
    .pipe( jade({pretty: true}) )
    .pipe( gulp.dest('./dist') )
    .pipe( notify("Jade task complete") );
});

// Browserify ---------------------------------------------

gulp.task("browserify", function() {

  var b = browserify({ standalone: 'gpc.treeview' });
  b.add('./src/main.js');

  return b.bundle()
    .on('error', notify.onError('Error: <%= error.message %>') )
    .pipe(source('gpc-treeview.js')) // TODO: define at top of gulpfile ?
    .pipe(buffer())
    //.pipe(babel())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
    .pipe(notify({ message: 'Browserify bundling completed', onLast: true }))
    .on('log', gutil.log)
});

// CSS ----------------------------------------------------

gulp.task('css', function() {

  return gulp.src('./src/**/*.styl')
    .pipe( stylus( { whitespace: true } ) )
    //.pipe( csso() )
    .pipe( gulp.dest('./dist/') )
    //.pipe( livereload( server ))
    .pipe( notify('CSS task complete') )
});

// Copy ---------------------------------------------------

gulp.task("copy", [], function() {
  
  return gulp.src('src/**/*.css', {base: 'src/'})
    .pipe( gulp.dest('./dist') )
    .pipe( notify("Copy task complete") );
});

// Complete build task ------------------------------------

gulp.task('build', ['jade', 'browserify', 'css']);

// Test ---------------------------------------------------

gulp.task("test", ['build'], function() {
  // Copy stuff to test directory
  
  return gulp.src('dist/*.js', {base: 'dist/'})
    .pipe( gulp.dest('testpage/scripts/') )
    .pipe( notify("Test setup task complete") );
});

// Watch and default --------------------------------------

gulp.task('watch', function() {
 
  gulp.watch('src/**/*.jade', ['test']);
  gulp.watch('src/**/*.js', ['test']);  
  gulp.watch('src/**/*.styl', ['test']);
  //gulp.watch('src/**/*.css', ['copy']); // TODO: get rid 
});

gulp.task("default", ['test', 'watch']);
