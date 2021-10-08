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
configureImageSnapshotMatcher({ collectionIdentifier: 'resize' })

describe('resize', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('basic resize', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.bdd.legend_drag_test_plot',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'basic_initial' })

    await page.evaluate(() => {
      window.resizeHook(750, 750)
    })

    await page.waitFor(1000)

    await testSnapshots({ page, testName: 'basic_after_resize' })

    await page.close()
  })

  test('user interactions on resize: on plot are reset, on legend are maintained', async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      configName: 'data.bdd.three_point_brand',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'user_interaction_initial' })

    await scatterPlot.movePlotLabel({ id: 0, x: 50, y: 50 })
    await scatterPlot.movePlotLabelToLegend({ id: 1 })

    await testSnapshots({ page, testName: 'user_interaction_after_interaction' })

    await page.evaluate(() => {
      window.resizeHook(750, 750)
    })

    await page.waitFor(1000)

    await testSnapshots({ page, testName: 'user_interaction_after_resize' })

    await page.close()
  })

  test('VIS-998: resize from an output that is too small to a normal size', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.bdd.legend_drag_test_plot',
      width: 500,
      height: 20,
    })

    await testSnapshots({ page, testName: 'no_plot_due_to_insufficient_height' })

    await page.evaluate(() => {
      window.resizeHook(500, 500)
    })

    await page.waitFor(1000)

    await testSnapshots({ page, testName: 'plot_after_resize_to_normal_height' })

    await page.close()
  })
})
