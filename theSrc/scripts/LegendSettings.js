import autoBind from 'es6-autobind'
import _ from 'lodash'
import Utils from './utils/Utils'

class LegendSettings {
  constructor (show, showBubbles,
               fontFamily, fontSize, fontColor,
               bubbleFontFamily, bubbleFontSize, bubbleFontColor,
               bubbleTitleFontFamily, bubbleTitleFontSize, bubbleTitleFontColor, zTitle, zPrefix, zSuffix) {
    autoBind(this)
    this.show = show
    this.showBubbles = showBubbles
    this.font = {
      family: fontFamily,
      size: fontSize,
      color: fontColor,
    }
    this.bubble = {
      font: {
        family: _.isString(bubbleFontFamily) ? bubbleFontFamily : fontFamily,
        size: _.isNumber(bubbleFontSize) ? bubbleFontSize : fontSize,
        color: _.isString(bubbleFontColor) ? bubbleFontColor : fontColor,
      },
      titleFont: {
        family: _.isString(bubbleTitleFontFamily) ? bubbleTitleFontFamily : fontFamily,
        size: _.isNumber(bubbleTitleFontSize) ? bubbleTitleFontSize : fontSize,
        color: _.isString(bubbleTitleFontColor) ? bubbleTitleFontColor : fontColor,
      },
    }
    this.title = zTitle
    this.zPrefix = zPrefix
    this.zSuffix = zSuffix
  }

  isDisplayed (Z, legendPts) {
    return this.showLegend() || (this.showBubblesInLegend() && Utils.isArrOfNums(Z)) || !(_.isNull(legendPts))
  }

  showLegend () { return this.show }
  hasTitleText () { return this.title !== '' }
  getTitle () { return this.title }
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
