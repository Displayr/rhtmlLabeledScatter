const _ = require('lodash');
const LegendUtils = require('./LegendUtils.es6');

describe('LegendUtils:', function () {

  // KZ TODO conceptually the val and lab seem reversed - non intuitive
  // KZ TODO assuming lab are constant this test is more useful if it is just
  //   in/out with zMax => [topLabel, midLabel, botLabel
  describe('calcZQuartiles():', function () {
    it('computes top, mid, and bot quartile thresholds for zMax=10000', function () {
      const data = {};
      LegendUtils.calcZQuartiles(data, 10000);

      const errorMessage = `
      Quartiles did not pass test:
      ${JSON.stringify(data.Zquartiles, {}, 2)}
      `;

      expect(data.Zquartiles, errorMessage).to.deep.equal({
        top: { val: '9k', lab: 0.5352372348458313 },
        mid: { val: 4, lab: 0.37612638903183754 },
        bot: { val: 0.9, lab: 0.1784124116152771 },
      });
    });

    it('computes top, mid, and bot quartile thresholds for zMax=1000000', function () {
      const data = {};
      LegendUtils.calcZQuartiles(data, 1000000);

      const errorMessage = `
      Quartiles did not pass test:
      ${JSON.stringify(data.Zquartiles, {}, 2)}
      `;

      expect(data.Zquartiles, errorMessage).to.deep.equal({
        top: { val: '900k', lab: 0.5352372348458313 },
        mid: { val: 400, lab: 0.37612638903183754 },
        bot: { val: 90, lab: 0.1784124116152771 },
      });
    });
  });
});