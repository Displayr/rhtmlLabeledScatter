class TickLine {
  constructor (x1, y1, x2, y2, length, associatedLabel) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.length = length
    this.associatedLabel = associatedLabel
  }

  getXAxisTickLineData () {
    return {
      x1: this.x1,
      y1: this.y2,
      x2: this.x1,
      y2: this.y2 + this.length,
      num: this.associatedLabel,
      type: 'x',
    }
  }

  getYAxisTickLineData () {
    return {
      x1: this.x1 - this.length,
      y1: this.y1,
      x2: this.x1,
      y2: this.y2,
      num: this.associatedLabel,
      type: 'y',
    }
  }
}

module.exports = TickLine
