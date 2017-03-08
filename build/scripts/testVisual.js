

const _ = require('lodash');
const widgetName = require('../config/widget.config.json').widgetName;
const contentManifest = require('../../browser/content/contentManifest.json');

// NB global.visualDiffConfig is set globally in protractor.conf.js
const eyes = require('./initializeApplitools').getEyes(global.visualDiffConfig);

let contentFiles = _.flattenDeep(_.values(contentManifest));

if (_.has(global.visualDiffConfig, 'specFilter')) {
  const specFilterRegex = new RegExp(global.visualDiffConfig.specFilter);
  contentFiles = contentFiles.filter((candidatePath) => {
    return specFilterRegex.test(candidatePath);
  });
}

describe('Take visual regression snapshots', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  let snapshotsCount = 0;
  _.forEach(contentFiles, (contentPath) => {
    it(`Capturing ${contentPath} visual regression content`, function (done) {
      let openedEyes = false;

      function loadPage() {
        return browser.get(contentPath).then(() => {
          console.log(`Page ${contentPath} is loaded`);
        });
      }

      function conditionallyOpenEyesAndWaitForSnapshotsToLoad() {
        return element.all(by.css('[snapshot-name]')).count().then((count) => {
          if (count > 0) {
            const eyesParams = {
              width: global.visualDiffConfig.browserWidth,
              height: global.visualDiffConfig.browserHeight,
            };
            eyes.open(browser, `${widgetName} ${global.visualDiffConfig.testLabel}`, contentPath, eyesParams);
            openedEyes = true;

            console.log(`Waiting ${global.visualDiffConfig.pageLoadWaitSeconds * 1000} seconds for widgetsPage`);
            return new Promise((resolve) => {
              setTimeout(() => {
                return resolve();
              }, global.visualDiffConfig.pageLoadWaitSeconds * 0);
            });
          } else {
            console.log(`No snapshots on ${contentPath}. Skipping`);
            return Promise.resolve();
          }
        });
      }

      function takeSnapshots() {
        const donePromises = element.all(by.css('[snapshot-name]')).each(function (element) {
          return element.getAttribute('snapshot-name').then((snapshotName) => {
            if (snapshotName) {
              console.log(`take snapshot ${contentPath} ${snapshotName}`);
              snapshotsCount++;
              eyes.checkRegionBy(by.css(`[snapshot-name="${snapshotName}"]`), snapshotName);
            } else {
              console.error(`snapshot on page ${contentPath} missing snapshot name`);
            }
          });
        });
        return donePromises.then(() => {
          console.log(`done taking snapshots on ${contentPath}. Running snapshot count: ${snapshotsCount}`);
        });
      }

      function catchAll(error) {
        console.log('test error:');
        console.log(error);
      }

      function conditionallyCloseEyesAndEndTest() {
        if (openedEyes) { eyes.close(false); }
        done();
      }

      loadPage()
        .then(conditionallyOpenEyesAndWaitForSnapshotsToLoad)
        .then(takeSnapshots)
        .catch(catchAll)
        .finally(conditionallyCloseEyesAndEndTest);
    });
  });
});

