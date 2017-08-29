const Utils = require('./utils/Utils.js')
const PlotColors = require('./PlotColors.js')

// NB/TODO need these global additions until the ES6 port is complete
window.Utils = Utils

describe('PlotColors:', function () {
  describe('getColorFromGroup(groupName)', function () {
    beforeEach(function () {
      this.context = {}
      this.context.config = {
        group: ['G1', 'G2', 'G3', 'G4'],
        colorWheel: ['red', 'blue', 'green'],
        legend: { addGroup: () => {} }
      }
      this.context.colors = new PlotColors(this.context.config)
    })

    it('should return colors from the colorWheel, reusing colors if necessary', function () {
      expect(this.context.colors.getColorFromGroup('G1'), 'incorrect color for G1').to.equal('red')
      expect(this.context.colors.getColorFromGroup('G2'), 'incorrect color for G2').to.equal('blue')
      expect(this.context.colors.getColorFromGroup('G3'), 'incorrect color for G3').to.equal('green')
      expect(this.context.colors.getColorFromGroup('G4'), 'incorrect color for G4').to.equal('red')
    })

    // TODO is this desirable behaviour. Alternative is to throw error
    it('should return undefined when passed an invalid group', function () {
      expect(this.context.colors.getColorFromGroup('WRONG')).to.equal(undefined)
    })
  })

  describe('getColor(i)', function () {
    describe('when groups are defined', function () {
      beforeEach(function () {
        this.context = {}
        this.context.config = {
          group: ['G1', 'G2', 'G2', 'G1'],
          colorWheel: ['red', 'blue'],
          legend: { addGroup: () => {} }
        }
        this.context.colors = new PlotColors(this.context.config)
      })

      it('should return color for the group[i]', function () {
        expect(this.context.colors.getColor(0), 'incorrect color for i=0').to.equal('red')
        expect(this.context.colors.getColor(1), 'incorrect color for i=1').to.equal('blue')
        expect(this.context.colors.getColor(2), 'incorrect color for i=2').to.equal('blue')
        expect(this.context.colors.getColor(3), 'incorrect color for i=3').to.equal('red')
      })

      it('should return undefined when i is out of bounds', function () {
        expect(this.context.colors.getColor(4)).to.equal(undefined)
      })
    })

    describe('when no groups are defined', function () {
      beforeEach(function () {
        this.context = {}
        this.context.config = {
          colorWheel: ['red', 'blue'],
          legend: { addGroup: () => {} }
        }
        this.context.colors = new PlotColors(this.context.config)
      })

      it('should return the first color, regardless of the index', function () {
        expect(this.context.colors.getColor(0), 'incorrect color for i=0').to.equal('red')
        expect(this.context.colors.getColor(1), 'incorrect color for i=1').to.equal('red')
      })
    })
  })
})
