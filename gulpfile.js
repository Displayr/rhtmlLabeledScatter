/* jshint node:true */
'use strict';
// generated on 2015-01-10 using generator-gulp-webapp 0.2.0

var widgetName = 'rhtmlLabeledScatter';

var _ = require('lodash');
var gulp = require('gulp');
var random = require('random-js');
var $ = require('gulp-load-plugins')();
var fs = require('fs-extra');
var runSequence = require('run-sequence');
var less = require('gulp-less');
var rename = require('gulp-rename');

gulp.task('clean', function(cb) {
  fs.remove('browser', cb);
  fs.remove('R', cb);
  fs.remove('inst', cb);
});

gulp.task('less', function () {
  return gulp.src('theSrc/styles/**/*.less')
    .pipe(less({}))
    .pipe(gulp.dest('browser/styles'))
    .pipe(gulp.dest('inst/htmlwidgets/lib/style'));
});

gulp.task('compile-coffee', function () {
  var gulp_coffee = require("gulp-coffee");

  gulp.src('theSrc/scripts/rhtmlMoonPlot.coffee')
    .pipe(gulp_coffee({ bare: true }))
    .pipe(gulp.dest('browser/scripts'))
    .pipe(gulp.dest('inst/htmlwidgets/'));

  gulp.src('theSrc/scripts/lib/*.coffee')
    .pipe(gulp_coffee({ bare: true }))
    .pipe(gulp.dest('browser/scripts'))
    .pipe(gulp.dest('inst/htmlwidgets/lib/rhtmlMoonPlot/'));
});

gulp.task('copy', function () {
  gulp.src([
    'theSrc/**/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('browser'));

  gulp.src([
    'theSrc/scripts/lib/labeler.js'
  ], {
    dot: true
  }).pipe(gulp.dest('browser/scripts'))
  .pipe(gulp.dest('inst/htmlwidgets/lib/rhtmlMoonPlot'));

  gulp.src([
    'bower_components/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest('browser/bower_components'));

  gulp.src([
    'theSrc/R/**/*.R'
  ], {
    dot: true
  }).pipe(gulp.dest('R'));

  gulp.src('theSrc/htmlwidget.yaml')
    .pipe(rename(widgetName + '.yaml'))
    .pipe(gulp.dest('inst/htmlwidgets/'));

  gulp.src(['DESCRIPTION', 'NAMESPACE'])
    .pipe(gulp.dest(''));


  gulp.src([
    'man/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest('man'));

  var extLibs = [
    {
      src: 'bower_components/d3-extended/d3-extended.min.js',
      dest: 'inst/htmlwidgets/lib/d3-extended/'
    },
    {
      src: 'bower_components/lodash/dist/lodash.min.js',
      dest: 'inst/htmlwidgets/lib/lodash-2.4.2/'
    },
    {
      src: 'bower_components/jquery/dist/jquery.min.js',
      dest: 'inst/htmlwidgets/lib/jquery-2.2.1/'
    },
    {
      src: 'bower_components/d3/d3.min.js',
      dest: 'inst/htmlwidgets/lib/d3/'
    },
    {
      src: 'bower_components/victor/build/victor.min.js',
      dest: 'inst/htmlwidgets/lib/victor/'
    },
    {
      src: 'bower_components/random/lib/random.min.js',
      dest: 'inst/htmlwidgets/lib/random/'
    }
  ]

  _.forEach(extLibs, function(extLib) {
    gulp.src([
      extLib.src
    ], {
      dot: true
    }).pipe(gulp.dest(extLib.dest));
  });

});

gulp.task('connect', ['build'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('browser'))
    .use(serveIndex('browser'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('theSrc/index.html')
    .pipe(wiredep({exclude: ['bootstrap-sass-official']}))
    .pipe(gulp.dest('src'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'browser/**/*',
  ]).on('change', $.livereload.changed);

  gulp.watch('theSrc/R/rhtmlMoonPlot.R', ['copy']);
  gulp.watch('htmlwidget.yaml', ['copy']);
  gulp.watch('theSrc/**/*.html', ['copy']);
  gulp.watch('theSrc/scripts/**/*.js', ['copy']);
  gulp.watch('theSrc/images/**/*', ['images']);
  gulp.watch('theSrc/styles/**/*.less', ['less']);
  gulp.watch('theSrc/scripts/**/*.coffee', ['compile-coffee']);

});

//clean doesn't finish before next task ..
//gulp.task('build', ['clean', 'wiredep', 'images', 'fonts', 'styles', 'copy'], function () {
gulp.task('build', ['compile-coffee', 'less', 'copy'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', function () {
  gulp.start('build');
});
