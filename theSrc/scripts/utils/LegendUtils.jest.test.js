const LegendUtils = require('./LegendUtils.js')

describe('LegendUtils:', function () {
  describe('getLegendBubbles():', function () {
    it('computes large, medium and small legend bubble sizes for zMax=10000', function () {
      const legendBubbles = LegendUtils.getLegendBubbles(10000, '$', '')

      expect(legendBubbles).toEqual({
        large: { label: '$10K', size: 10000 },
        medium: { label: '$5K', size: 5000 },
        small: { label: '$1K', size: 1000 },
        maxSize: 10000,
      })
    })

    it('computes large, medium and small legend bubble sizes for zMax=1000000', function () {
      const legendBubbles = LegendUtils.getLegendBubbles(1000000, '', '%')

      expect(legendBubbles).toEqual({
        large: { label: '1M%', size: 1000000 },
        medium: { label: '.5M%', size: 500000 },
        small: { label: '.1M%', size: 100000 },
        maxSize: 1000000,
      })
    })
  })
})
