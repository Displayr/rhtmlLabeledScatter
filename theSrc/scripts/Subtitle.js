import _ from 'lodash'
import AbstractTitle from './AbstractTitle'

class Subtitle extends AbstractTitle {
  constructor (subtitleText,
               subtitleFontColor,
               subtitleFontSize,
               subtitleFontFamily,
               titleText) {
    super(subtitleText, subtitleFontColor, subtitleFontSize, subtitleFontFamily)
    this.font.size = _.isNumber(subtitleFontSize) ? subtitleFontSize : 0

    // Positional parameter initialization
    this.padding = {
      inner: 2,
      top: 10,
      bot: 20
    }

    if (this.text !== '' && _.isString(this.text)) {
      this.text = this.parseMultiLineText(subtitleText)
      const linesOfText = this.text.length
      const numPaddingBtwnLines = linesOfText > 0 ? linesOfText - 1 : 0
      this.height = (this.font.size * linesOfText) +
        (this.padding.inner * numPaddingBtwnLines) +
        (this.padding.top + this.padding.bot)
    } else {
      this.text = []
      this.height = (titleText === '') ? 0 : this.padding.bot
    }
  }

  drawWith (plotId, svg) {
    svg.selectAll(`.plt-${plotId}-subtitle`).remove()
    return svg.selectAll(`.plt-${plotId}-subtitle`)
              .data(this.text)
              .enter()
              .append('text')
              .attr('class', `plt-${plotId}-subtitle`)
              .attr('x', this.x)
              .attr('y', (d, i) => this.padding.top + this.y + (i * (this.font.size + this.padding.inner)))
              .attr('fill', this.font.color)
              .attr('font-family', this.font.family)
              .attr('font-size', this.font.size)
              .attr('text-anchor', 'middle')
              .text(d => d)
  }
}

module.exports = Subtitle
