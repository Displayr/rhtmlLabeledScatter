module.exports = function (config) {
  config.set({
    browsers: ['Chrome'],
    basePath: '../../',
    files: [
      'theSrc/scripts/**/*.spec.js',
    ],

    frameworks: ['browserify', 'mocha', 'sinon-chai', 'chai-dom', 'chai', 'sinon'],

    preprocessors: {
      './theSrc/scripts/**/*.spec.js': ['browserify'],
    },

    reporters: ['mocha'],

    browserify: {
      debug: true,
      transform: [['babelify', { presets: ['es2015-ie'], plugins: ['transform-object-assign', 'array-includes'] }]],
    },

    browserConsoleLogOptions: {
      level: 'log',
      terminal: true,
    },
  });
};

