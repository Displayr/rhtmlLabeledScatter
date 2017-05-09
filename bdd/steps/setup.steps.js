const World = require('../support/world');
const _ = require('lodash');

/* global browser */

// this is duplicated in allTheSteps.js
const isApplitoolsEnabled = () => {
  return !(_.get(browser, 'params.applitools') === 'off');
};


module.exports = function () {
  this.World = World;

  this.Before(function () {
    browser.ignoreSynchronization = true;
    this.context = {};
  });

  this.Before('@applitools', function (scenario) {
    if (isApplitoolsEnabled()) {
      this.eyes.open(
        browser,
        'rhtmlLabelScatter', // TODO pull from widget config
        scenario.getName(),
        {width: global.visualDiffConfig.browserWidth, height: global.visualDiffConfig.browserHeight}
      );
    }
  });

  this.After('@applitools', function () {
    if (isApplitoolsEnabled()) {
      this.eyes.close(false);
    }
  });
};
