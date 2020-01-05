const path = require('path')
const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['testVisual', 'testVisual_s']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })

const shell = require('shelljs')
const interactionTestSuite = () => {
  return function (done) {
    const testPath = path.join(__dirname, '/bdd/features/stateInteractions.jest.test.js')
    return shell.exec(`jest ${testPath}`, { async: true }, (exitCode) => {
      const error = (exitCode === 0) ? null : new Error(`stateInteractions.jest.test.js failed with code ${exitCode}`)
      done(error)

      // connect is leaving the server running, so gulp will not exit. This is a hacky way of getting gulp to exit and maintaining the test exit code
      // Main issue I can see with this approach is that now interactionTestSuite MUST be the last task to run
      // Note that runProtractor.js (in rhtmlBuildUtils) handled this by properly using gulp streams and then piping to gulpExit
      setTimeout(() => {
        process.exit(exitCode)
      }, 200)
    })
  }
}

gulp.task('interactionTestSuite', interactionTestSuite(gulp))
gulp.task('testInteraction', gulp.series('core', 'compileInternal', 'connect', 'interactionTestSuite'))
gulp.task('testInteractionStandAlone', gulp.series('interactionTestSuite'))
