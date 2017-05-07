const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

    // watch for changes in the browser directory and reload chrome on changes
  gulp.watch([
    'browser/**/*',
  ]).on('change', $.livereload.changed);

    // when these files change then do this,
    // for example when the json file changes rerun the copy command
  gulp.watch('theSrc/internal_www/**/*', ['copy']);
  gulp.watch('theSrc/styles/**/*.less', ['less']);
  gulp.watch('theSrc/scripts/**/*.js', ['compileES6ToInst', 'compileRenderContentPage']);
  gulp.watch('theSrc/scripts/data/**/*', ['copy']);
});
