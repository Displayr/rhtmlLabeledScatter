const _ = require('lodash');
const DisplayError = require('./DisplayError.js');
const PlotLabel = require('./PlotLabel.js');

// NB need these global additions until the ES6 port is complete
window.DisplayError = DisplayError;

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
    ];

    _(tests).each((t) => {
      it(`_isStringLinkToImg(${t.input}) is ${t.expected}`, function () {
        expect(PlotLabel._isStringLinkToImg(t.input)).to.equal(t.expected);
      });
    });
  });
});