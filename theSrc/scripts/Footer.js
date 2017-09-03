import _ from 'lodash'

class Footer {
  constructor (footerText, footerFontColor, footerFontSize, footerFontFamily, containerHeight) {
    this.font = {
      color: footerFontColor,
      size: _.isNumber(footerFontSize) ? footerFontSize : 0,
      family: footerFontFamily
    }
    this.text = footerText

    this.padding = {
      inner: 0,
      top: 15,
      bot: 10
    }

    if (this.text !== '' && _.isString(this.text)) {
      this.text = this.parseMultiLineText(footerText)
      const linesOfText = this.text.length
      const numPaddingBtwnLines = linesOfText > 0 ? linesOfText - 1 : 0
      this.height = (this.font.size * linesOfText) +
        (this.padding.inner * numPaddingBtwnLines) +
        (this.padding.top + this.padding.bot)
    } else {
      this.text = []
      this.height = 0
    }

    this.x = 0
    this.y = containerHeight - this.getHeight()
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
    svg.selectAll(`.plt-${plotId}-footer`).remove()
    return svg.selectAll(`.plt-${plotId}-footer`)
    .data(this.text)
    .enter()
    .append('text')
    .attr('class', `plt-${plotId}-footer`)
    .attr('x', this.x)
    .attr('y', (d, i) => this.padding.top + this.y + (i * (this.font.size + this.padding.inner)))
    .attr('fill', this.font.color)
    .attr('font-family', this.font.family)
    .attr('font-size', this.font.size)
    .attr('text-anchor', 'middle')
    .text(d => d)
  }
}

module.exports = Footer
