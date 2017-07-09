import autoBind from 'es6-autobind'

class ViewBox {
  constructor (width, height) {
    this.width = width
    this.height = height
    autoBind(this)
  }
}

module.exports = ViewBox
