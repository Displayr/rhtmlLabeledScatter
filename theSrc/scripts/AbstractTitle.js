import _ from 'lodash'

class AbstractTitle {
  constructor (titleText,
               titleFontColor,
               titleFontSize,
               titleFontFamily) {
    this.text = titleText
    this.font = {
      color: titleFontColor,
      size: titleFontSize,
      family: titleFontFamily,
    }

    // Vars that need initialisation
    this.height = 0
    this.x = 0
    this.y = 0
    this.padding = {
      top: 0,
      bot: 0,
      inner: 0,
    }
  }

  setX (x) { this.x = x }

  setY (y) { this.y = y }

  getHeight () { return this.height }

  parseMultiLineText (text) { return text.split('<br>') }

  generateMultiLineTextArray (ifTextEmptyHeight) {
    if (this.text !== '' && _.isString(this.text)) {
      this.text = this.parseMultiLineText(this.text)
      const linesOfText = this.text.length
      const numPaddingBtwnLines = linesOfText > 0 ? linesOfText - 1 : 0
      this.height = (this.font.size * linesOfText) +
        (this.padding.inner * numPaddingBtwnLines) +
        (this.padding.top + this.padding.bot)
    } else {
      this.text = []
      this.height = ifTextEmptyHeight
    }
  }

  getText () { return this.text }

  // Not implemented, need to override
  drawWith (plotId, svg) {}
}

module.exports = AbstractTitle
