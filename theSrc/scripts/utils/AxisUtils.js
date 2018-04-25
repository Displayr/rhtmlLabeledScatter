import _ from 'lodash'
import Utils from './Utils'
import d3 from 'd3'
import { scaleTime } from 'd3-scale'
import TickLabel from './TickLabel'
import TickLine from './TickLine'

/* To Refactor:
 *  * marker leader lines + labels can surely be grouped or at least the lines can be derived at presentation time
 */

class AxisUtils {
  static _getScaleLinear (min, max) {
    const range = max - min
    const scaleLinear = d3.scale.linear()
                                .domain([min, max])
                                .range(range)
    return scaleLinear.ticks(5)
  }

  static _getRoundedScaleLinear (min, max, unitMajor) {
    let scaleLinear = []

    if (_.isNull(unitMajor) || _.isUndefined(unitMajor)) {
      const tickInterval = this._getTickInterval(min, max)
      const tickExp = this._getTickExponential(tickInterval)
      scaleLinear = this._getScaleLinear(min, max)
      return _.map(scaleLinear, n => _.round(n, tickExp))
    } else {
      // If user has defined tick interval
      let i = 0
      if (min <= 0 && max >= 0) {
        while ((i <= max) || (-i >= min)) {
          if (i >= 0 && i < max) {
            scaleLinear.push(i)
          }
          if (-i < 0 && -i > min) {
            scaleLinear.push(-i)
          }
          i += unitMajor / 2
        }
      } else {
        const tickExp = this._getTickExponential(unitMajor)
        i = _.ceil(_.toNumber(min), -tickExp)
        while (i < max) {
          scaleLinear.push(_.round(i, tickExp))
          i += unitMajor / 2
        }
      }
      return _.sortBy(scaleLinear)
    }
  }

  static _getRoundedScaleTime (min, max) {
    // let scaleDateTime = []
    console.log('*******************************')
    console.log(min)
    console.log(max)
    console.log(scaleTime().domain([min, max]).range(max - min).ticks(5))
    let a = scaleTime().domain([min, max]).range(max - min).ticks(5)
    console.log(a[0].getTime())
  }

  static _getTickInterval (min, max) {
    const scaleTicks = this._getScaleLinear(min, max)
    const unroundedTickInterval = Math.abs(scaleTicks[0] - scaleTicks[1])
    return _.round(unroundedTickInterval, this._getTickExponential(unroundedTickInterval))
  }

  static _getTickExponential (unroundedTickSize) {
    // Round to 2 sig figs
    let exponentTick = Utils.getExponentOfNum(unroundedTickSize)
    exponentTick *= -1
    return exponentTick
  }

  static _normalizeXCoords (data, Xcoord) {
    const { vb } = data
    return (((Xcoord - data.minX) / (data.maxX - data.minX)) * vb.width) + vb.x
  }

  static _normalizeYCoords (data, Ycoord) {
    const { vb } = data
    return ((-(Ycoord - data.minY) / (data.maxY - data.minY)) * vb.height) + vb.y + vb.height
  }

  // TODO KZ calculation of x axis and y axis are independent ? If so, then split into a reusable function
  static getAxisDataArrays (plot, data, vb, axisSettings) {
    // exit if all points have been dragged off plot
    if (!(data.len > 0)) {
      return {}
    }

    const gridLineStack = []
    const axisLeaderStack = []
    const axisLeaderLabelStack = []
    const originAxis = []

    const pushTickLabel = (type, x1, y1, x2, y2, label, tickIncrement) => {
      const leaderLineLen = plot.axisLeaderLineLength
      const labelHeight = _.max([plot.axisDimensionText.rowMaxHeight, plot.axisDimensionText.colMaxHeight])
      const { decimals, xPrefix, yPrefix, xSuffix, ySuffix } = plot
      const tickLine = new TickLine(x1, y1, x2, y2, leaderLineLen, label)

      if (type === 'col') {
        const tickLabel = new TickLabel(label, tickIncrement, decimals.x, xPrefix, xSuffix, data.isXdate, leaderLineLen, labelHeight, x1, y1, x2, y2)
        axisLeaderStack.push(tickLine.getXAxisTickLineData())
        axisLeaderLabelStack.push(tickLabel.getXAxisLabelData())
      }

      if (type === 'row') {
        const tickLabel = new TickLabel(label, tickIncrement, decimals.y, yPrefix, ySuffix, false, leaderLineLen, labelHeight, x1, y1, x2, y2)
        axisLeaderStack.push(tickLine.getYAxisTickLineData())
        axisLeaderLabelStack.push(tickLabel.getYAxisLabelData())
      }
    }

    const getTicks = (userTickInterval, min, max) => {
      let ticks = null
      if (Utils.isNum(userTickInterval)) {
        ticks = userTickInterval / 2
      } else {
        ticks = this._getTickInterval(min, max)
      }
      return ticks
    }

    // Call to find Max and mins as users may have moved points out of the plot
    data.calculateMinMax()
    this._getRoundedScaleTime(data.minX, data.maxX)

    let ticksX = getTicks(plot.xBoundsUnitsMajor, data.minX, data.maxX)
    const xRoundedScaleLinear = this._getRoundedScaleLinear(data.minX, data.maxX, plot.xBoundsUnitsMajor)
    _.map(xRoundedScaleLinear, (val, i) => {
      if (val === 0) {
        const xCoordOfYAxisOrigin = this._normalizeXCoords(data, 0)
        const yAxisOrigin = {
          x1: xCoordOfYAxisOrigin,
          y1: vb.y,
          x2: xCoordOfYAxisOrigin,
          y2: vb.y + vb.height
        }
        if (axisSettings.showX) {
          pushTickLabel('col', yAxisOrigin.x1, yAxisOrigin.y1, yAxisOrigin.x2, yAxisOrigin.y2, 0, ticksX)
        }
        if ((data.minX !== 0) && (data.maxX !== 0)) {
          originAxis.push(yAxisOrigin)
        }
      } else {
        let x1 = this._normalizeXCoords(data, val)
        let y1 = vb.y
        let x2 = this._normalizeXCoords(data, val)
        let y2 = vb.y + vb.height
        gridLineStack.push({ x1, y1, x2, y2 })
        if (axisSettings.showX) {
          pushTickLabel('col', x1, y1, x2, y2, val, ticksX)
        }
      }
    })

    let ticksY = getTicks(plot.yBoundsUnitsMajor, data.minY, data.maxY)
    const yRoundedScaleLinear = this._getRoundedScaleLinear(data.minY, data.maxY, plot.yBoundsUnitsMajor)
    _.map(yRoundedScaleLinear, (val, i) => {
      if (val === 0) {
        const yCoordOfXAxisOrigin = this._normalizeYCoords(data, 0)
        const xAxisOrigin = {
          x1: vb.x,
          y1: yCoordOfXAxisOrigin,
          x2: vb.x + vb.width,
          y2: yCoordOfXAxisOrigin
        }
        if (axisSettings.showY) {
          pushTickLabel('row', xAxisOrigin.x1, xAxisOrigin.y1, xAxisOrigin.x2, xAxisOrigin.y2, 0, ticksY)
        }
        if ((data.minY !== 0) && (data.maxY !== 0)) {
          originAxis.push(xAxisOrigin)
        }
      } else {
        let x1 = vb.x
        let y1 = this._normalizeYCoords(data, val)
        let x2 = vb.x + vb.width
        let y2 = this._normalizeYCoords(data, val)
        gridLineStack.push({x1, y1, x2, y2})
        if (axisSettings.showY) {
          pushTickLabel('row', x1, y1, x2, y2, val, ticksY)
        }
      }
    })

    return {
      gridOrigin: originAxis,
      gridLines: gridLineStack,
      axisLeader: axisLeaderStack,
      axisLeaderLabel: axisLeaderLabelStack
    }
  }
}

module.exports = AxisUtils
