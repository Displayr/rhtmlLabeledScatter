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
    return scaleLinear.ticks(8)
  }

  static _getStartingVal (min, max) {
    const scaleTicks = this._getScaleLinear(min, max)
    return scaleTicks[0]
  }

  static _getTickRange (min, max) {
    const scaleTicks = this._getScaleLinear(min, max)
    const unroundedTickSize = Math.abs(scaleTicks[0] - scaleTicks[1])

    // Round to 2 sig figs
    let exponentTick = this.getExponentOfNum(unroundedTickSize)
    exponentTick *= -1

    return _.round(unroundedTickSize, exponentTick)
  }

  static getExponentOfNum (num) {
    const numExponentialForm = num.toExponential()
    const exponent = _.toNumber(_.last(numExponentialForm.split('e')))
    return exponent
  }

  static _between (num, min, max) {
    return (num >= min) && (num <= max)
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
  static getAxisDataArrays (plot, data, viewBoxDim) {
    // exit if all points have been dragged off plot
    if (!(data.len > 0)) {
      return {}
    }

    const dimensionMarkerStack = []
    const dimensionMarkerLeaderStack = []
    const dimensionMarkerLabelStack = []

    const pushDimensionMarker = (type, x1, y1, x2, y2, label, tickIncrement) => {
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
        dimensionMarkerLeaderStack.push({
          x1,
          y1: y2,
          x2: x1,
          y2: y2 + leaderLineLen
        })
        dimensionMarkerLabelStack.push({
          x: x1,
          y: y2 + leaderLineLen + labelHeight,
          label: Utils.getFormattedNum(label, numDecimals, xPrefix, xSuffix),
          anchor: 'middle',
          type
        })
      }

      if (type === 'row') {
        const numDecimals = computeNumDecimals(tickIncrement, yDecimals)
        dimensionMarkerLeaderStack.push({
          x1: x1 - leaderLineLen,
          y1,
          x2: x1,
          y2
        })
        dimensionMarkerLabelStack.push({
          x: x1 - leaderLineLen,
          y: y2 + (labelHeight / 3),
          label: Utils.getFormattedNum(label, numDecimals, yPrefix, ySuffix),
          anchor: 'end',
          type
        })
      }
    }

    // Call to find Max and mins as users may have moved points out of the plot
    data.calculateMinMax()

    let ticksX = null
    let ticksY = null

    if (Utils.isNum(plot.xBoundsUnitsMajor)) {
      ticksX = plot.xBoundsUnitsMajor / 2
    } else {
      ticksX = this._getTickRange(data.minX, data.maxX)
    }

    if (Utils.isNum(plot.yBoundsUnitsMajor)) {
      ticksY = plot.yBoundsUnitsMajor / 2
    } else {
      ticksY = this._getTickRange(data.minY, data.maxY)
    }

    // const ticksXexponent = this.getExponentOfNum(ticksX)
    // const ticksYexponent = this.getExponentOfNum(ticksY)

    // Compute origins if they are within bounds

    const originAxis = []
    const yCoordOfXAxisOrigin = this._normalizeYCoords(data, 0)
    if ((yCoordOfXAxisOrigin <= (viewBoxDim.y + viewBoxDim.height)) && (yCoordOfXAxisOrigin >= viewBoxDim.y)) {
      const xAxisOrigin = {
        x1: viewBoxDim.x,
        y1: yCoordOfXAxisOrigin,
        x2: viewBoxDim.x + viewBoxDim.width,
        y2: yCoordOfXAxisOrigin
      }
      pushDimensionMarker('row', xAxisOrigin.x1, xAxisOrigin.y1, xAxisOrigin.x2, xAxisOrigin.y2, 0, ticksY)
      if ((data.minY !== 0) && (data.maxY !== 0)) {
        originAxis.push(xAxisOrigin)
      }
    }

    const xCoordOfYAxisOrigin = this._normalizeXCoords(data, 0)
    if ((xCoordOfYAxisOrigin >= viewBoxDim.x) && (xCoordOfYAxisOrigin <= (viewBoxDim.x + viewBoxDim.width))) {
      const yAxisOrigin = {
        x1: xCoordOfYAxisOrigin,
        y1: viewBoxDim.y,
        x2: xCoordOfYAxisOrigin,
        y2: viewBoxDim.y + viewBoxDim.height
      }
      pushDimensionMarker('col', yAxisOrigin.x1, yAxisOrigin.y1, yAxisOrigin.x2, yAxisOrigin.y2, 0, ticksX)
      if ((data.minX !== 0) && (data.maxX !== 0)) {
        originAxis.push(yAxisOrigin)
      }
    }

    // calculate number of dimension markers
    let colsPositive = 0
    let colsNegative = 0
    let rowsPositive = 0
    let rowsNegative = 0
    _.map(this._getScaleLinear(data.minX, data.maxX), (n) => {
      if (n > 0) {
        colsPositive++
      } else if (n < 0) {
        colsNegative++
      }
    })
    _.map(this._getScaleLinear(data.minY, data.maxY), (n) => {
      if (n > 0) {
        rowsNegative++
      } else if (n < 0) {
        rowsPositive++
      }
    })

    // Build col markers
    let i = 0
    while (i < Math.max(colsPositive, colsNegative)) {
      let val = null
      let x1 = null
      let x2 = null
      let y1 = null
      let y2 = null

      if (i < colsPositive) {
        val = (i + 1) * ticksX
        if (!this._between(0, data.minX, data.maxX)) {
          val = this._getStartingVal(data.minX, data.maxX) + (i * ticksX)
        }

        if (this._between(val, data.minX, data.maxX)) {
          x1 = this._normalizeXCoords(data, val)
          y1 = viewBoxDim.y
          x2 = this._normalizeXCoords(data, val)
          y2 = viewBoxDim.y + viewBoxDim.height

          dimensionMarkerStack.push({ x1, y1, x2, y2 })
          if (i % 2) {
            pushDimensionMarker('col', x1, y1, x2, y2, _.toNumber(val).toPrecision(14), ticksX)
          }
        }
      }

      if (i < colsNegative) {
        val = -(i + 1) * ticksX

        if (this._between(val, data.minX, data.maxX)) {
          x1 = this._normalizeXCoords(data, val)
          y1 = viewBoxDim.y
          x2 = this._normalizeXCoords(data, val)
          y2 = viewBoxDim.y + viewBoxDim.height
          dimensionMarkerStack.push({x1, y1, x2, y2})
          if (i % 2) {
            pushDimensionMarker('col', x1, y1, x2, y2, _.toNumber(val).toPrecision(14), ticksX)
          }
        }
      }
      i++
    }

    // Build row markers
    i = 0
    while (i < Math.max(rowsPositive, rowsNegative)) {
      let val = null
      let x1 = null
      let x2 = null
      let y1 = null
      let y2 = null

      if (i < rowsPositive) {
        val = -(i + 1) * ticksY

        if (this._between(val, data.minY, data.maxY)) {
          x1 = viewBoxDim.x
          y1 = this._normalizeYCoords(data, val)
          x2 = viewBoxDim.x + viewBoxDim.width
          y2 = this._normalizeYCoords(data, val)
          dimensionMarkerStack.push({x1, y1, x2, y2})
          if (i % 2) {
            pushDimensionMarker('row', x1, y1, x2, y2, _.toNumber(val).toPrecision(14), ticksY)
          }
        }
      }

      if (i < rowsNegative) {
        val = (i + 1) * ticksY
        if (!this._between(0, data.minY, data.maxY)) {
          val = this._getStartingVal(data.minY, data.maxY) + (i * ticksY)
        }

        if (this._between(val, data.minY, data.maxY)) {
          x1 = viewBoxDim.x
          y1 = this._normalizeYCoords(data, val)
          x2 = viewBoxDim.x + viewBoxDim.width
          y2 = this._normalizeYCoords(data, val)
          dimensionMarkerStack.push({x1, y1, x2, y2})
          if (i % 2) {
            pushDimensionMarker('row', x1, y1, x2, y2, _.toNumber(val).toPrecision(14), ticksY)
          }
        }
      }
      i++
    }

    return {
      gridOrigin: originAxis,
      gridLines: dimensionMarkerStack,
      axisLeader: dimensionMarkerLeaderStack,
      axisLeaderLabel: dimensionMarkerLabelStack
    }
  }
}

module.exports = AxisUtils
