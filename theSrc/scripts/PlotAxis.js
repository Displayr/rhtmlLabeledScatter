import AxisUtils from './utils/AxisUtils'

class PlotAxis {
  constructor (axisSettings, data, vb) {
    this.settings = axisSettings
    this.axisArrays = AxisUtils.getAxisDataArrays(data, vb, this.settings)
  }

  drawGridOriginWith (svg, isDashed) {
    svg.selectAll('.origin').remove()
    svg.selectAll('.origin')
       .data(this.axisArrays.gridOrigin)
       .enter()
       .append('line')
       .attr('class', 'origin')
       .attr('x1', d => d.x1)
       .attr('y1', d => d.y1)
       .attr('x2', d => d.x2)
       .attr('y2', d => d.y2)
       .attr('stroke-width', this.settings.strokeWidth)
       .attr('opacity', 1.0)
       .attr('stroke', '#e1e1e1')
    if (isDashed) {
      svg.selectAll('.origin')
         .style('stroke-dasharray', ('4, 6'))
         .attr('stroke-width', this.settings.strokeWidth)
         .attr('opacity', 1)
         .attr('stroke', '#000000')
    }
  }

  drawGridLinesWith (svg) {
    svg.selectAll('.dim-marker').remove()
    svg.selectAll('.dim-marker')
       .data(this.axisArrays.gridLines)
       .enter()
       .append('line')
       .attr('class', 'dim-marker')
       .attr('x1', d => d.x1)
       .attr('y1', d => d.y1)
       .attr('x2', d => d.x2)
       .attr('y2', d => d.y2)
       .attr('stroke-width', this.settings.strokeWidth)
       .attr('opacity', 1.0)
       .attr('stroke', '#e1e1e1')
  }

  drawAxisLeaderWith (svg, showOrigin, showGrid) {
    if (showGrid) {
      svg.selectAll('.dim-marker-leader').remove()
      svg.selectAll('.dim-marker-leader')
         .data(this.axisArrays.axisLeader)
         .enter()
         .append('line')
         .attr('class', 'dim-marker-leader')
         .attr('x1', d => d.x1)
         .attr('y1', d => d.y1)
         .attr('x2', d => d.x2)
         .attr('y2', d => d.y2)
         .attr('stroke-width', this.settings.strokeWidth)
         .attr('opacity', d => {
           if (d.num === 0 && showOrigin) { return 1 } else { return 0.2 }
         })
         .attr('stroke', d => this.settings[d.type].fontColor)
    }

    svg.selectAll('.dim-marker-label').remove()
    svg.selectAll('.dim-marker-label')
       .data(this.axisArrays.axisLeaderLabel)
       .enter()
       .append('text')
       .attr('class', 'dim-marker-label')
       .attr('x', d => d.x)
       .attr('y', d => d.y)
       .attr('font-family', d => this.settings[d.type].fontFamily)
       .attr('fill', d => this.settings[d.type].fontColor)
       .attr('font-size', d => this.settings[d.type].fontSize)
       .text(d => d.label)
       .attr('text-anchor', d => d.anchor)
       .attr('type', d => d.type)
  }
}

module.exports = PlotAxis
