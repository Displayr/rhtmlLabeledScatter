class PlotAxisLabels {
  constructor (vb, axisLeaderLineLength, axisDimensionText, xTitle, yTitle, padding) {
    this.xTitle = xTitle
    this.yTitle = yTitle

    this.xTitle.setX(vb.x + (vb.width / 2))
    this.xTitle.setY(vb.y + vb.height +
      axisLeaderLineLength + axisDimensionText.colMaxHeight + xTitle.getTopPadding() + xTitle.getHeight())
    this.xTitle.setTransform('rotate(0)')

    this.yTitle.setX(padding.horizontal + yTitle.getHeight())
    this.yTitle.setY(vb.y + (vb.height / 2))
    this.yTitle.setTransform(`rotate(270,${padding.horizontal + yTitle.getHeight()}, ${vb.y + (vb.height / 2)})`)
  }

  drawWith (plotId, svg) {
    this.xTitle.drawWith(plotId, svg)
    this.yTitle.drawWith(plotId, svg)
  }
}

module.exports = PlotAxisLabels
