class ViewBox {
  constructor (width,
               height,
               padding,
               legend,
               title,
               labelsFont,
               axisLeaderLineLength,
               axisDimensionText,
               xTitle,
               yTitle) {
    this.svgWidth = width
    this.svgHeight = height

    this.width = width - legend.getWidth() - (padding.horizontal * 3) - axisLeaderLineLength - axisDimensionText.rowMaxWidth - yTitle.textHeight - axisDimensionText.rightPadding
    this.height = height - (padding.vertical * 2) - title.textHeight - title.paddingBot - axisDimensionText.colMaxHeight - xTitle.textHeight - axisLeaderLineLength - xTitle.topPadding

    this.x = (padding.horizontal * 2) + axisDimensionText.rowMaxWidth + axisLeaderLineLength + yTitle.textHeight
    this.y = padding.vertical + title.textHeight + title.paddingBot

    this.labelFontSize = labelsFont.size
    this.labelSmallFontSize = labelsFont.size * 0.75
    this.labelFontColor = labelsFont.color
    this.labelFontFamily = labelsFont.family
    this.labelLogoScale = labelsFont.logoScale

    // Max width of legend is determinant on size of widget
    legend.setMaxWidth(this.svgWidth * 0.4)
  }
}

module.exports = ViewBox
