const babelify = require('babelify')
const browserify = require('browserify')
const buffer = require('gulp-buffer')
const fs = require('fs-extra')
const log = require('fancy-log')
const sourcemaps = require('gulp-sourcemaps')
const tap = require('gulp-tap')

module.exports = function ({ gulp, done, entryPoint, compiledContentDestination }) {
  fs.mkdirsSync(compiledContentDestination)

  return gulp.src(entryPoint, { read: false })
    .pipe(tap(function (file) {
      log(`bundling ${file.path}`)

      file.contents = browserify(file.path, { debug: true })
        .transform(babelify, {
          presets: [require('babel-preset-es2015-ie')],
          plugins: [
            require('babel-plugin-transform-exponentiation-operator'),
            require('babel-plugin-transform-object-assign'),
            require('babel-plugin-transform-object-rest-spread'),
            require('babel-plugin-array-includes').default
          ]
        })
        .bundle()
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(compiledContentDestination))
    .on('finish', done)
}
