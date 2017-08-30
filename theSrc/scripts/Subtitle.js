import _ from 'lodash'

class Subtitle {
  constructor (subtitleText, subtitleFontColor, subtitleFontSize, subtitleFontFamily) {
    this.font = {
      color: subtitleFontColor,
      size: _.isNumber(subtitleFontSize) ? subtitleFontSize : 0,
      family: subtitleFontFamily
    }
    this.text = subtitleText

    // Positional parameter initialization
    this.x = 0
    this.y = 0
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
      this.height = this.padding.bot
    }
  }

  parseMultiLineText (text) {
    return text.split('<br>')
  }

  setX (x) {
    this.x = x
  }

  setY (y) {
    this.y = y
  }

  getHeight () {
    return this.height
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
