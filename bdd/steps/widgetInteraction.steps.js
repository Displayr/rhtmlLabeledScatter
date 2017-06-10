const _ = require('lodash');
const request = require('request-promise');


// TODO make this an exported module in rhtmlBuild
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

module.exports = function () {
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

  this.Then(/^the final state callback should match "(.*)" within ([0-9.]+)$/, function (expectedStateFile, toleranceString) {
    if (!this.context.configName) {
      throw new Error('Cannot state match without configName');
    }
    const tolerance = parseFloat(toleranceString);
    if (_.isNaN(tolerance)) {
      throw new Error(`Invalid toleranceString '${toleranceString}', must be valid float`);
    }

    return wrapInPromiseAndLogErrors(() => {
      const expectedStateUrl = `http://localhost:9000/data/${this.context.configName}/${expectedStateFile}.json`;
      const expectedStatePromise = request(expectedStateUrl).then(JSON.parse);
      const actualStatePromise = this.context.getRecentState();

      return Promise.all([actualStatePromise, expectedStatePromise]).then(([actualState, expectedState]) => {

        const constantKeys = ['X', 'Y', 'label']; // these should not change unless the initial config changes
        _(constantKeys).each((constantKey) => {
          const errorMessageOnFail = `
The ${constantKey} did not match.
Expected:
${JSON.stringify(expectedState[constantKey], {}, 2)}
Actual:
${JSON.stringify(actualState[constantKey], {}, 2)}
`;

          this.expect(actualState[constantKey], errorMessageOnFail).to.deep.equal(expectedState[constantKey]);

          delete actualState[constantKey];
          delete expectedState[constantKey];
        });

        const variableSections = _.union(_.keys(actualState), _.keys(expectedState));
        _(variableSections).each((variableSection) => {
          if (!_.isArray(actualState[variableSection]) || !_.isArray(expectedState[variableSection])) {
            throw new Error(`Test Error: Expected ${variableSection} to be an array`);
          }

          this.expect(actualState[variableSection].length, `${variableSection} incorrect length`).to.equal(expectedState[variableSection].length);

          _(actualState[variableSection]).each((actualValue, index) => {
            const expectedValue = expectedState[variableSection][index];

            if (_.isObject(expectedValue)) {
              const allKeys = _.union(_.keys(expectedValue), _.keys(actualValue));
              _(allKeys).each((keyToTest) => {
                const errorMessage = `${variableSection}[${index}].${keyToTest} fail`;
                // Print a warning if they do not equal, even if the test passes with the specified tolerance
                if (actualValue[keyToTest] !== expectedValue[keyToTest]) {
                  console.log(`WARN: ${variableSection}[${index}].${keyToTest} != expected: A: ${actualValue[keyToTest]} E: ${expectedValue[keyToTest]}`);
                }
                this.expect(actualValue[keyToTest], errorMessage).to.be.closeTo(expectedValue[keyToTest], tolerance);
              });
            } else {
              const errorMessage = `${variableSection}[${index}] fail`;
              this.expect(actualValue, errorMessage).to.be.closeTo(expectedValue, tolerance);
            }
          });
        });
      });
    });
  });

  this.When(/^I wait for animations to complete$/, function () {
    return browser.sleep(1000);
  });
};
