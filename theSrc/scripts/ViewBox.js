class ViewBox {
  constructor (width,
               height,
               padding,
               legend,
               title,
               subtitle,
               footer,
               labelsFont,
               axisLeaderLineLength,
               axisDimensionText,
               xTitle,
               yTitle) {
    this.svgWidth = width
    this.svgHeight = height

    const titleAndSubtitleHeight = title.getHeight() + subtitle.getHeight()
    const titleAndSubtitleAndFooterHeight = title.getHeight() + subtitle.getHeight() + footer.getHeight()

    this.setWidth(width - legend.getWidth() - (padding.horizontal * 3) - axisLeaderLineLength - axisDimensionText.rowMaxWidth - yTitle.getHeight() - axisDimensionText.rightPadding)
    this.setHeight(height - (padding.vertical * 2) - titleAndSubtitleAndFooterHeight - axisDimensionText.colMaxHeight - xTitle.getHeight() - axisLeaderLineLength - xTitle.getTopPadding())

    this.x = (padding.horizontal * 2) + axisDimensionText.rowMaxWidth + axisLeaderLineLength + yTitle.getHeight()
    this.y = padding.vertical + titleAndSubtitleHeight

    this.labelFontSize = labelsFont.size
    this.labelSmallFontSize = labelsFont.size * 0.75
    this.labelFontColor = labelsFont.color
    this.labelFontFamily = labelsFont.family
    this.labelLogoScale = labelsFont.logoScale

    // Max width of legend is determinant on size of widget
    legend.setMaxWidth(this.svgWidth * 0.33)
  }

  setWidth (w) {
    if (w > 0) {
      this.width = w
    } else {
      throw new Error(`ViewBox width cannot be < 0!`)
    }
  }

  setHeight (h) {
    if (h > 0) {
      this.height = h
    } else {
      throw new Error(`ViewBox height cannot be < 0! ! ${h}, ${this.svgWidth}, ${this.svgHeight}`)
    }
  }

  getLegendX () {
    return this.x + this.width
  }

  getTitleX () {
    return this.x + (this.width / 2)
  }

  drawBorderWith (svg, plotBorderSettings) {
    svg.selectAll('.plot-viewbox').remove()
    svg.append('rect')
       .attr('class', 'plot-viewbox')
       .attr('x', this.x)
       .attr('y', this.y)
       .attr('width', this.width)
       .attr('height', this.height)
       .attr('fill', 'none')
       .attr('stroke', plotBorderSettings.color)
       .attr('stroke-width', plotBorderSettings.width)
  }
}

module.exports = ViewBox
