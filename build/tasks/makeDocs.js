const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('makeDocs', function () {
  return gulp.src('./build/scripts/makeDoc.r', { read: false })
        .pipe(shell(['R --no-save < <%= file.path %>'], {}));
});
