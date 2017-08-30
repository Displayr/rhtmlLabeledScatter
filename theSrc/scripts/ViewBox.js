class ViewBox {
  constructor (width,
               height,
               padding,
               legend,
               title,
               subtitle,
               labelsFont,
               axisLeaderLineLength,
               axisDimensionText,
               xTitle,
               yTitle) {
    this.svgWidth = width
    this.svgHeight = height

    const titlesAndPaddingHeight = title.getHeight() + title.paddingBot + subtitle.getHeight()

    this.setWidth(width - legend.getWidth() - (padding.horizontal * 3) - axisLeaderLineLength - axisDimensionText.rowMaxWidth - yTitle.textHeight - axisDimensionText.rightPadding)
    this.setHeight(height - (padding.vertical * 2) - titlesAndPaddingHeight - axisDimensionText.colMaxHeight - xTitle.textHeight - axisLeaderLineLength - xTitle.topPadding)

    this.x = (padding.horizontal * 2) + axisDimensionText.rowMaxWidth + axisLeaderLineLength + yTitle.textHeight
    this.y = padding.vertical + titlesAndPaddingHeight

    this.labelFontSize = labelsFont.size
    this.labelSmallFontSize = labelsFont.size * 0.75
    this.labelFontColor = labelsFont.color
    this.labelFontFamily = labelsFont.family
    this.labelLogoScale = labelsFont.logoScale

    // Max width of legend is determinant on size of widget
    legend.setMaxWidth(this.svgWidth * 0.4)
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
      console.log(h)
      console.log(this.svgWidth)
      console.log(this.svgHeight)
      throw new Error(`ViewBox height cannot be < 0! ! ${h}, ${this.svgWidth}, ${this.svgHeight}`)
    }
  }

  getLegendX () {
    return this.x + this.width
  }

  getTitleX () {
    return this.x + (this.width / 2)
  }
}

module.exports = ViewBox
