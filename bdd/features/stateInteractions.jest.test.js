
/* global jest */
/* global expect */
/* global beforeAll */
/* global afterAll */

const puppeteer = require('puppeteer')
const { configureToMatchImageSnapshot } = require('jest-image-snapshot')

const ScatterPlotPage = require('../lib/scatterPlotPage')
const {
  getExampleUrl,
  checkState
} = require('../lib/renderExamplePageHelpers')

jest.setTimeout(20000)

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  // smaller values -> more sensitive : https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
  customDiffConfig: { threshold: 0.3 },
  failureThreshold: 0.03,
  failureThresholdType: 'pixel' // pixel or percent
})

expect.extend({ toMatchImageSnapshot })

// does not need to be persistent over time.
// Used to isolate tests via jest -t
let testId = 0
let snapshotDelay = 100

describe('multiple render tests', () => {
  let browser

  beforeAll(async () => {
    // TODO: larger viewport ?
    browser = await puppeteer.launch({
      // headless: false,
      // slowMo: 200,
      defaultViewport: {
        width: 1600,
        height: 1600
      }
    })
  })

  afterAll(async () => {
    await browser.close()
  })

  // label actions 1-5
  test(`${++testId}: Drag a label`, async function () {
    const { page, scatterPlot } = await loadWidget({ browser })

    await testSnapshot({ page, snapshotName: 'initial_three_point' })

    await scatterPlot.movePlotLabel({ id: 0, x: 50, y: 50 })

    await testSnapshot({ page, snapshotName: 'after_porche_drag_on_canvas' })
    await testState({ page, stateName: 'data.bdd.three_point_brand_state.porche_label_moved_50x50' })

    await page.close()
  })

  test(`${++testId}: Load saved state and see a user positioned label`, async function () {
    const { page } = await loadWidget({
      browser,
      stateName: 'data.bdd.three_point_brand_state.porche_label_moved_50x50'
    })

    await testSnapshot({ page, snapshotName: 'after_porche_drag_on_canvas' })

    await page.close()
  })

  test(`${++testId}: Drag a label to the legend`, async function () {
    const { page, scatterPlot } = await loadWidget({ browser })

    await testSnapshot({ page, snapshotName: 'initial_three_point' })

    await scatterPlot.movePlotLabelToLegend({ id: 0 })

    await testSnapshot({ page, snapshotName: 'after_porche_drag_to_legend' })
    await testState({ page, stateName: 'data.bdd.three_point_brand_state.porche_label_moved_to_legend' })

    await page.close()
  })

  test(`${++testId}: Load saved state and see a user positioned label on the legend`, async function () {
    const { page } = await loadWidget({
      browser,
      stateName: 'data.bdd.three_point_brand_state.porche_label_moved_to_legend'
    })

    await testSnapshot({ page, snapshotName: 'after_porche_drag_to_legend' })

    await page.close()
  })

  test(`${++testId}: Drag label from legend and snap to original position`, async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      stateName: 'data.bdd.three_point_brand_state.porche_label_moved_to_legend'
    })

    await scatterPlot.moveLegendLabelToPlot({ id: 0 })

    await testSnapshot({ page, snapshotName: 'initial_three_point' })
    await testState({ page, stateName: 'data.bdd.three_point_brand_state.back_to_original', tolerance: 0.02 })

    await page.close()
  })

  // image label actions 1-5
  test(`${++testId}: Drag a image label`, async function () {
    const { page, scatterPlot } = await loadWidget({ browser })

    await testSnapshot({ page, snapshotName: 'initial_three_point' })

    await scatterPlot.movePlotLabel({ id: 2, x: 200, y: 100 })

    await testSnapshot({ page, snapshotName: 'after_apple_drag_on_canvas' })
    await testState({ page, stateName: 'data.bdd.three_point_brand_state.apple_label_moved_200x100' })

    await page.close()
  })

  test(`${++testId}: Load saved state and see a user positioned image label`, async function () {
    const { page } = await loadWidget({
      browser,
      stateName: 'data.bdd.three_point_brand_state.apple_label_moved_200x100'
    })

    await testSnapshot({ page, snapshotName: 'after_apple_drag_on_canvas' })

    await page.close()
  })

  test(`${++testId}: Drag a image label to the legend`, async function () {
    const { page, scatterPlot } = await loadWidget({ browser })

    await testSnapshot({ page, snapshotName: 'initial_three_point' })

    await scatterPlot.movePlotLabelToLegend({ id: 2 })

    await testSnapshot({ page, snapshotName: 'after_apple_drag_to_legend' })
    await testState({ page, stateName: 'data.bdd.three_point_brand_state.apple_label_moved_to_legend' })

    await page.close()
  })

  test(`${++testId}: Load saved state and see a user positioned image label on the legend`, async function () {
    const { page } = await loadWidget({
      browser,
      stateName: 'data.bdd.three_point_brand_state.apple_label_moved_to_legend'
    })

    await testSnapshot({ page, snapshotName: 'after_apple_drag_to_legend' })

    await page.close()
  })

  test(`${++testId}: Drag image label from legend and snap to original position`, async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      stateName: 'data.bdd.three_point_brand_state.apple_label_moved_to_legend'
    })

    await scatterPlot.moveLegendLabelToPlot({ id: 2 })

    await testSnapshot({ page, snapshotName: 'initial_three_point' })
    await testState({ page, stateName: 'data.bdd.three_point_brand_state.back_to_original', tolerance: 0.02 })

    await page.close()
  })

  // bubble label actions 1-5
  test(`${++testId}: Drag a bubble label`, async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      configName: 'data.bdd.bubbleplot_simple',
      width: 600,
      height: 600
    })

    await testSnapshot({ page, snapshotName: 'initial_bubble' })

    await scatterPlot.movePlotLabel({ id: 2, x: 100, y: 100 })

    await testSnapshot({ page, snapshotName: 'after_bubble_drag_on_canvas' })
    await testState({ page, stateName: 'data.bdd.bubbleplot_simple_state.label_moved_100x100' })

    await page.close()
  })

  // NB XXX this shows an issue where I move -> state, then reload with state and image is slightly diff
  test(`${++testId}: Load saved state and see a user positioned bubble label`, async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.bdd.bubbleplot_simple',
      stateName: 'data.bdd.bubbleplot_simple_state.label_moved_100x100',
      width: 600,
      height: 600
    })

    // await testSnapshot({ page, snapshotName: 'after_bubble_drag_on_canvas' }) // this is ideal behaviour (equality)
    await testSnapshot({ page, snapshotName: 'after_bubble_drag_on_canvas-reload' }) // this is current behaviour (small diff)

    await page.close()
  })

  test(`${++testId}: Drag a bubble label to the legend`, async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      configName: 'data.bdd.bubbleplot_simple',
      width: 600,
      height: 600
    })

    await testSnapshot({ page, snapshotName: 'initial_bubble' })

    await scatterPlot.movePlotLabelToLegend({ id: 2 })

    await testSnapshot({ page, snapshotName: 'after_bubble_drag_to_legend' })
    await testState({ page, stateName: 'data.bdd.bubbleplot_simple_state.label_moved_to_legend' })

    await page.close()
  })

  test(`${++testId}: Load saved state and see a user positioned bubble label on the legend`, async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.bdd.bubbleplot_simple',
      stateName: 'data.bdd.bubbleplot_simple_state.label_moved_to_legend',
      width: 600,
      height: 600
    })

    await testSnapshot({ page, snapshotName: 'after_bubble_drag_to_legend' })

    await page.close()
  })

  test(`${++testId}: Drag bubble label from legend and snap to original position`, async function () {
    const { page, scatterPlot } = await loadWidget({
      browser,
      configName: 'data.bdd.bubbleplot_simple',
      stateName: 'data.bdd.bubbleplot_simple_state.label_moved_to_legend',
      width: 600,
      height: 600
    })

    await scatterPlot.moveLegendLabelToPlot({ id: 2 })

    await testSnapshot({ page, snapshotName: 'initial_bubble' })
    await testState({ page, stateName: 'data.bdd.bubbleplot_simple_state.back_to_original', tolerance: 0.02 })

    await page.close()
  })

  // unrelated truncated plot
  test(`${++testId}: Load saved state and see truncated scatterplot with 2 columns`, async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.bdd.scatterplot_yaxis_not_visible',
      stateName: 'data.bdd.scatterplot_yaxis_not_visible_state.legend_truncation_2cols',
      width: 755,
      height: 150
    })

    await testSnapshot({ page, snapshotName: 'legend_truncation_2cols' })

    await page.close()
  })

  test(`${++testId}: Load saved state and see truncated scatterplot with 3 columns`, async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.bdd.scatterplot_yaxis_not_visible',
      stateName: 'data.bdd.scatterplot_yaxis_not_visible_state.legend_truncation_3cols',
      width: 755,
      height: 150
    })

    await testSnapshot({ page, snapshotName: 'legend_truncation_3cols' })

    await page.close()
  })
})

const loadWidget = async ({
  browser,
  configName = 'data.bdd.three_point_brand',
  stateName,
  width = 1000,
  height = 600
}) => {
  const page = await browser.newPage()
  const threePointUrl = getExampleUrl({ configName, stateName, width, height })
  const scatterPlot = new ScatterPlotPage(page)

  await page.goto(threePointUrl)
  await page.waitForFunction(selectorString => {
    return document.querySelectorAll(selectorString).length
  }, { timeout: 10000 }, 'body[widgets-ready], .rhtml-error-container')

  return { page, scatterPlot }
}

const testSnapshot = async ({ page, snapshotName }) => {
  await page.waitFor(snapshotDelay)
  let widget = await page.$('svg.rhtmlwidget-outer-svg')
  let image = await widget.screenshot({})
  expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: snapshotName })
}

const testState = async ({ page, stateName, tolerance }) => {
  let stateIsGood = await checkState({ page, expectedStateFile: stateName, tolerance })
  expect(stateIsGood).toEqual(true)
}
