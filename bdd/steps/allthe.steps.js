const _ = require('lodash');
const request = require('request-promise');
const widgetName = require('../../build/config/widget.config.json').widgetName;

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

module.exports = function() {
  this.setDefaultTimeout(180 * 1000);

  this.Given(/^I am viewing "(.*?)"(?: with state "(.*)")?$/, function(configPath, stateName) {
    this.context.configPath = configPath;

    // TODO source from somewhere else
    const width = 1000;
    const height = 600;
    let url = `http://localhost:9000/content/renderExample.html?width=${width}&height=${height}&config=${configPath}/config.json`;
    if (stateName) {
      url += `&state=${configPath}/${stateName}.json`;
    }
    browser.get(url);
    return browser.wait(browser.isElementPresent(by.css('.plot-title')));
  });

  this.Then(/^the "(.*)" snapshot matches the baseline$/, function (snapshotName) {
    const selectorExpression = '.scatterplot';
    return wrapInPromiseAndLogErrors(() => {
      return this.eyes.checkRegionBy(by.css(selectorExpression), snapshotName);
    });
  });

  this.When(/^I drag label (.+) by (-?[0-9]+) x (-?[0-9]+)$/, function (labelId, xMovement, yMovement) {
    return wrapInPromiseAndLogErrors(() => {
      element(by.id(labelId)).getLocation().then((locationObject) => {
        this.context.initialLocation = locationObject;
        this.context.expectedOffset = {
          x: parseInt(xMovement),
          y: parseInt(yMovement),
        };
      });

      return browser.actions()
        .mouseMove(element(by.id(labelId)))
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform();
    });
  });

  this.When(/^I drag label (.+) to the legend$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(element(by.id(labelId)))
        .mouseDown()
        .mouseMove(element.all(by.css('.legend-groups-text')).get(0))
        .mouseUp()
        .perform();
    });
  });

  this.Then(/^label (.+) should stay in the new location$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      return element(by.id(labelId)).getLocation().then((locationObject) => {
        const expectedX = this.context.initialLocation.x + this.context.expectedOffset.x;
        this.expect(locationObject.x, 'Incorrect new x coordinate').to.be.closeTo(expectedX, 2);

        const expectedY = this.context.initialLocation.y + this.context.expectedOffset.y;
        this.expect(locationObject.y, 'Incorrect new y coordinate').to.be.closeTo(expectedY, 2);
      });
    });
  });

  this.Then(/^label (.+) should be in the legend$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      element.all(by.css('.legend-groups-text')).get(0).getLocation().then((legendLocation) => {
        this.context.legendLocation = legendLocation;
      });

      return element(by.id(`legend-${labelId}`)).getLocation().then((labelLocation) => {
        this.expect(labelLocation.x, 'Incorrect new x coordinate').to.be.closeTo(this.context.legendLocation.x, 100);
        this.expect(labelLocation.y, 'Incorrect new y coordinate').to.be.closeTo(this.context.legendLocation.y, 100);
      });
    });
  });

  this.Then(/^the final state callback should match "(.*)"$/, function (expectedStateFile) {
    console.log(`configpath on this is ${this.context.configPath}`);
    if (!this.context.configPath) {
      throw new Error('Cannot state match without configPath');
    }

    return wrapInPromiseAndLogErrors(() => {
      const expectedStateUrl = `http://localhost:9000/internal_www/scripts/data/${this.context.configPath}/${expectedStateFile}.json`;
      console.log(`expected state url: ${expectedStateUrl}`);
      const expectedStatePromise = request(expectedStateUrl)
        .then(JSON.parse)
        .then((expectedState) => {
          return expectedState;
        });

      function getStateUpdates() {
        return window.stateUpdates;
      }

      const actualStatePromise = browser.executeScript(getStateUpdates).then((stateUpdates) => {
        return stateUpdates[stateUpdates.length - 1];
      });

      return Promise.all([actualStatePromise, expectedStatePromise]).then(([actualState, expectedState]) => {
        const errorMessageOnFail = `
Expected:
${JSON.stringify(expectedState, {}, 2)}
Actual:
${JSON.stringify(actualState, {}, 2)}
`;
        this.expect(actualState, errorMessageOnFail).to.deep.equal(expectedState);
      });
    })
  });

  this.When(/^Sleep ([0-9]+)$/, function(sleepSeconds) {
    return browser.sleep(sleepSeconds * 1000);
  });

  this.When(/^I take all the snapshots on the page "(.*)"$/, function (contentPath) {
    function loadPage(_contentPath) {
      return browser.get(`http://localhost:9000${_contentPath}`).then(() => {
        console.log(`Page ${_contentPath} is loaded`);
      });
    }

    function conditionallyOpenEyesAndWaitForSnapshotsToLoad() {
      return element.all(by.css('[snapshot-name]')).count().then((count) => {
        if (count > 0) {
          console.log(`Waiting ${global.visualDiffConfig.pageLoadWaitSeconds} seconds for widgetsPage`);
          return new Promise((resolve) => {
            setTimeout(() => {
              return resolve();
            }, global.visualDiffConfig.pageLoadWaitSeconds * 1000);
          });
        } else {
          console.log(`No snapshots on ${contentPath}. Skipping`);
          return Promise.resolve();
        }
      });
    }

    function takeSnapshots() {
      const donePromises = element.all(by.css('[snapshot-name]')).each((element) => {
        console.log('element loop');
        return element.getAttribute('snapshot-name').then((snapshotName) => {
          if (snapshotName) {
            console.log(`take snapshot ${contentPath} ${snapshotName}`);
            return this.eyes.checkRegionBy(by.css(`[snapshot-name="${snapshotName}"]`), snapshotName);
          } else {
            console.error(`snapshot on page ${contentPath} missing snapshot name`);
          }
        });
      });
      return donePromises.then(() => {
        console.log(`done taking snapshots on ${contentPath}`);
      });
    }

    function catchAll(error) {
      console.log('test error:');
      console.log(error);
    }

    return wrapInPromiseAndLogErrors(() => {
      return loadPage(contentPath)
        .then(conditionallyOpenEyesAndWaitForSnapshotsToLoad.bind(this))
        .then(takeSnapshots.bind(this))
        .catch(catchAll.bind(this));
    });
  });
};
