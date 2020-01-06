const cliArgs = require('yargs').argv
const _ = require('lodash')

const config = {
  'widgetEntryPoint': 'theSrc/scripts/rhtmlLabeledScatter.js',
  'widgetFactory': 'theSrc/scripts/rhtmlLabeledScatter.factory.js',
  'widgetName': 'rhtmlLabeledScatter',
  'internalWebSettings': {
    'isReadySelector': '.rhtmlLabeledScatter-isReadySelector',
    'singleWidgetSnapshotSelector': 'svg.rhtmlwidget-outer-svg',
    'default_border': true,
    'css': [
      '/styles/rhtmlLabeledScatter.css'
    ]
  },
  'snapshotTesting': {
    'testEnv': 'local', // local || travis
    'branch': 'master', // git branch (you dont need to change it; is overridden auto when npm run travisTest is run)
    'testplanDirectory': 'theSrc/test/snapshotTest',
    'snapshotDirectory': 'theSrc/test/snapshots',
    'timeout': 10000,
    'snapshotDelay': 100,
    'puppeteer': {
      'headless': 1, // 0 | 1 | true | false
      'slowMo': 0,
      'defaultViewport': {
        'width': 1600,
        'height': 1600
      }
    },
    'pixelmatch': {
      // smaller values -> more sensitive : https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
      'customDiffConfig': {
        'threshold': 0.3
      },
      'failureThreshold': 0.01,
      'failureThresholdType': 'percent' // pixel or percent
    }
  }
}

const commandLineOverides = _.omit(cliArgs, ['_', '$0'])
const mergedConfig = _.merge(config, commandLineOverides)

module.exports = mergedConfig
