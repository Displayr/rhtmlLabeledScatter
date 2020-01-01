
/* global jest */
/* global expect */
/* global beforeAll */
/* global afterAll */

const puppeteer = require('puppeteer')
const { configureToMatchImageSnapshot } = require('jest-image-snapshot')
const _ = require('lodash')

jest.setTimeout(20000)

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: { threshold: 0.3 }, // smaller values -> more sensitive : https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
  failureThreshold: 0.01,
  failureThresholdType: 'percent' // pixel or percent
})

expect.extend({ toMatchImageSnapshot })

describe('multiple render tests', () => {
  let browser

  beforeEach(async () => {
    // TODO: larger viewport ?
    browser = await puppeteer.launch({
      headless: false,
      // slowMo: 50,
      defaultViewport: {
        width: 1600,
        height: 1600,
      }
    })
  })

test('rerender works', async function () {
    const originalConfig = 'data.bdd.three_point_brand'
    const newConfig = 'data.bdd.four_point_brand'

    const threePointUrl = getExampleUrl({
      configName: originalConfig,
      width: 1000,
      height: 600,
      rerenderControls: true
    })

    const page = await browser.newPage()
    await page.goto(threePointUrl)

    await page.waitForFunction(selectorString => {
      return document.querySelectorAll(selectorString).length
    }, { timeout: 10000 }, 'body[widgets-ready], .rhtml-error-container')

    let image1 = await page.screenshot({ fullPage: true })
    expect(image1).toMatchImageSnapshot({ customSnapshotIdentifier: 'initial' })

    await page.evaluate( () => document.querySelector('.example-0 .rerender-config').value = "")
    await page.type('.example-0 .rerender-config', newConfig, { delay: 0 })
    await page.click('.rerender-button')

    await page.waitForFunction(selectorString => {
      return document.querySelectorAll(selectorString).length
    }, { timeout: 10000 }, 'body[widgets-ready], .rhtml-error-container')

    let image2 = await page.screenshot({ fullPage: true })
    expect(image2).toMatchImageSnapshot({ customSnapshotIdentifier: 'final' })

    await page.close()
  })

  afterEach(async () => {
    await browser.close()
  })
})


const getExampleUrl= function ({ configName, stateName, width = 1000, height = 1000, rerenderControls = false, border = false }) {
  const config = {
    height,
    width,
    type: 'single_widget_single_page',
    widgets: [{ config: [configName], rerenderControls, border, state: stateName }]
  }
  const configString = new Buffer(JSON.stringify(config)).toString('base64') // eslint-disable-line node/no-deprecated-api
  return `http://localhost:9000/renderExample.html?config=${configString}`
}