const path = require('path')
const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['testVisual', 'testVisual_s', 'serve']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })

const shell = require('shelljs')
const jestSnapshotTests = () => {
  return function (done) {
    const testPath = path.join(__dirname, '/theSrc/test/')

    /* --ci=0 allows new snapshots to be written while in travisci
     * jest auto detects travis ci and changes behaviour
     * new snapshots are not written in --ci mode
     * we have different snapshot dirs for local vs ci as the snapshots are slightly different in travis` linux ci.
     */
    return shell.exec(`jest ${testPath} --ci=0`, { async: true }, (exitCode) => {
      const error = (exitCode === 0) ? null : new Error(`jest ${testPath} failed with code ${exitCode}`)
      done(error)

      /* connect is leaving the server running, so gulp will not exit. This is a hacky way of getting gulp to exit and maintaining the test exit code
       * Main issue I can see with this approach is that now jestSnapshotTests MUST be the last task to run
       * Note that runProtractor.js (in rhtmlBuildUtils) handled this by properly using gulp streams and then piping to gulpExit
       */
      setTimeout(() => {
        process.exit(exitCode)
      }, 200)
    })
  }
}

const copyExperimentSnapshots = (gulp) => {
  return function (done) {
    let finishedCount = 0
    const requiredCount = 2
    const incrementFinishedCount = () => finishedCount++

    gulp.src([
      'theSrc/test/experiments/**/*'
    ], {})
      .pipe(gulp.dest('browser/experiments'))
      .on('finish', incrementFinishedCount)

    gulp.src([
      'theSrc/test/experiments/ui/**/*'
    ], {})
      .pipe(gulp.dest('browser/experiments/ui'))
      .on('finish', incrementFinishedCount)

    const intervalHandle = setInterval(() => {
      if (finishedCount >= requiredCount) {
        clearInterval(intervalHandle)
        done()
      }
    }, 20)
  }
}

gulp.task('compileExperimentList', require('./build/tasks/compileExperimentList')(gulp))
gulp.task('compileSnapshotList', require('./build/tasks/compileSnapshotList')(gulp))
gulp.task('compileSnapshotComparison', require('./build/tasks/compileSnapshotComparison')(gulp))
gulp.task('compileCrossExperimentSnapshotComparison', require('./build/tasks/compileCrossExperimentSnapshotComparison')(gulp))
gulp.task('compileCrossExperimentSnapshotList', require('./build/tasks/compileCrossExperimentSnapshotList')(gulp))
gulp.task('copyExperimentSnapshots', copyExperimentSnapshots(gulp))
gulp.task('jestSnapshotTests', jestSnapshotTests(gulp))
gulp.task('testVisual', gulp.series('core', 'compileInternal', 'connect', 'jestSnapshotTests'))
gulp.task('testVisual_s', gulp.series('jestSnapshotTests'))

const newServeSequence = [
  'copyExperimentSnapshots',
  'compileExperimentList',
  'compileSnapshotList',
  'compileSnapshotComparison',
  'compileCrossExperimentSnapshotComparison',
  'compileCrossExperimentSnapshotList',
  ...rhtmlBuildUtils.taskSequences.serve
]

gulp.task('serve', gulp.series(...newServeSequence))
