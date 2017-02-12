const gulp = require('gulp');
const gulp_coffee = require("gulp-coffee");


gulp.task('compile-coffee', function () {
    gulp.src('theSrc/scripts/**/*.coffee')
        .pipe(gulp_coffee({ bare: true, header: true }))
        .pipe(gulp.dest('browser/internal_www/scripts'))
        .pipe(gulp.dest('inst/htmlwidgets/'));
});