const _ = require('lodash')
const puppeteer = require('puppeteer')
const testPlan = require('../../.tmp/test_plan')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  jestTimeout,
  testSnapshot,
  waitForWidgetToLoad
} = require('./lib/renderExamplePageTest.helper')

jest.setTimeout(jestTimeout)

const arrayOfTests = _(testPlan)
  .map(({ tests, groupName }) => {
    return tests.map(testConfig => _.assign(testConfig, { groupName }))
  })
  .flatten()
  .map(testConfig => [`${testConfig.groupName}-${testConfig.testname}`, testConfig])
  .value()

// on test naming
// jest test name = group + testname <-- allows us to filter by group or by name
// snapshot name = testname <-- the group name is in the directory so group does not need to be repeated in the snapshot name

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

    configureImageSnapshotMatcher('testPlans', testConfig.groupName)

    const page = await browser.newPage()

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
    await testSnapshot({ page, snapshotName: testConfig.testname })

    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })
})
