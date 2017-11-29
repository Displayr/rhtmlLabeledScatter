import AbstractTitle from './AbstractTitle'

class AxisTitle extends AbstractTitle {
  constructor (axisTitle, axisFontColor, axisFontSize, axisFontFamily, topPadding) {
    super(axisTitle, axisFontColor, axisFontSize, axisFontFamily)
    this.topPadding = topPadding
    this.anchor = 'middle'
    this.font.weight = 'normal'

    if (this.text === '') {
      this.height = 0
    } else {
      this.height = axisFontSize
    }

    this.display = this.text === '' ? 'none' : ''
  }

  getTopPadding () { return this.topPadding }

  setTransform (t) { this.transform = t }

  drawWith (plotId, svg) {
    svg.selectAll(`.plt-${plotId}-axisTitle`).remove()
    svg.append('text')
       .attr('class', 'axis-label')
       .attr('x', this.x)
       .attr('y', this.y)
       .attr('font-family', this.font.family)
       .attr('font-size', this.font.size)
       .attr('fill', this.font.color)
       .attr('text-anchor', this.anchor)
       .attr('transform', this.transform)
       .text(this.text)
       .style('font-weight', this.font.weight)
       .style('display', this.display)
  }
}

module.exports = AxisTitle
