const path = require('path')

module.exports = {
  "widgetEntryPoint": "theSrc/scripts/rhtmlLabeledScatter.js",
  "widgetFactory": "theSrc/scripts/rhtmlLabeledScatter.factory.js",
  "widgetName": "rhtmlLabeledScatter",
  "internalWebSettings": {
    "isReadySelector": ".rhtmlLabeledScatter-isReadySelector",
    "singleWidgetSnapshotSelector": "svg.rhtmlwidget-outer-svg",
    "default_border": true,
    "css": [
      "/styles/rhtmlLabeledScatter.css"
    ]
  },
  "snapshotTesting": {
    "testplanDirectory": "theSrc/test/snapshotTest",
    "snapshotDirectory": "theSrc/test/snapshots",
    "timeout": 10000,
    "snapshotDelay": 100,
    "puppeteer": {
      "headless": true,
      "slowMo": 0,
      "defaultViewport": {
        "width": 1600,
        "height": 1600
      }
    },
    "pixelmatch": {
      // smaller values -> more sensitive : https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
      "customDiffConfig": {
        "threshold": 0.3
      },
      "failureThreshold": 0.01,
      "failureThresholdType": "percent" // pixel or percent
    }
  }
}
