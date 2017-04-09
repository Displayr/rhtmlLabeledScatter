const gulp = require('gulp');
const _ = require('lodash');
const fs = require('fs-extra');
const opn = require('opn');
const runSequence = require('run-sequence');
const widgetConfig = require('./build/config/widget.config.json');

if (!_.has(gulp, 'context')) {
  gulp.context = {
    widgetName: widgetConfig.widgetName,
  };
} else {
  console.error('Unexpected build failure. gulp already has a context.');
  process.exit(1);
}

fs.readdirSync('./build/tasks').filter(function (file) {
  return (/\.js$/i).test(file);
}).map(function (file) {
  /* eslint-disable global-require */
  return require(`./build/tasks/${file}`);
  /* eslint-enable global-require */
});

gulp.task('default', function () {
  gulp.start('build');
});

gulp.task('build', function (done) {
  runSequence('core', ['makeDocs', 'makeExample'], done);
});

gulp.task('core', function (done) {
  runSequence('clean', ['compile-coffee', 'less', 'copy', 'buildContentManifest'], done);
});

gulp.task('serve', function () {
  runSequence('core', ['compileRenderContentPage', 'compileRenderIndexPage'], 'watch', function () {
    opn('http://localhost:9000');
  });
});
