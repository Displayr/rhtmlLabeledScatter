const Eyes = require('eyes.protractor').Eyes;
// const Eyes = require('eyes.selenium').Eyes;
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const ConsoleLogHandler = require('eyes.sdk').ConsoleLogHandler;

const requiredConfigKeys = [
  'browserWidth',
  'browserHeight',
  'defaultMatchTimeout',
  'pageLoadWaitSeconds',
  'forceFullPageScreenshot',
  'logLevel',
];

function getKey() {
  let applitoolsKey = null;
  const keyFile = path.join(__dirname, '../../', '.keys', 'applitools.key');
  try {
    applitoolsKey = fs.readFileSync(keyFile, 'utf-8');
  } catch (err) {
    console.error(`ERROR: Could not read key file: ${keyFile}`);
    process.exit(1);
  }
  return applitoolsKey;
}

module.exports = {
  getEyes(applitoolsConfig) {
    _(requiredConfigKeys).each((requiredKey) => {
      if (!_.has(applitoolsConfig, requiredKey)) {
        throw new Error(`required applitoolsConfig field ${requiredKey} not specified`);
      }
    });

    const eyes = new Eyes();
    eyes.setApiKey(getKey());
    eyes.setForceFullPageScreenshot(applitoolsConfig.forceFullPageScreenshot);
    eyes.setStitchMode(Eyes.StitchMode.CSS);
    eyes.setDefaultMatchTimeout(applitoolsConfig.defaultMatchTimeout);

    const logLevel = applitoolsConfig.logLevel.toLowerCase();
    const loggingOn = (['info', 'debug'].includes(logLevel));
    const debugLogging = (logLevel === 'debug');

    if (loggingOn) {
      const consoleLogHandler = new ConsoleLogHandler(debugLogging);
      eyes.setLogHandler(consoleLogHandler);
    }

    return eyes;
  },
};
