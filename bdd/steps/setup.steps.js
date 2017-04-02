const World = require('../support/world');

module.exports = function () {
  this.World = World;

  this.Before(function() {
    browser.ignoreSynchronization = true;
    this.context = {};
  });

  this.Before('@applitools', function (scenario) {
    this.eyes.open(
      browser,
      'rhtmlLabelScatter', //TODO pull from widget config
      scenario.getName(),
      { width: global.visualDiffConfig.browserWidth, height: global.visualDiffConfig.browserHeight }
    );
  });

  this.After('@applitools', function() {
    console.log('closing eyes');
    this.eyes.close(false);
  });
};
