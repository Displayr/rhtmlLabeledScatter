class AbstractTitle {
  constructor (titleText,
               titleFontColor,
               titleFontSize,
               titleFontFamily) {
    this.text = titleText
    this.font = {
      color: titleFontColor,
      size: titleFontSize,
      family: titleFontFamily
    }

    // Vars that need initialisation
    this.height = 0
    this.x = 0
    this.y = 0
  }

  setX (x) {
    this.x = x
  }

  setY (y) {
    this.y = y
  }

  getHeight () {
    return this.height
  }

  parseMultiLineText (text) {
    return text.split('<br>')
  }

  drawWith (plotId, svg) {}
}

module.exports = AbstractTitle
