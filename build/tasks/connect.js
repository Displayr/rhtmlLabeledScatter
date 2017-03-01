const gulp = require('gulp');
const httpServer = require('http');
const connect = require('connect');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const connectLiveReload = require('connect-livereload');

gulp.task('connect', ['core'], function () {
  const app = connect()
        .use(connectLiveReload({ port: 35729 }))
        .use(serveStatic('browser/internal_www'))
        .use(serveIndex('browser/internal_www'));

  httpServer.createServer(app)
        .listen(9000)
        .on('listening', function () {
          console.log('Started connect web server on http://localhost:9000');
        });
});
