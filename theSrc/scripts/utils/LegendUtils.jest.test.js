const LegendUtils = require('./LegendUtils.js')

describe('LegendUtils:', function () {
  describe('getZQuantiles():', function () {
    it('computes top, middle, and bottom quantile thresholds for zMax=10000', function () {
      const zQuantiles = LegendUtils.getZQuantiles(10000, '$', '')

      expect(zQuantiles).toEqual({
        top: { lab: '$9.00k', val: 0.5352372348458313 },
        mid: { lab: '$4.00k', val: 0.3568248232305542 },
        bot: { lab: '$1.00k', val: 0.1784124116152771 },
      })
    })

    it('computes top, middle, and bot quantile thresholds for zMax=1000000', function () {
      const zQuantiles = LegendUtils.getZQuantiles(1000000, '', '%')

      expect(zQuantiles).toEqual({
        top: { lab: '900k%', val: 0.5352372348458313 },
        mid: { lab: '400k%', val: 0.3568248232305542 },
        bot: { lab: '100k%', val: 0.1784124116152771 },
      })
    })
  })
})
