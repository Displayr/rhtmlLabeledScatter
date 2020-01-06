const path = require('path')
const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['testVisual', 'testVisual_s']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })

const shell = require('shelljs')
const jestSnapshotTests = () => {
  return function (done) {
    const testPath = path.join(__dirname, '/theSrc/test/')
    return shell.exec(`jest ${testPath}`, { async: true }, (exitCode) => {
      const error = (exitCode === 0) ? null : new Error(`stateInteractions.jest.test.js failed with code ${exitCode}`)
      done(error)

      // connect is leaving the server running, so gulp will not exit. This is a hacky way of getting gulp to exit and maintaining the test exit code
      // Main issue I can see with this approach is that now jestSnapshotTests MUST be the last task to run
      // Note that runProtractor.js (in rhtmlBuildUtils) handled this by properly using gulp streams and then piping to gulpExit
      setTimeout(() => {
        process.exit(exitCode)
      }, 200)
    })
  }
}

gulp.task('jestSnapshotTests', jestSnapshotTests(gulp))
gulp.task('testVisual', gulp.series('core', 'compileInternal', 'connect', 'jestSnapshotTests'))
gulp.task('testVisual_s', gulp.series('jestSnapshotTests'))
