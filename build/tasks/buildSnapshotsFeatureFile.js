/*
 * This file generates .tmp/snapshots.feature.
 * The snapshots.feature file tells protractor to take snapshots of all the html files in
 *  the content area that have at least one snapshot defined.
 */

const gulp = require('gulp');
const shell = require('shelljs');
const _ = require('lodash');
const path = require('path');
const gutil = require('gulp-util');
const stream = require('stream');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs-extra'));

function stringSrc(filename, string) {
  const src = stream.Readable({ objectMode: true });
  src._read = function () {
    this.push(new gutil.File({
      cwd: '',
      base: '',
      path: filename,
      contents: new Buffer(string),
    }));
    this.push(null);
  };
  return src;
}

const contentPath = path.join(__dirname, '..', '..', 'browser', 'content');
const tmpDir = path.join(__dirname, '..', '..', '.tmp');

gulp.task('buildSnapshotsFeatureFile', function () {
  const contentFilesWithSnapshots = shell.grep('-l', 'snapshot-name=', `${contentPath}/**/*.html`)
    .split('\n')
    .filter(candidatePath => candidatePath.length > 0);

  let featureFileContents = `
Feature: Take Snapshots in Content Directory
`;

  const scenarioStrings = contentFilesWithSnapshots.map( (contentFileAbsolutePath) => {
    const scenarioUrl = contentFileAbsolutePath.substr(contentFileAbsolutePath.indexOf('browser') + 'browser'.length);
    return [
      '',
      '',
      '  @applitools',
      `  Scenario: ${scenarioUrl}`,
      `  When I take all the snapshots on the page "${scenarioUrl}"`,
    ].join('\n');
  });

  featureFileContents += scenarioStrings.join('');
  featureFileContents += '\n';

  return fs.mkdirpAsync(tmpDir)
    .then(() => {
      fs.writeFileAsync(path.join(tmpDir, 'snapshots.feature'), featureFileContents, 'utf-8')
    });
});
