'use strict';

const widgetName = 'rhtmlLabeledScatter';

const _ = require('lodash');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const Promise = require('bluebird');
const fs =Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const cliArgs = require('yargs').argv;

gulp.task('default', function () {
  gulp.start('build');
});

gulp.task('core', ['compile-coffee', 'less', 'copy', 'buildContentManifest']);
gulp.task('build', ['core', 'makeDocs', 'makeExample']);

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

//@TODO clean doesn't finish before next task so I have left it out of build pipeline for now ..
gulp.task('clean', function(done) {
  const locationsToDelete = ['browser', 'inst', 'man', 'R', 'examples'];
  const deletePromises = locationsToDelete.map(function(location) { return fs.removeAsync(location); });
  Promise.all(deletePromises).then(done);
  return true;
});

gulp.task('makeDocs', function () {
  var shell = require('gulp-shell');
  return gulp.src('./build/makeDoc.r', {read: false})
    .pipe(shell(['R --no-save < <%= file.path %>', ], {}))
});

gulp.task('makeExample', function (done) {
  var generateR = require('./build/generateExamplesInR.js');
  fs.mkdirpAsync('examples')
    .then(function () { return fs.readFileAsync('theSrc/features/features.json', { encoding: 'utf8' }) })
    .then(JSON.parse)
    .then(generateR)
    .then(function (content) { return fs.writeFileAsync('examples/features.R', content, { encoding: 'utf8' }) })
    .catch( function(err) { console.log("makeExample error: " + err)})
    .then(done);
})

gulp.task('less', function () {
  var less = require('gulp-less');
  return gulp.src('theSrc/styles/**/*.less')
    .pipe(less({}))
    .pipe(gulp.dest('browser/internal_www/styles'))
    .pipe(gulp.dest('inst/htmlwidgets/lib/style'));
});

gulp.task('compile-coffee', function () {
  var gulp_coffee = require("gulp-coffee");

  gulp.src('theSrc/scripts/**/*.coffee')
    .pipe(gulp_coffee({ bare: true, header: true }))
    .pipe(gulp.dest('browser/internal_www/scripts'))
    .pipe(gulp.dest('inst/htmlwidgets/'));
});

gulp.task('copy', function () {
  gulp.src([
    'theSrc/**/*.html'
  ], {}).pipe(gulp.dest('browser'));

  gulp.src([
    'theSrc/scripts/lib/*.js'
  ], {}).pipe(gulp.dest('browser/internal_www/scripts/lib'));

  gulp.src([
    'theSrc/scripts/lib/*.js'
  ], {}).pipe(gulp.dest('inst/htmlwidgets/lib'));

  gulp.src([
    'theSrc/scripts/data/*.js'
  ], {}).pipe(gulp.dest('browser/internal_www/scripts/data'));

  gulp.src([
    'theSrc/scripts/data/*.js'
  ], {}).pipe(gulp.dest('inst/htmlwidgets/data'));

  gulp.src([
    'theSrc/images/**/*'
  ], {}).pipe(gulp.dest('browser/internal_www/images'));

  gulp.src([
    'theSrc/features/*.json'
  ], {}).pipe(gulp.dest('browser/internal_www/features'));

  var rename = require('gulp-rename');
  gulp.src('theSrc/R/htmlwidget.yaml')
    .pipe(rename(widgetName + '.yaml'))
    .pipe(gulp.dest('inst/htmlwidgets/'));

  gulp.src('theSrc/R/htmlwidget.R')
    .pipe(rename(widgetName + '.R'))
    .pipe(gulp.dest('R/'));

  var extLibs = [
    'node_modules/lodash/lodash.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/d3/d3.min.js',
    'node_modules/random-js/lib/random.min.js',
    'node_modules/bluebird/js/browser/bluebird.min.js',
    'node_modules/bignumber.js/bignumber.min.js',
    'node_modules/d3-extended/d3-extended.min.js'
  ];

  gulp.src(extLibs)
    .pipe(gulp.dest('inst/htmlwidgets/lib/'))
    .pipe(gulp.dest('browser/internal_www/external/'))

});

gulp.task('connect', ['core'], function () {
  const serveStatic = require('serve-static');
  const serveIndex = require('serve-index');
  const app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('browser/internal_www'))
    .use(serveIndex('browser/internal_www'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes in the browser directory and reload chrome on changes
  gulp.watch([
    'browser/**/*',
  ]).on('change', $.livereload.changed);

  // when these files change then do this,
  // for example when the json file changes rerun the copy command
  gulp.watch('resources/**/*.json', ['copy']);
  gulp.watch('theSrc/**/*.html', ['copy']);
  gulp.watch('theSrc/images/**/*', ['copy']);
  gulp.watch('theSrc/styles/**/*.less', ['less']);
  gulp.watch('theSrc/scripts/**/*.coffee', ['compile-coffee']);
  gulp.watch('theSrc/scripts/lib/*.js', ['copy']);
  gulp.watch('theSrc/R/*.R', ['copy', 'makeDocs', 'makeExample']);
  gulp.watch('theSrc/R/*.yaml', ['copy', 'makeDocs', 'makeExample'])
});


// Testing Visual--------------------------------------
const buildContentManifest = require('./build/scripts/buildContentManifest');
const gutil = require('gulp-util');
const stream = require('stream');

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

gulp.task('buildContentManifest', function () {
    const contentManifest = buildContentManifest();
    return stringSrc('contentManifest.json', JSON.stringify(contentManifest, {}, 2))
        .pipe(gulp.dest('browser/internal_www/content'));
});

gulp.task('webdriverUpdate', $.protractor.webdriver_update);

function runProtractor(done) {
    const args = [];
    if (cliArgs.testLabel) {
        args.push(`--params.testLabel=${cliArgs.testLabel}`);
    } else {
        args.push('--params.testLabel=Default');
    }

    if (cliArgs.specFilter) {
        args.push(`--params.specFilter=${cliArgs.specFilter}`);
    }

    gulp.src(['build/scripts/testVisual.js', 'theSrc/visualRegression/*.js'])
        .pipe($.protractor.protractor({
            configFile: path.join(__dirname, '/build/config/protractor.conf.js'),
            args,
        }))
        .on('error', function (err) {
            throw err;
        })
        .on('end', function () {
            done();
        })
        .pipe($.exit());
}

gulp.task('testVisual', ['webdriverUpdate', 'connect'], runProtractor);
// NB p_skip skips the webdriver download step - it is downloading gecko drivers every time (30MB / run)
// TODO - need to detect which browser drivers are required - probavbly in protractor conf
gulp.task('testVisual_s', runProtractor);


