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
      expect(data.Zquartiles).to.deep.equal({
        top: { val: '8k', lab: 0.504626504404032 },
        mid: { val: 3, lab: 0.3454941494713355 },
        bot: { val: 0.8, lab: 0.1784124116152771 },
      });
    });

    it('computes top, mid, and bot quartile thresholds for zMax=1000000', function () {
      const data = {};
      LegendUtils.calcZQuartiles(data, 1000000);
      console.log(data.Zquartiles);
      expect(data.Zquartiles).to.deep.equal({
        top: { val: '800k', lab: 0.504626504404032 },
        mid: { val: 300, lab: 0.3454941494713355 },
        bot: { val: 80, lab: 0.1784124116152771 },
      });
    });
  });
});