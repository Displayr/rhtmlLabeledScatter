'use strict';

const gulp = require('gulp');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));

fs.readdirSync('./build/tasks').filter(function(file) {
    return (/\.js$/i).test(file);
}).map(function(file) {
    require(`./build/tasks/${file}`);
});

gulp.task('default', function () {
  gulp.start('build');
});

gulp.task('core', ['compile-coffee', 'less', 'copy', 'buildContentManifest']);
gulp.task('build', ['core', 'makeDocs', 'makeExample']);

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});


