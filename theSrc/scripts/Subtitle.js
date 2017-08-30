
class Subtitle {
  constructor (subtitleText, subtitleFont) {
    this.font = subtitleFont
    this.text = this.parseMultiLineText(subtitleText)

    // Positional parameter initialization
    this.x = 0
    this.y = 0
    this.padding = {
      inner: 5,
      outer: 5
    }
  }

  parseMultiLineText (text) {
    return text.split('<br>')
  }

  setInitPosition (x, y) {
    this.x = x
    this.y = y
  }

  getDimensions (svg) {
    const tempPlotId = 0
    const tempSubtitleSvg = this.drawWith(tempPlotId, svg)
    const subtitleSvgBB = tempSubtitleSvg.getBBox()
    this.dimensions = {
      height: subtitleSvgBB.height,
      width: subtitleSvgBB.width
    }
    tempSubtitleSvg.remove()
    return this.dimensions
  }

  drawWith (plotId, svg) {
    svg.selectAll(`.plt-${plotId}-subtitle`).remove()
    return svg.selectAll(`.plt-${plotId}-subtitle`)
              .data(this.text)
              .enter()
              .append('text')
              .attr('class', `plt-${plotId}-subtitle`)
              .attr('x', this.x)
              .attr('y', (d, i) => this.y + (i * (this.font.size + this.padding.inner)))
              .attr('fill', this.font.color)
              .attr('font-family', this.font.family)
              .attr('font-size', this.font.size)
              .attr('text-anchor', 'middle')
              .text(d => d)
  }
}

module.exports = Subtitle
