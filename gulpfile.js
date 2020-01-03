const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['testVisual', 'testVisual_s']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })

const taskSequences = {
  interaction: [ 'core', 'compileInternal', 'connect', 'interactionTestSuite' ],
  interactionStandAlone: [ 'interactionTestSuite' ],
}


const shell = require('shelljs')
const interactionTestSuite = (gulp) => {
  return function (done) {
    const exitCode = shell.exec('jest /Users/kyle/projects/numbers/scatter/bdd/features/stateInteractions.jest.test.js').code
    const error = (exitCode === 0) ? null : new Error(`make docs failed with code ${exitCode}`)
    done(error)
  }
}

gulp.task('interactionTestSuite', interactionTestSuite(gulp))
gulp.task('interactionStandAlone', gulp.series(...taskSequences.interactionStandAlone))
gulp.task('interaction', gulp.series(...taskSequences.interaction))

