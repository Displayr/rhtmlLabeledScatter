import AbstractTitle from './AbstractTitle'
class AxisTitle extends AbstractTitle {
  constructor (axisTitle, axisFontColor, axisFontSize, axisFontFamily, topPadding, axisId) {
    super(axisTitle, axisFontColor, axisFontSize, axisFontFamily)
    this.padding = {
      top: topPadding,
    }
    this.anchor = 'middle'
    this.font.weight = 'normal'
    this.padding = {
      top: 0,
      bot: 3,
      inner: 5,
    }

    this.generateMultiLineTextArray(0)
    this.display = this.text === '' ? 'none' : ''

    // Id to maintain uniqueness on D3 selection
    this.axisId = axisId
  }

  getTopPadding () { return this.padding.top }

  setTransform (t) { this.transform = t }

  drawWith (plotId, svg) {
    svg.selectAll(`.plt-${plotId}-axisTitle-${this.axisId}`).remove()
    const numOfLines = this.text.length - 1
    const numOfSpacesBtwnLines = this.text.length - 2
    const startingYPosition = this.padding.top + this.y - (numOfLines * this.font.size + numOfSpacesBtwnLines * this.padding.inner) - this.padding.bot
    svg.selectAll(`.plt-${plotId}-axisTitle-${this.axisId}`)
       .data(this.text)
       .enter()
       .append('text')
       .attr('class', `plt-${plotId}-axisTitle-${this.axisId}`)
       .attr('x', this.x)
       .attr('y', (d, i) => startingYPosition + (i * (this.font.size + this.padding.inner)))
       .attr('font-family', this.font.family)
       .attr('font-size', this.font.size)
       .attr('fill', this.font.color)
       .attr('text-anchor', this.anchor)
       .attr('transform', this.transform)
       .style('font-weight', this.font.weight)
       .style('display', this.display)
       .text(d => d)
  }
}

module.exports = AxisTitle
