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
    gulp.watch('resources/**/*.json', ['copy']);
    gulp.watch('theSrc/**/*.html', ['copy']);
    gulp.watch('theSrc/images/**/*', ['copy']);
    gulp.watch('theSrc/styles/**/*.less', ['less']);
    gulp.watch('theSrc/scripts/**/*.coffee', ['compile-coffee']);
    gulp.watch('theSrc/scripts/lib/*.js', ['copy']);
    gulp.watch('theSrc/R/*.R', ['copy', 'makeDocs', 'makeExample']);
    gulp.watch('theSrc/R/*.yaml', ['copy', 'makeDocs', 'makeExample'])
});
