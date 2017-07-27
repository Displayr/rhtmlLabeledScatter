import autoBind from 'es6-autobind'
import _ from 'lodash'

class LegendSettings {
  constructor (show, showBubbles,
               fontFamily, fontSize, fontColor,
               bubbleFontFamily, bubbleFontSize, bubbleFontColor,
               bubbleTitleFontFamily, bubbleTitleFontSize, bubbleTitleFontColor) {
    this.show = show
    this.showBubbles = showBubbles
    this.font = {
      family: fontFamily,
      size: fontSize,
      color: fontColor
    }
    this.bubble = {
      font: {
        family: _.isEmpty(bubbleFontFamily) ? fontFamily : bubbleFontFamily,
        size: _.isEmpty(bubbleFontSize) ? fontFamily : bubbleFontSize,
        color: _.isEmpty(bubbleFontColor) ? fontColor : bubbleFontColor
      },
      titleFont: {
        family: _.isEmpty(bubbleTitleFontFamily) ? fontFamily : bubbleTitleFontFamily,
        size: _.isEmpty(bubbleTitleFontSize) ? fontSize : bubbleTitleFontSize,
        color: _.isEmpty(bubbleTitleFontColor) ? fontColor : bubbleTitleFontColor
      }
    }
    autoBind(this)
  }

  showLegend () { return this.show }
  showBubblesInLegend () { return this.showBubbles }
  getFontFamily () { return this.font.family }
  getFontSize () { return this.font.size }
  getFontColor () { return this.font.color }
  getBubbleFontFamily () { return this.bubble.font.family }
  getBubbleFontSize () { return this.bubble.font.size }
  getBubbleFontColor () { return this.bubble.font.color }
  getBubbleTitleFontFamily () { return this.bubble.titleFont.family }
  getBubbleTitleFontSize () { return this.bubble.titleFont.size }
  getBubbleTitleFontColor () { return this.bubble.titleFont.color }
}

module.exports = LegendSettings
