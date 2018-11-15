const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['core']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })

gulp.task('bootstrap-copy', function () {
  const internalWebServerDependencies = [
    'node_modules/bootstrap/dist/js/bootstrap.min.js'
  ]

  gulp.src(internalWebServerDependencies)
      .pipe(gulp.dest('browser/internal_www/external/'))
})
gulp.task('core', ['less', 'copy', 'bootstrap-copy'])
