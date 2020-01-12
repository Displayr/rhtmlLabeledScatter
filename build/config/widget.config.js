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
    'testplanDirectory': 'theSrc/test/snapshotTestDefinitions',
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
        'threshold': 0.1
      },
      'failureThreshold': 0.01,
      'failureThresholdType': 'percent' // pixel or percent
    }
  }
}

const commandLineOverides = _.omit(cliArgs, ['_', '$0'])
const mergedConfig = _.merge(config, commandLineOverides)

// this is a hack to allow configuring just the snapshotTesting.testEnv and snapshotTesting.branch
// the issue is that tests are invoked by jest as child processes and the command line args do not propogate

// node gulp testVisual --snapshotTesting.testEnv=travis --snapshotTesting.branch=VIS-513
  // the gulp task explicitly echoes the command line params
  // jest <project_root>/theSrc/test/ --snapshotTesting.testEnv=travis --snapshotTesting.branch=VIS-513
    // node /Users/kyle/projects/numbers/scatter/node_modules/jest-worker/build/workers/processChild.js

if (process.env.ENV) { mergedConfig.snapshotTesting.testEnv = process.env.ENV }
if (process.env.BRANCH) { mergedConfig.snapshotTesting.branch = process.env.BRANCH }

module.exports = mergedConfig
