const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')

const {
  getExampleUrl,
  waitForWidgetToLoad,
} = renderExamplePageTestHelper

const ScatterPlotPage = require('./scatterPlotPage')

// TODO the 'data.bdd.three_point_brand' default is questionable but serves this suite ...
const loadWidget = async ({
  browser,
  configName = 'data.bdd.three_point_brand',
  stateName,
  width = 1000,
  rerenderControls,
  height = 600,
}) => {
  const page = await browser.newPage()
  const url = getExampleUrl({ configName, stateName, rerenderControls, width, height })
  const scatterPlot = new ScatterPlotPage(page)

  await page.goto(url)
  await waitForWidgetToLoad({ page })

  return { page, scatterPlot }
}

module.exports = loadWidget
