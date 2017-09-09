
class PlotAxisLabels {
  constructor (vb, axisLeaderLineLength, axisDimensionText, xTitle, yTitle, padding) {
    this.axisLabels = [
      { // x axis label
        x: vb.x + (vb.width / 2),
        y: vb.y + vb.height +
        axisLeaderLineLength +
        axisDimensionText.colMaxHeight +
        xTitle.topPadding +
        xTitle.textHeight,
        text: xTitle.text,
        anchor: 'middle',
        transform: 'rotate(0)',
        display: xTitle === '' ? 'none' : '',
        fontFamily: xTitle.fontFamily,
        fontSize: xTitle.fontSize,
        fontColor: xTitle.fontColor
      },
      { // y axis label
        x: padding.horizontal + yTitle.textHeight,
        y: vb.y + (vb.height / 2),
        text: yTitle.text,
        anchor: 'middle',
        transform: `rotate(270,${padding.horizontal + yTitle.textHeight}, ${vb.y + (vb.height / 2)})`,
        display: yTitle === '' ? 'none' : '',
        fontFamily: yTitle.fontFamily,
        fontSize: yTitle.fontSize,
        fontColor: yTitle.fontColor
      }
    ]
  }

  drawWith (svg) {
    svg.selectAll('.axis-label').remove()
    svg.selectAll('.axis-label')
       .data(this.axisLabels)
       .enter()
       .append('text')
       .attr('class', 'axis-label')
       .attr('x', d => d.x)
       .attr('y', d => d.y)
       .attr('font-family', d => d.fontFamily)
       .attr('font-size', d => d.fontSize)
       .attr('fill', d => d.fontColor)
       .attr('text-anchor', d => d.anchor)
       .attr('transform', d => d.transform)
       .text(d => d.text)
       .style('font-weight', 'normal')
       .style('display', d => d.display)
  }
}

module.exports = PlotAxisLabels
