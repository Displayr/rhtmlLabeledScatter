const gulp = require('gulp');
const path = require('path');
const $ = require('gulp-load-plugins')();
const cliArgs = require('yargs').argv;
const runSequence = require('run-sequence');
const _ = require('lodash');

gulp.task('webdriverUpdate', $.protractor.webdriver_update);

gulp.task('runProtractor', function (done) {
  const args = [];
  if (cliArgs.testLabel) {
    args.push(`--params.testLabel=${cliArgs.testLabel}`);
  } else {
    args.push('--params.testLabel=Default');
  }

  // --cucumberOpts.tags @a,@b to run scenarios marked @a or @b
  // --cucumberOpts.tags @a --cucumberOpts.tags @b to run scenarios marked @a and @b
  if (cliArgs.tags) {
    const tags = (_.isArray(cliArgs.tags)) ? cliArgs.tags : [cliArgs.tags];
    _(tags).each(tag => args.push(`--cucumberOpts.tags=${tag}`));
  }

  gulp.src(['.tmp/snapshots.feature', 'bdd/features/stateInteractions.feature'])
    .pipe($.protractor.protractor({
      configFile: path.join(__dirname, '../config/protractor.conf.js'),
      args,
    }))
    .on('error', function (err) {
      console.error(err);
      throw err;
    })
    .on('end', function () {
      done();
    })
    .pipe($.exit());
});

gulp.task('testVisual', function (done) {
  runSequence(['core', 'webdriverUpdate'], ['connect', 'buildSnapshotsFeatureFile'], 'runProtractor', done);
});


// NB p_skip skips the webdriver download step - it is downloading gecko drivers every time (30MB / run)
// TODO - need to detect which browser drivers are required - probably in protractor conf
gulp.task('testVisual_s', ['runProtractor']);
