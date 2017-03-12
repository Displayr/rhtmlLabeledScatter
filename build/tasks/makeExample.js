const gulp = require('gulp');
const generateR = require('../generateExamplesInR.js');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs-extra'));

gulp.task('makeExample', function (done) {
  fs.mkdirpAsync('examples')
        .then(function () { return fs.readFileAsync('theSrc/features/features.json', { encoding: 'utf8' }); })
        .then(JSON.parse)
        .then(generateR)
        .then(function (content) { return fs.writeFileAsync('examples/features.R', content, { encoding: 'utf8' }); })
        .catch(function (err) { console.log(`makeExample error: ${err}`); })
        .then(done);
});
