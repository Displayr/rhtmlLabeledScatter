/* global jest */
/* global expect */
/* global beforeAll */
/* global afterAll */

const _ = require('lodash')
const puppeteer = require('puppeteer')
const testPlan = require('../../../.tmp/test_plan')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  jestTimeout,
  testSnapshot,
  waitForWidgetToLoad
} = require('./lib/renderExamplePageTest.helper')
const loadWidget = require('./lib/loadWidget.helper')

jest.setTimeout(jestTimeout)
configureImageSnapshotMatcher('testPlans')

const arrayOfTests = _(testPlan)
  .map(({ tests, groupName }) => {
    return tests.map(testConfig => _.assign(testConfig, { groupName }))
  })
  .flatten()
  .map(testConfig => [`${testConfig.groupName}-${testConfig.testname}`, testConfig])
  .value()

// NB these do not need to be persistent over time. The Ids are a convenience used to isolate tests via jest -t '11:'
let testId = 1

describe('snapshots', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test.each(arrayOfTests)(`%#: %s`, async (testName, testConfig) => {
    console.log(testName)

    const page = await browser.newPage()

    // TODO add this later
    const consoleLogHandler = msg => {
      const statsLineString = _(msg.args())
        .map(arg => `${arg}`)
        .filter(arg => arg.match(/duration/))
        .first()

      if (statsLineString) {
        const statsStringMatch = statsLineString.match('^JSHandle:(.+)$')
        if (statsStringMatch) {
          const stats = JSON.parse(statsStringMatch[1])
          console.log(JSON.stringify(_.assign(stats, { scenario: testName })))
        }
      }
    }

    page.on('console', consoleLogHandler)
    await page.goto(`http://localhost:9000${testConfig.renderExampleUrl}`)
    await waitForWidgetToLoad({ page })
    await testSnapshot({ page, snapshotName: testName })

    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })
})
