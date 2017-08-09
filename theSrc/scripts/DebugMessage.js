import _ from 'lodash'

class DebugMessage {
  constructor (svg, viewBox, debugToggle) {
    this.svg = svg
    this.viewBox = viewBox
    this.debugToggle = debugToggle
  }

  draw () {
    if (_.isBoolean(this.debugToggle) && this.debugToggle) {
      this.svg.selectAll('.debug-text').remove()
      const debugText = [
        'DEBUG MODE ON',
        'W: ' + String(this.viewBox.width),
        'H: ' + String(this.viewBox.height),
        'X: ' + String(this.viewBox.x),
        'Y: ' + String(this.viewBox.y),
        'wH: ' + String(this.svg.style('width')),
        'wW: ' + String(this.svg.style('height'))
      ]
      this.svg.selectAll('.debug-text')
              .data(debugText)
              .enter()
              .append('text')
              .attr('class', 'debug-text')
              .attr('x', 10)
              .attr('y', (d, i) => 50 + i * 15)
              .attr('fill', 'red')
              .text(d => d)
    }
  }
}

module.exports = DebugMessage
