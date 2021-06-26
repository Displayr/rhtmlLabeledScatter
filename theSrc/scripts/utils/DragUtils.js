
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
      } else {
        label.x = d3.event.x
        label.y = d3.event.y
      }
    }

    const dragEnd = function () {
      // If label is dragged out of viewBox, remove the lab and add to legend
      const id = Number(d3.select(this).attr('id'))
      const lab = _.find(plot.data.lab, l => l.id === id)
      const anc = _.find(plot.data.pts, a => a.id === id)

      const notBubblePlot = !Utils.isArrOfNums(this.Z)
      const labIsNotLogo = lab.url !== ''
      const labOnTopOfPoint = (lab.x - (lab.width / 2) < anc.x && anc.x < lab.x + (lab.width / 2)) && (lab.y > anc.y && anc.y > lab.y - lab.height)

      if (plot.data.isOutsideViewBox(lab) && !showTrendLine) {
        // Element dragged off plot
        plot.data.addElemToLegend(id)
        plot.state.pushLegendPt(id)
        plot.resetPlotAfterDragEvent()
      } else if (labIsNotLogo && notBubblePlot && labOnTopOfPoint) {
        // For logo labels and not bubbles, if the logo is directly on top of the point, do not draw point
        plot.svg.select(`#anc-${id}`).attr('fill-opacity', 0)
      } else {
        plot.state.pushUserPositionedLabel(id, lab.x, lab.y, plot.vb)
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
          y: d3.select(this).attr('y'),
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
          y: d3.select(this).attr('y'),
        }
      })
      .on('dragstart', dragStart)
      .on('drag', dragMove)
      .on('dragend', dragEnd)
  }
}

module.exports = DragUtils
