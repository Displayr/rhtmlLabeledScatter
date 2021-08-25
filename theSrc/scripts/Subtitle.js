import _ from 'lodash'
import AbstractTitle from './AbstractTitle'

class Subtitle extends AbstractTitle {
  constructor (subtitleText,
               subtitleFontColor,
               subtitleFontSize,
               subtitleFontFamily) {
    super(subtitleText, subtitleFontColor, subtitleFontSize, subtitleFontFamily)
    this.font.size = _.isNumber(subtitleFontSize) ? subtitleFontSize : 0

    // Positional parameter initialization
    this.padding = {
      inner: 2,
      top: 0,
      bot: this.font.size / 4 + 15,
    }
    const ifTextEmptyHeight = 0
    this.generateMultiLineTextArray(ifTextEmptyHeight)
  }

  drawWith (plotId, svg) {
    svg.selectAll(`.plt-${plotId}-subtitle`).remove()
    return svg.selectAll(`.plt-${plotId}-subtitle`)
              .data(this.text)
              .enter()
              .append('text')
              .attr('class', `plt-${plotId}-subtitle`)
              .attr('x', this.x)
              .attr('y', (d, i) => this.y + this.padding.top + this.font.size + (i * (this.font.size + this.padding.inner)))
              .attr('fill', this.font.color)
              .attr('font-family', this.font.family)
              .attr('font-size', this.font.size)
              .attr('text-anchor', 'middle')
              .text(d => d)
  }
}

module.exports = Subtitle
