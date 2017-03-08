const gulp = require('gulp');
const buildContentManifest = require('../scripts/buildContentManifest.js');
const gutil = require('gulp-util');
const stream = require('stream');

function stringSrc(filename, string) {
  const src = stream.Readable({ objectMode: true });
  src._read = function () {
    this.push(new gutil.File({
      cwd: '',
      base: '',
      path: filename,
      contents: new Buffer(string),
    }));
    this.push(null);
  };
  return src;
}

gulp.task('buildContentManifest', function () {
  const contentManifest = buildContentManifest();
  return stringSrc('contentManifest.json', JSON.stringify(contentManifest, {}, 2))
        .pipe(gulp.dest('browser/content'));
});
