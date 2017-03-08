const gulp = require('gulp');
const gulpCoffee = require('gulp-coffee');


gulp.task('compile-coffee', function () {
  gulp.src('theSrc/scripts/**/*.coffee')
    .pipe(gulpCoffee({ bare: true, header: true }))
    .pipe(gulp.dest('browser/internal_www/scripts'))
    .pipe(gulp.dest('inst/htmlwidgets/'));
});
