const PlotColors = require('./PlotColors.js')

describe('PlotColors:', function () {
  describe('getColorFromGroup(groupName)', function () {
    const colors = new PlotColors({
      group: ['G1', 'G2', 'G3', 'G4'],
      colorWheel: ['red', 'blue', 'green'],
      legend: { addGroup: () => {} },
    })

    it('should return colors from the colorWheel, reusing colors if necessary', function () {
      expect(colors.getColorFromGroup('G1')).toEqual('red')
      expect(colors.getColorFromGroup('G2')).toEqual('blue')
      expect(colors.getColorFromGroup('G3')).toEqual('green')
      expect(colors.getColorFromGroup('G4')).toEqual('red')
    })

    // TODO is this desirable behaviour. Alternative is to throw error
    it('should return undefined when passed an invalid group', function () {
      expect(colors.getColorFromGroup('WRONG')).toEqual(undefined)
    })
  })

  describe('getColor(i)', function () {
    describe('when groups are defined', function () {
      const colors = new PlotColors({
        group: ['G1', 'G2', 'G2', 'G1'],
        colorWheel: ['red', 'blue'],
        legend: { addGroup: () => {} },
      })

      it('should return color for the group[i]', function () {
        expect(colors.getColor(0)).toEqual('red')
        expect(colors.getColor(1)).toEqual('blue')
        expect(colors.getColor(2)).toEqual('blue')
        expect(colors.getColor(3)).toEqual('red')
      })

      it('should return undefined when i is out of bounds', function () {
        expect(colors.getColor(4)).toEqual(undefined)
      })
    })

    describe('when no groups are defined', function () {
      const colors = new PlotColors({
        colorWheel: ['red', 'blue'],
        legend: { addGroup: () => {} },
      })

      it('should return the first color, regardless of the index', function () {
        expect(colors.getColor(0)).toEqual('red')
        expect(colors.getColor(1)).toEqual('red')
      })
    })
  })
})
