const LegendUtils = require('./LegendUtils.js')

describe('LegendUtils:', function () {
  describe('getLegendBubbles():', function () {
    it('computes top, middle, and bottom legend bubble sizes for zMax=10000', function () {
      const legendBubbles = LegendUtils.getLegendBubbles(10000, '$', '')

      expect(legendBubbles).toEqual({
        large: { label: '$9.00k', size: 0.5352372348458313 },
        medium: { label: '$4.00k', size: 0.3568248232305542 },
        small: { label: '$1.00k', size: 0.1784124116152771 },
      })
    })

    it('computes top, middle, and bottom legend bubble sizes for zMax=1000000', function () {
      const legendBubbles = LegendUtils.getLegendBubbles(1000000, '', '%')

      expect(legendBubbles).toEqual({
        large: { label: '900k%', size: 0.5352372348458313 },
        medium: { label: '400k%', size: 0.3568248232305542 },
        small: { label: '100k%', size: 0.1784124116152771 },
      })
    })
  })
})
