const PlotLabel = require('./PlotLabel.js')

describe('PlotLabel:', function () {
  describe('_isStringLinkToImg(labelString)', function () {
    const tests = [
      { input: 'http://example.com/image.png', expected: true },
      { input: 'https://example.com/image.png', expected: true },
      { input: '/images/image.png', expected: true },
      { input: '/images/image.svg', expected: true },
      { input: '/images/image.jpg', expected: true },
      { input: '/images/image.gif', expected: true },
      { input: '/images/image.txt', expected: false },
      { input: '/images/image.png?foo=bar', expected: true },
      { input: 'foo', expected: false },
    ].map(testConfig => [testConfig.input, testConfig])

    test.each(tests)(`%#: %s`, (testName, testConfig) => {
      expect(PlotLabel._isStringLinkToImg(testConfig.input)).toEqual(testConfig.expected)
    })
  })
})
