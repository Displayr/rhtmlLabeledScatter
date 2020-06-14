
import d3 from 'd3'
import $ from 'jquery'
import _ from 'lodash'
import Utils from './Utils'

class DragUtils {
  // address "extreme" coupling to plot
  static getLabelDragAndDrop (plot, showTrendLine = false) {
    const dragStart = () => plot.svg.selectAll('.link').remove()

    const dragMove = function () {
      d3.select(this)
        .attr('x', d3.event.x)
        .attr('y', d3.event.y)

      // Save the new location of text so links can be redrawn
      const id = d3.select(this).attr('id')
      const label = _.find(plot.data.lab, l => l.id === Number(id))
      if ($(this).prop('tagName') === 'image') {
        label.x = d3.event.x + (label.width / 2)
        label.y = d3.event.y + label.height
        addMinMaxAreaToRectangle(label)
      } else {
        label.x = d3.event.x + (label.width / 2)
        label.y = d3.event.y + label.height
        addMinMaxAreaToRectangle(label)
      }
    }

    const dragEnd = function () {
      // If label is dragged out of viewBox, remove the lab and add to legend
      const id = Number(d3.select(this).attr('id'))
      const label = _.find(plot.data.lab, l => l.id === id)
      const anchor = _.find(plot.data.pts, a => a.id === id)

      const notBubblePlot = !Utils.isArrOfNums(this.Z)
      const labIsLogo = label.url !== ''
      // TODO use shared intersection code here
      const labOnTopOfPoint = (label.minX < anchor.x && anchor.x < label.maxX) && (label.maxY > anchor.y && anchor.y > label.minY)

      if (plot.data.isOutsideViewBox(label) && !showTrendLine) {
        // Element dragged off plot
        plot.data.addElemToLegend(id)
        plot.state.pushLegendPt(id)
        plot.resetPlotAfterDragEvent()
      } else if (labIsLogo && notBubblePlot && labOnTopOfPoint) {
        // For logo labels and not bubbles, if the logo is directly on top of the point, do not draw point
        plot.svg.select(`#anc-${id}`).attr('fill-opacity', 0)
      } else {
        plot.state.pushUserPositionedLabel({
          id,
          x: label.x + (label.width / 2),
          y: label.y + label.height,
          vb: plot.vb
        })
        plot.svg.select(`#anc-${id}`).attr('fill-opacity', d => d.fillOpacity)
        if (!showTrendLine) {
          plot.drawLinks()
        }
      }
    }

    return d3.behavior.drag()
      .origin(function () {
        return {
          x: d3.select(this).attr('x'),
          y: d3.select(this).attr('y')
        }
      })
      .on('dragstart', dragStart)
      .on('drag', dragMove)
      .on('dragend', dragEnd)
  }

  static getLegendLabelDragAndDrop (plot, data) {
    const dragStart = _.noop

    const dragMove = function () {
      d3.select(this)
        .attr('x', (d3.select(this).x = d3.event.x))
        .attr('y', (d3.select(this).y = d3.event.y))

      // Save the new location of text so links can be redrawn
      const id = d3.select(this).attr('id').split('legend-')[1]
      const legendPt = _.find(data.legend.pts, l => l.id === Number(id))
      legendPt.lab.x = d3.event.x
      legendPt.lab.y = d3.event.y
    }

    const dragEnd = function () {
      const id = Number(d3.select(this).attr('id').split('legend-')[1])
      const legendPt = _.find(data.legend.pts, l => l.id === Number(id))
      if (plot.data.isLegendPtOutsideViewBox(legendPt.lab)) {
        d3.select(this)
          .attr('x', (d3.select(this).x = legendPt.x))
          .attr('y', (d3.select(this).y = legendPt.y))
      } else {
        // Element dragged onto plot
        plot.data.removeElemFromLegend(id)
        plot.state.pullLegendPt(id)
        plot.resetPlotAfterDragEvent()
      }
    }

    return d3.behavior.drag()
      .origin(function () {
        return {
          x: d3.select(this).attr('x'),
          y: d3.select(this).attr('y')
        }
      })
      .on('dragstart', dragStart)
      .on('drag', dragMove)
      .on('dragend', dragEnd)
  }
}

module.exports = DragUtils

// duplicated in 3 places
// assume x,y is top left
const addMinMaxAreaToRectangle = (rect) => {
  rect.minX = rect.x - rect.width / 2
  rect.maxX = rect.x + rect.width / 2
  rect.minY = rect.y - rect.height
  rect.maxY = rect.y
  rect.area = rect.width * rect.height
  return rect
}
