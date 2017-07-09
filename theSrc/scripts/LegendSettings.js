import autoBind from 'es6-autobind'

class LegendSettings {
  constructor (show, showBubbles, fontFamily, fontSize, fontColor) {
    this.show = show
    this.showBubbles = showBubbles
    this.font = {
      family: fontFamily,
      size: fontSize,
      color: fontColor
    }
    autoBind(this)
  }

  showLegend () { return this.show }
  showBubblesInLegend () { return this.showBubbles }
  getFontFamily () { return this.font.family }
  getFontSize () { return this.font.size }
  getFontColor () { return this.font.color }
}

module.exports = LegendSettings
