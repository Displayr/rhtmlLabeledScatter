class LegendItem {
  constructor (id, text, color, isDraggable) {
    this.id = id
    this.text = text
    this.color = color
    this.isDraggable = isDraggable
  }

  setPosition (x, y) {
    this.x = x
    this.y = y
  }
}

module.exports = LegendItem
