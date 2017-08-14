import _ from 'lodash'
import Utils from './Utils'
import d3 from 'd3'

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

  static _getTickInterval (min, max) {
    const scaleTicks = this._getScaleLinear(min, max)
    const unroundedTickInterval = Math.abs(scaleTicks[0] - scaleTicks[1])
    return _.round(unroundedTickInterval, this._getTickExponential(unroundedTickInterval))
  }

  static _getTickExponential (unroundedTickSize) {
    // Round to 2 sig figs
    let exponentTick = this.getExponentOfNum(unroundedTickSize)
    exponentTick *= -1
    return exponentTick
  }

  static getExponentOfNum (num) {
    const numExponentialForm = num.toExponential()
    const exponent = _.toNumber(_.last(numExponentialForm.split('e')))
    return exponent
  }

  static _normalizeXCoords (data, Xcoord) {
    const { viewBoxDim } = data
    return (((Xcoord - data.minX) / (data.maxX - data.minX)) * viewBoxDim.width) + viewBoxDim.x
  }

  static _normalizeYCoords (data, Ycoord) {
    const { viewBoxDim } = data
    return ((-(Ycoord - data.minY) / (data.maxY - data.minY)) * viewBoxDim.height) + viewBoxDim.y + viewBoxDim.height
  }

  // TODO KZ calculation of x axis and y axis are independent ? If so, then split into a reusable function
  static getAxisDataArrays (plot, data, viewBoxDim, axisSettings) {
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
      const { xDecimals, yDecimals, xPrefix, yPrefix, xSuffix, ySuffix } = plot

      const computeNumDecimals = (tickIncr, userDecimals) => {
        // Return user specified number of decimals or 0 if the tickIncr is an integer
        if (!_.isNull(userDecimals)) return userDecimals
        if (_.isInteger(tickIncr)) return 0

        // Otherwise, return the inverse exponent of the tick increment
        const tickExponent = this.getExponentOfNum(tickIncr)
        return ((tickExponent < 0) ? Math.abs(tickExponent) : 0)
      }

      if (type === 'col') {
        const numDecimals = computeNumDecimals(tickIncrement, xDecimals)
        axisLeaderStack.push({
          x1,
          y1: y2,
          x2: x1,
          y2: y2 + leaderLineLen,
          num: label
        })
        axisLeaderLabelStack.push({
          x: x1,
          y: y2 + leaderLineLen + labelHeight,
          label: Utils.getFormattedNum(label, numDecimals, xPrefix, xSuffix),
          anchor: 'middle',
          type
        })
      }

      if (type === 'row') {
        const numDecimals = computeNumDecimals(tickIncrement, yDecimals)
        axisLeaderStack.push({
          x1: x1 - leaderLineLen,
          y1,
          x2: x1,
          y2,
          num: label
        })
        axisLeaderLabelStack.push({
          x: x1 - leaderLineLen,
          y: y2 + (labelHeight / 3),
          label: Utils.getFormattedNum(label, numDecimals, yPrefix, ySuffix),
          anchor: 'end',
          type
        })
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

    let ticksX = getTicks(plot.xBoundsUnitsMajor, data.minX, data.maxX)
    const xRoundedScaleLinear = this._getRoundedScaleLinear(data.minX, data.maxX, plot.xBoundsUnitsMajor)
    _.map(xRoundedScaleLinear, (val, i) => {
      if (val === 0) {
        const xCoordOfYAxisOrigin = this._normalizeXCoords(data, 0)
        const yAxisOrigin = {
          x1: xCoordOfYAxisOrigin,
          y1: viewBoxDim.y,
          x2: xCoordOfYAxisOrigin,
          y2: viewBoxDim.y + viewBoxDim.height
        }
        if (axisSettings.showX) {
          pushTickLabel('col', yAxisOrigin.x1, yAxisOrigin.y1, yAxisOrigin.x2, yAxisOrigin.y2, 0, ticksX)
        }
        if ((data.minX !== 0) && (data.maxX !== 0)) {
          originAxis.push(yAxisOrigin)
        }
      } else {
        let x1 = this._normalizeXCoords(data, val)
        let y1 = viewBoxDim.y
        let x2 = this._normalizeXCoords(data, val)
        let y2 = viewBoxDim.y + viewBoxDim.height
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
          x1: viewBoxDim.x,
          y1: yCoordOfXAxisOrigin,
          x2: viewBoxDim.x + viewBoxDim.width,
          y2: yCoordOfXAxisOrigin
        }
        if (axisSettings.showY) {
          pushTickLabel('row', xAxisOrigin.x1, xAxisOrigin.y1, xAxisOrigin.x2, xAxisOrigin.y2, 0, ticksY)
        }
        if ((data.minY !== 0) && (data.maxY !== 0)) {
          originAxis.push(xAxisOrigin)
        }
      } else {
        let x1 = viewBoxDim.x
        let y1 = this._normalizeYCoords(data, val)
        let x2 = viewBoxDim.x + viewBoxDim.width
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
