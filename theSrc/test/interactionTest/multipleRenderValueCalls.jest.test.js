// TODO move these to eslintrc
/* global jest */
/* global expect */
/* global beforeEach */
/* global afterEach */

const path = require('path')
const puppeteer = require('puppeteer')
const { mkdirp } = require('fs-extra')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  testSnapshot,
  jestTimeout
} = require('./lib/renderExamplePageTest.helper')
const loadWidget = require('./lib/loadWidget.helper')

jest.setTimeout(jestTimeout)
configureImageSnapshotMatcher('multipleRerender')

describe('multiple render tests', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('rerender works', async function () {
    const originalConfig = 'data.bdd.three_point_brand'
    const newConfig = 'data.bdd.four_point_brand'

    const { page } = await loadWidget({
      browser,
      configName: originalConfig,
      width: 1000,
      height: 600,
      rerenderControls: true
    })

    await testSnapshot({ page, snapshotName: 'initial' })

    await page.evaluate(() => { document.querySelector('.example-0 .rerender-config').value = '' })
    await page.type('.example-0 .rerender-config', newConfig, { delay: 0 })
    await page.click('.rerender-button')

    await page.waitForFunction(selectorString => {
      return document.querySelectorAll(selectorString).length
    }, { timeout: 10000 }, 'body[widgets-ready], .rhtml-error-container')

    await testSnapshot({ page, snapshotName: 'final' })

    await page.close()
  })
})
