const LabeledScatter = require('./LabeledScatter.js')
const $ = require('jquery')

describe('LabeledScatter:', function () {
  describe('draw()', function () {
    beforeEach(function () {
      this.context = {
        width: 100,
        height: 100,
        stateChangedCallback: () => {}
      }
      this.context.dataInitial = {
        X: [1, 2, 3],
        Y: [1, 2, 3],
        Z: [1, 2, 3],
        group: ['1', '2', '3'],
        label: ['1', '2', '3'],
        labelAlt: ['1', '2', '3'],
        title: '123',
        xTitle: '',
        yTitle: '',
        zTitle: '',
        colors: ['blue']
      }

      this.context.dataNew = {
        X: [1, 1, 3],
        Y: [1, 2, 3]
      }

      const element = $('<div>')
      this.context.labeledScatter = new LabeledScatter(
        element,
        this.context.width,
        this.context.height,
        this.context.stateChangedCallback
      )
    })

    it('should return when called draw on initial data', function () {
      this.context.labeledScatter.setConfig(this.context.dataInitial)
      this.context.labeledScatter.setUserState({})
      expect(this.context.labeledScatter.draw()).to.equal(this.context.labeledScatter)
    })

    it('should throw error when called draw on different data', function () {
      this.context.labeledScatter.setConfig(this.context.dataInitial)
      this.context.labeledScatter.setUserState({})
      this.context.labeledScatter.draw()
      expect(() => this.context.labeledScatter.setConfig(this.context.dataNew)).to.throw('rhtmlLabeledScatter reset')
    })

    it('should return when called on identical data', function () {
      this.context.labeledScatter.setConfig(this.context.dataInitial)
      this.context.labeledScatter.setUserState({})
      this.context.labeledScatter.draw()
      expect(() => this.context.labeledScatter.setConfig(this.context.dataInitial)).not.to.throw()
    })
  })
})
