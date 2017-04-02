
const path = require('path');
const _ = require('lodash');
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
  // specs: [ path.normalize(`${projectRoot}/bdd/features/**/*.feature`) ],
  // baseUrl: 'http://localhost:9000',

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
  // https://github.com/angular/protractor/issues/3491
  // ignoreUncaughtExceptions: true, // don't cause the runner to exit if unknown errors are thrown by chai/cucumber

  onPrepare() {
    const validParams = ['testLabel', 'specFilter'];
    _(validParams).each((validParam) => {
      if (_.has(browser.params, validParam)) {
        testVisualConfig[validParam] = browser.params[validParam];
      }
    });
    global.visualDiffConfig = testVisualConfig;
  },
};
