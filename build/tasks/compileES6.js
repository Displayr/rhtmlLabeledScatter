
const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const gutil = require('gulp-util');
const tap = require('gulp-tap');
const buffer = require('gulp-buffer');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

gulp.task('compileES6', function () {
  return gulp.src('theSrc/scripts/**/*.es6.js', { read: false })
    .pipe(tap(function (file) {
      gutil.log(`bundling ${file.path}`);

      const matches = file.path.match(/([^/]+)\.es6.js$/)
      if (!matches) {
        throw new Error(`Could not extract export target from ${file.path}`);
      }
      const exportTarget = matches[1];

      file.contents = browserify(file.path, { debug: true, standalone: exportTarget })
        .transform(babelify, {
          presets: ['es2015-ie'],
          plugins: [
            'transform-object-assign',
            'array-includes',
            'babel-plugin-transform-exponentiation-operator',
          ],
        })
        .bundle();
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(rename(function (path) {
      const newFileName = path.basename.replace('.es6', '');
      path.basename = newFileName;
    }))
    .pipe(gulp.dest('browser/internal_www/scripts'))
    .pipe(gulp.dest('inst/htmlwidgets'));
});
