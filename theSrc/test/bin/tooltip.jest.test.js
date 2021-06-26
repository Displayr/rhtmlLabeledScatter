const puppeteer = require('puppeteer')
const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')
const loadWidget = require('../lib/loadWidget.helper')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  testSnapshots,
  jestTimeout,
} = renderExamplePageTestHelper

jest.setTimeout(jestTimeout)
configureImageSnapshotMatcher({ collectionIdentifier: 'tooltip' })

// TODO: CANNOT GET TOOLIP VISUAL TESTING TO WORK

describe('tooltip', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('basic tooltip', async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      configName: 'data.bdd.bubbleplot_no_label',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'basic_initial' })

    await scatterPlot.moveMouseOntoAnchor({ id: 1 })

    await page.waitFor(5000)

    await testSnapshots({ page, testName: 'hover_on_tooltip' })

    await page.close()
  })
})
