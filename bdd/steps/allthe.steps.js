const request = require('request-promise');
const ScatterPlot = require('../pageObjects/scatterPlot');

// without this cucumber is not logging errors when steps fail which makes debugging painful
// think this has to do with Applitools but dont really understand ...
const wrapInPromiseAndLogErrors = function (fn) {
  return new Promise((resolve, reject) => {
    fn().then(resolve)
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  }).catch((err) => {
    console.log(err);
    throw err;
  });
};

const loadPage = function ({ configName, stateName, inputWidth, inputHeight }) {
  this.context.scatterPlot = new ScatterPlot({ configName, stateName, inputWidth, inputHeight });
  return this.context.scatterPlot.load();
};

module.exports = function () {
  this.setDefaultTimeout(180 * 1000);

  this.Given(/^I am viewing "([^"]+)"$/, function (configName) {
    this.context.configName = configName;
    return loadPage.bind(this)({ configName });
  });

  this.Given(/^I am viewing "([^"]+)" with state "([^"]+)"$/, function (configName, stateName) {
    this.context.configName = configName;
    return loadPage.bind(this)({ configName, stateName });
  });

  this.Given(/^I am viewing "([^"]+)" with state "([^"]+)" and dimensions ([0-9]+)x([0-9]+)$/, function (configName, stateName, inputWidth, inputHeight) {
    this.context.configName = configName;
    return loadPage.bind(this)({ configName, stateName, inputWidth, inputHeight });
  });

  this.Given(/^I am viewing "([^"]+)" with dimensions ([0-9]+)x([0-9]+)$/, function (configName, inputWidth, inputHeight) {
    this.context.configName = configName;
    return loadPage.bind(this)({ configName, inputWidth, inputHeight });
  });

  this.Then(/^the "(.*)" snapshot matches the baseline$/, function (snapshotName) {
    const selectorExpression = '.scatterplot';
    return wrapInPromiseAndLogErrors(() => {
      return this.eyes.checkRegionBy(by.css(selectorExpression), snapshotName);
    });
  });

  this.When(/^I drag label (.+) by (-?[0-9]+) x (-?[0-9]+)$/, function (labelId, xMovement, yMovement) {
    return wrapInPromiseAndLogErrors(() => {
      this.context.scatterPlot.plotLabel(labelId).getLocation().then((locationObject) => {
        this.context.initialLocation = locationObject;
        this.context.expectedOffset = {
          x: parseInt(xMovement),
          y: parseInt(yMovement),
        };
      });

      return browser.actions()
        .mouseMove(this.context.scatterPlot.plotLabel(labelId))
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform();
    });
  });

  this.When(/^I drag label (.+) to the legend$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(this.context.scatterPlot.plotLabel(labelId))
        .mouseDown()
        .mouseMove(this.context.scatterPlot.legendGroup)
        .mouseUp()
        .perform();
    });
  });

  this.When(/^I drag legend label (.+) to the canvas$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(this.context.scatterPlot.legendLabel(labelId))
        .mouseDown()
        .mouseMove({ x: -300, y: 0 })
        .mouseUp()
        .perform();
    });
  });

  this.Then(/^label (.+) should stay in the new location$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      return this.context.scatterPlot.plotLabel(labelId).getLocation().then((locationObject) => {
        const expectedX = this.context.initialLocation.x + this.context.expectedOffset.x;
        this.expect(locationObject.x, 'Incorrect new x coordinate').to.be.closeTo(expectedX, 2);

        const expectedY = this.context.initialLocation.y + this.context.expectedOffset.y;
        this.expect(locationObject.y, 'Incorrect new y coordinate').to.be.closeTo(expectedY, 2);
      });
    });
  });

  this.Then(/^label (.+) should be in the legend$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      this.context.scatterPlot.legendGroup.getLocation().then((legendLocation) => {
        this.context.legendLocation = legendLocation;
      });

      return this.context.scatterPlot.legendLabel(labelId).getLocation().then((labelLocation) => {
        this.expect(labelLocation.x, 'Incorrect new x coordinate').to.be.closeTo(this.context.legendLocation.x, 100);
        this.expect(labelLocation.y, 'Incorrect new y coordinate').to.be.closeTo(this.context.legendLocation.y, 100);
      });
    });
  });

  this.Then(/^label (.+) should be near the circle anchor (.+)/, function (labelId, anchorId) {
    return wrapInPromiseAndLogErrors(() => {
      const anchorLocationPromise = this.context.scatterPlot.circleAnchor(anchorId).getLocation();
      const labelLocationPromise = this.context.scatterPlot.plotLabel(labelId).getLocation();

      return Promise.all([anchorLocationPromise, labelLocationPromise]).then(([anchorLocation, labelLocation]) => {
        // TODO 105 is enough tolerance such that the top left of a 100x100 image will be "close enough" to its anchor
        // TODO fix this to calc image tolerance based on bounding rect so we dont hard code such a large value
        this.expect(labelLocation.x, 'Incorrect new x coordinate').to.be.closeTo(anchorLocation.x, 105);
        this.expect(labelLocation.y, 'Incorrect new y coordinate').to.be.closeTo(anchorLocation.y, 105);
      });
    });
  });

  this.Then(/^the final state callback should match "(.*)"$/, function (expectedStateFile) {
    if (!this.context.configName) {
      throw new Error('Cannot state match without configName');
    }

    return wrapInPromiseAndLogErrors(() => {
      const expectedStateUrl = `http://localhost:9000/internal_www/scripts/data/${this.context.configName}/${expectedStateFile}.json`;
      const expectedStatePromise = request(expectedStateUrl).then(JSON.parse);
      const actualStatePromise = this.context.scatterPlot.getRecentState();

      return Promise.all([actualStatePromise, expectedStatePromise]).then(([actualState, expectedState]) => {
        const errorMessageOnFail = `
Expected:
${JSON.stringify(expectedState, {}, 2)}
Actual:
${JSON.stringify(actualState, {}, 2)}
`;
        this.expect(actualState, errorMessageOnFail).to.deep.equal(expectedState);
      });
    });
  });

  this.When(/^Sleep ([0-9]+)$/, function (sleepSeconds) {
    return browser.sleep(sleepSeconds * 1000);
  });

  this.When(/^I take all the snapshots on the page "(.*)"$/, function (contentPath) {

    function loadContentPage(_contentPath) {
      browser.get(`http://localhost:9000${_contentPath}`);
      const plotContainerPresentPromise = browser.wait(browser.isElementPresent(by.css('.plot-container')));
      const errorContainerPresentPromise = browser.wait(browser.isElementPresent(by.css('.rhtml-error-container')));
      return Promise.all([plotContainerPresentPromise, errorContainerPresentPromise]).then((isPresentResults) => {
        return (isPresentResults[0] || isPresentResults[1])
          ? Promise.resolve()
          : Promise.reject(new Error(`Fail to load http://localhost:9000${_contentPath}.`));
      });
    }

    function takeSnapshots() {
      const donePromises = element.all(by.css('[snapshot-name]')).each((element) => {
        return element.getAttribute('snapshot-name').then((snapshotName) => {
          if (snapshotName) {
            console.log(`take snapshot ${contentPath} ${snapshotName} (css '[snapshot-name="${snapshotName}"]')`);
            return this.eyes.checkRegionBy(by.css(`[snapshot-name="${snapshotName}"]`), snapshotName);
          } else {
            console.error(`snapshot on page ${contentPath} missing snapshot name`);
            return Promise.resolve();
          }
        });
      });
      return donePromises.then(() => {
        console.log(`done taking snapshots on ${contentPath}`);
      });
    }

    return wrapInPromiseAndLogErrors(() => {
      return loadContentPage(contentPath)
        .then(takeSnapshots.bind(this))
    });
  });
};
