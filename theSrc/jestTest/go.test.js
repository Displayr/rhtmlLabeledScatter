/* global jest */
/* global expect */
/* global beforeAll */
/* global afterAll */

const puppeteer = require('puppeteer')
const { configureToMatchImageSnapshot } = require('jest-image-snapshot')
const testPlan = require('../../browser/test_plan')
const _ = require('lodash')

jest.setTimeout(20000)

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: { threshold: 0.3 }, // smaller values -> more sensitive : https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
  failureThreshold: 0.01,
  failureThresholdType: 'percent' // pixel or percent
})

const arrayOfTests = _(testPlan)
  .map(({ tests, groupName }) => {
    return tests.map(testConfig => _.assign(testConfig, { groupName }))
  })
  .flatten()
  .map(testConfig => [`${testConfig.groupName}-${testConfig.testname}-snapshot`, testConfig])
  .value()

expect.extend({ toMatchImageSnapshot })

describe('snapshots', () => {
  let browser

  beforeAll(async () => {
    // TODO: larger viewport ?
    browser = await puppeteer.launch()
    // {
    //   headless: false,
    //   slowMo: 2000
    // }
  })

  test.each(arrayOfTests)(`%s`, async (testName, testConfig) => {
    console.log(testName)

    const page = await browser.newPage()
    page.on('console', msg => {
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
    })
    await page.goto(`http://localhost:9000${testConfig.renderExampleUrl}`)

    await page.waitForFunction(selectorString => {
      return document.querySelectorAll(selectorString).length
    }, { timeout: 10000 }, 'body[widgets-ready], .rhtml-error-container')

    const image = await page.screenshot({ fullPage: true })

    expect(image).toMatchImageSnapshot()

    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })
})
