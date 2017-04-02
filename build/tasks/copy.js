const gulp = require('gulp');
const rename = require('gulp-rename');

gulp.task('copy', function () {
  gulp.src([
    'theSrc/internal_www/**/*.html',
    'theSrc/internal_www/**/*.css',
  ], {}).pipe(gulp.dest('browser'));

  gulp.src([
    'theSrc/scripts/lib/*.js',
  ], {}).pipe(gulp.dest('browser/internal_www/scripts/lib'));

  gulp.src([
    'theSrc/scripts/lib/*.js',
  ], {}).pipe(gulp.dest('inst/htmlwidgets/lib'));

  gulp.src([
    'theSrc/scripts/data/**/*',
  ], {}).pipe(gulp.dest('browser/internal_www/scripts/data'));

  gulp.src([
    'theSrc/scripts/data/*.js',
  ], {}).pipe(gulp.dest('inst/htmlwidgets/data'));

  gulp.src([
    'theSrc/images/**/*',
  ], {}).pipe(gulp.dest('browser/internal_www/images'));

  gulp.src([
    'theSrc/features/*.json',
  ], {}).pipe(gulp.dest('browser/internal_www/features'));

  gulp.src('theSrc/R/htmlwidget.yaml')
    .pipe(rename(`${gulp.context.widgetName}.yaml`))
    .pipe(gulp.dest('inst/htmlwidgets/'));

  gulp.src('theSrc/R/htmlwidget.R')
    .pipe(rename(`${gulp.context.widgetName}.R`))
    .pipe(gulp.dest('R/'));

  const extLibs = [
    'node_modules/lodash/lodash.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/d3/d3.min.js',
    'node_modules/random-js/lib/random.min.js',
    'node_modules/bluebird/js/browser/bluebird.min.js',
    'node_modules/bignumber.js/bignumber.min.js',
    'node_modules/d3-extended/d3-extended.min.js',
  ];

  gulp.src(extLibs)
    .pipe(gulp.dest('inst/htmlwidgets/lib/'))
    .pipe(gulp.dest('browser/internal_www/external/'));
});
