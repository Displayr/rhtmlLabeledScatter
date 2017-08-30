import _ from 'lodash'

class Title {
  constructor (titleText,
               titleFontColor,
               titleFontSize,
               titleFontFamily,
               axisFontSize) {
    this.text = titleText
    this.font = {
      color: titleFontColor,
      size: titleFontSize,
      family: titleFontFamily
    }

    // Positional param initialisation
    this.x = 0
    this.y = 0

    if (this.text === '' || !_.isString(this.text)) {
      // If empty title height, vertical axis numbers may need excess padding
      this.height = _.isNumber(axisFontSize) ? axisFontSize / 2 : 0
      this.paddingBot = 0
    } else {
      this.height = this.font.size
      this.paddingBot = 20
    }
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

  drawWith (plotId, svg) {
    if (this.text !== '') {
      console.log('TitleDraw!!!')
      svg.selectAll(`.plt-${plotId}-title`).remove()
      return svg.append('text')
                .attr('class', `plt-${plotId}-title`)
                .attr('x', this.x)
                .attr('y', this.y)
                .attr('fill', this.font.color)
                .attr('font-family', this.font.family)
                .attr('font-size', this.font.size)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'normal')
                .text(this.text)
    }
  }
}

module.exports = Title
