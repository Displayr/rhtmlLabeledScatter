const gulp = require('gulp');
const path = require('path');
const karma = require('karma');

gulp.task('testSpecs', function (done) {
  const Server = karma.Server;
  new Server({
    configFile: path.join(__dirname, '../config/karma.conf.js'),
    singleRun: true,
  }, done).start();
});
