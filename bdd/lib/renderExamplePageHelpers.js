const request = require('request-promise')
const deepDiff = require('deep-diff')
const _ = require('lodash')

const getExampleUrl = ({ configName, stateName, width = 1000, height = 1000, rerenderControls = false, border = false }) => {
  const config = {
    height,
    width,
    type: 'single_widget_single_page',
    widgets: [{ config: [configName], rerenderControls, border, state: stateName }]
  }
  const configString = new Buffer(JSON.stringify(config)).toString('base64') // eslint-disable-line node/no-deprecated-api
  return `http://localhost:9000/renderExample.html?config=${configString}`
}

const checkState = async ({ page, expectedStateFile, tolerance: toleranceString }) => {
  return new Promise((resolve, reject) => {
    const expectedStateUrl = `http://localhost:9000/${replaceDotsWithSlashes(expectedStateFile)}.json`

    // const {statePreprocessor} = widgetConfig.visualRegressionSuite
    const statePreprocessor = (x) => x
    const expectedStatePromise = request(expectedStateUrl).then(JSON.parse)
    const actualStatePromise = getRecentState(page)

    return Promise.all([actualStatePromise, expectedStatePromise]).then(([unprocessedActualState, expectedState]) => {
      const actualState = statePreprocessor(unprocessedActualState)
      const bothNumber = (a, b) => (typeof a) === 'number' && (typeof b) === 'number'
      const tolerance = (_.isUndefined(toleranceString)) ? 0 : parseFloat(toleranceString)
      const areEqual = _.isEqualWith(actualState, expectedState, (a, b) => {
        if (bothNumber(a, b)) {
          return Math.abs(a - b) <= tolerance
        }
        return undefined
      })

      if (!areEqual) {
        console.log('actualState')
        console.log(JSON.stringify(actualState, {}, 2))

        console.log('expectedState')
        console.log(JSON.stringify(expectedState, {}, 2))

        console.log('differences (left: actual, right: expected)')
        console.log(JSON.stringify(deepDiff(actualState, expectedState), {}, 2))
      }
      return resolve(areEqual)
    })
  })
}

const replaceDotsWithSlashes = (inputString) => {
  return inputString.replace(/[.]/g, '/')
}

const getRecentState = async function (page) {
  function getStateUpdates () {
    if (typeof window.stateUpdates !== 'undefined') {
      return window.stateUpdates
    } else {
      throw new Error('no stateUpdates on window object. Widget lib must implement stateUpdates')
    }
  }

  return page.evaluate(getStateUpdates).then((stateUpdates) => {
    return stateUpdates[stateUpdates.length - 1]
  })
}

module.exports = {
  replaceDotsWithSlashes,
  getExampleUrl,
  checkState,
  getRecentState
}