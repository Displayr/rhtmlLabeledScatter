import _ from 'lodash'
import AbstractTitle from './AbstractTitle'

class Footer extends AbstractTitle {
  constructor (footerText, footerFontColor, footerFontSize, footerFontFamily, containerHeight, plotPaddingVertical) {
    super(footerText, footerFontColor, footerFontSize, footerFontFamily)
    this.font.size = _.isNumber(footerFontSize) ? footerFontSize : 0

    this.padding = {
      inner: 0,
      top: 10,
      bot: this.font.size / 4,
    }

    this.generateMultiLineTextArray(0)
    this.plotPaddingVertical = plotPaddingVertical
    this.updateContainerHeight(containerHeight)
  }

  updateContainerHeight (height) {
    this.y = height - this.getHeight() + this.padding.top + this.font.size - this.plotPaddingVertical
  }

  drawWith (plotId, svg) {
    svg.selectAll(`.plt-${plotId}-footer`).remove()
    return svg.selectAll(`.plt-${plotId}-footer`)
    .data(this.text)
    .enter()
    .append('text')
    .attr('class', `plt-${plotId}-footer`)
    .attr('x', this.x)
    .attr('y', (d, i) => this.y + (i * (this.font.size + this.padding.inner)))
    .attr('fill', this.font.color)
    .attr('font-family', this.font.family)
    .attr('font-size', this.font.size)
    .attr('text-anchor', 'middle')
    .text(d => d)
  }
}

module.exports = Footer
