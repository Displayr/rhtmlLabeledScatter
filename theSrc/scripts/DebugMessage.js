import _ from 'lodash'

class DebugMessage {
  constructor (svg, viewBox, debugToggle) {
    this.svg = svg
    this.viewBox = viewBox
    this.debugToggle = debugToggle
    this.fontSize = 10
    this.x = 10
    this.y = 30
    this.fontColor = 'red'
  }

  draw (labels) {
    if (_.isBoolean(this.debugToggle) && this.debugToggle) {
      this.svg.selectAll('.debug-text').remove()
      const debugText = [
        'DEBUG MODE ON',
        'W: ' + String(this.viewBox.width),
        'H: ' + String(this.viewBox.height),
        'X: ' + String(this.viewBox.x),
        'Y: ' + String(this.viewBox.y),
        'wH: ' + String(this.svg.style('width')),
        'wW: ' + String(this.svg.style('height')),
      ]
      _.forEach(labels, (l) => {
        debugText.push(`${l.text}:${l.height}, ${l.width}`)
      })
      this.svg.selectAll('.debug-text')
              .data(debugText)
              .enter()
              .append('text')
              .attr('class', 'debug-text')
              .attr('font-size', this.fontSize)
              .attr('x', this.x)
              .attr('y', (d, i) => this.y + i * this.fontSize)
              .attr('fill', this.fontColor)
              .text(d => d)
    }
  }
}

module.exports = DebugMessage
