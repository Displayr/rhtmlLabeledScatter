const path = require('path');
const testVisualConfig = require('../config/testVisual.json');

const projectRoot = path.normalize(`${__dirname}/../../`);

exports.config = {
  directConnect: true,
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  cucumberOpts: {
    format: 'pretty',
    require: [
      path.normalize(`${projectRoot}/bdd/steps/**/*.steps.js`),
    ],
  },
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--test-type',
      ],
    },
    loggingPrefs: {
      driver: 'ALL',
      server: 'ALL',
      browser: 'ALL',
    },
  },
  allScriptsTimeout: 20000,
  getPageTimeout: 20000,
  disableChecks: true,

  onPrepare() {
    global.visualDiffConfig = testVisualConfig;
  },
};
