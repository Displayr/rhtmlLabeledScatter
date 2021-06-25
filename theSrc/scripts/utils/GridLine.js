import autoBind from 'es6-autobind'

class GridLine {
  constructor (x1, y1, x2, y2) {
    autoBind(this)
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }

  getData () {
    return {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    }
  }
}

module.exports = GridLine
