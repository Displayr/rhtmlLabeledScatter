import _ from 'lodash'
import Utils from './Utils'
import d3 from 'd3'
import { scaleTime } from 'd3-scale'
import TickLabel from './TickLabel'
import TickLine from './TickLine'
import GridLine from './GridLine'
import DataTypeEnum from './DataTypeEnum'

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
      // If origin is within the range, ensure that there is a tick at the origin
      if (min <= 0 && max >= 0) {
        while ((i <= max) || (-i >= min)) {
          if (i >= 0 && i < max) {
            scaleLinear.push(i)
          }
          if (-i < 0 && -i > min) {
            scaleLinear.push(-i)
          }
          i += unitMajor
        }
      } else {
        const tickExp = this._getTickExponential(unitMajor)
        i = _.floor(_.toNumber(min), tickExp)
        while (i < max) {
          scaleLinear.push(i)
          i += unitMajor
        }
      }
      return _.sortBy(scaleLinear)
    }
  }

  static _getRoundedScaleTime (min, max) {
    return scaleTime().domain([min, max]).range(max - min).ticks(5)
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
    if (data.xDataType === DataTypeEnum.ordinal) {
      const scaleOrdinal = d3.scale.ordinal().domain(data.X).rangePoints([0, 1])
      return (scaleOrdinal(Xcoord) * vb.width) + vb.x
    } else {
      return (((Xcoord - data.minX) / (data.maxX - data.minX)) * vb.width) + vb.x
    }
  }

  static _normalizeYCoords (data, Ycoord) {
    const { vb } = data
    if (data.yDataType === DataTypeEnum.ordinal) {
      const scaleOrdinal = d3.scale.ordinal().domain(data.Y).rangePoints([0, 1])
      return (scaleOrdinal(Ycoord) * vb.height) + vb.y
    } else {
      return ((-(Ycoord - data.minY) / (data.maxY - data.minY)) * vb.height) + vb.y + vb.height
    }
  }

  // TODO Separate similarities between X and Y axis calls
  static getAxisDataArrays (data, vb, axisSettings) {
    // exit if all points have been dragged off plot
    if (!(data.len > 0)) {
      return {}
    }

    const gridLineStack = []
    const axisLeaderStack = []
    const axisLeaderLabelStack = []
    const originAxis = []

    const pushTickLabel = (type, x1, y1, x2, y2, label, tickIncrement, format) => {
      const leaderLineLen = axisSettings.leaderLineLength
      const labelHeight = _.max([axisSettings.textDimensions.rowMaxHeight, axisSettings.textDimensions.colMaxHeight])
      const tickLine = new TickLine(x1, y1, x2, y2, leaderLineLen, label)

      if (type === 'x') {
        const tickLabel = new TickLabel(label, tickIncrement, axisSettings.x.decimals, axisSettings.x.prefix, axisSettings.x.suffix, data.xDataType, leaderLineLen, labelHeight, x1, y1, x2, y2, format)
        axisLeaderStack.push(tickLine.getXAxisTickLineData())
        axisLeaderLabelStack.push(tickLabel.getXAxisLabelData())
      }

      if (type === 'y') {
        const tickLabel = new TickLabel(label, tickIncrement, axisSettings.y.decimals, axisSettings.y.prefix, axisSettings.y.suffix, data.yDataType, leaderLineLen, labelHeight, x1, y1, x2, y2, format)
        axisLeaderStack.push(tickLine.getYAxisTickLineData())
        axisLeaderLabelStack.push(tickLabel.getYAxisLabelData())
      }
    }

    const getTicks = (userTickInterval, min, max) => {
      let ticks = null
      if (Utils.isNum(userTickInterval)) {
        ticks = userTickInterval
      } else {
        ticks = this._getTickInterval(min, max)
      }
      return ticks
    }

    // Call to find Max and mins as users may have moved points out of the plot
    data.calculateMinMax()
    data.calculateOrdinalPaddingProportions()

    let ticksX = getTicks(axisSettings.x.boundsUnitsMajor, data.minX, data.maxX)
    if (data.xDataType === DataTypeEnum.date) {
      const xTickDates = this._getRoundedScaleTime(data.minX, data.maxX)

      _.map(xTickDates, date => {
        let timeFromEpoch = date.getTime()
        const gridLine = new GridLine(this._normalizeXCoords(data, timeFromEpoch), vb.y, this._normalizeXCoords(data, timeFromEpoch), vb.y + vb.height)
        gridLineStack.push(gridLine.getData())
        if (axisSettings.showX) {
          pushTickLabel('x', gridLine.x1, gridLine.y1, gridLine.x2, gridLine.y2, timeFromEpoch, ticksX, axisSettings.x.format)
        }
      })
    } else if (data.xDataType === DataTypeEnum.numeric) {
      const xRoundedScaleLinear = this._getRoundedScaleLinear(data.minX, data.maxX, axisSettings.x.boundsUnitsMajor)
      _.map(xRoundedScaleLinear, val => {
        if (val === 0) {
          const xCoordOfYAxisOrigin = this._normalizeXCoords(data, 0)
          const yAxisOrigin = new GridLine(xCoordOfYAxisOrigin, vb.y, xCoordOfYAxisOrigin, vb.y + vb.height)
          if (axisSettings.showX && data.minX <= 0 && data.maxX >= 0) {
            pushTickLabel('x', yAxisOrigin.x1, yAxisOrigin.y1, yAxisOrigin.x2, yAxisOrigin.y2, 0, ticksX, axisSettings.x.format)
          }
          if (data.minX < 0 && data.maxX > 0) {
            originAxis.push(yAxisOrigin.getData())
          }
        } else {
          const gridLine = new GridLine(this._normalizeXCoords(data, val), vb.y, this._normalizeXCoords(data, val), vb.y + vb.height)
          gridLineStack.push(gridLine.getData())
          if (axisSettings.showX) {
            pushTickLabel('x', gridLine.x1, gridLine.y1, gridLine.x2, gridLine.y2, val, ticksX, axisSettings.x.format)
          }
        }
      })
    } else if (data.xDataType === DataTypeEnum.ordinal) {
      const scaleOrdinal = d3.scale.ordinal().domain(data.xLevels).rangePoints([0, 1])
      const nonPaddingProportion = 1 - data.ordinalMinXPaddingProportion - data.ordinalMaxXPaddingProportion
      _.map(data.xLevels, x => {
        const gridX = scaleOrdinal(x) * vb.width * nonPaddingProportion + vb.x + vb.width * data.ordinalMinXPaddingProportion
        const gridLine = new GridLine(gridX, vb.y, gridX, vb.y + vb.height)
        gridLineStack.push(gridLine.getData())
        if (axisSettings.showX) {
          pushTickLabel('x', gridLine.x1, gridLine.y1, gridLine.x2, gridLine.y2, x, ticksX, axisSettings.x.format)
        }
      })
    }

    let ticksY = getTicks(axisSettings.y.boundsUnitsMajor, data.minY, data.maxY)
    if (data.yDataType === DataTypeEnum.date) {
      const yTickDates = this._getRoundedScaleTime(data.minY, data.maxY)
      _.map(yTickDates, date => {
        let timeFromEpoch = date.getTime()
        const gridLine = new GridLine(vb.x, this._normalizeYCoords(data, date), vb.x + vb.width, this._normalizeYCoords(data, date))
        gridLineStack.push(gridLine.getData())
        if (axisSettings.showY) {
          pushTickLabel('y', gridLine.x1, gridLine.y1, gridLine.x2, gridLine.y2, timeFromEpoch, ticksY, axisSettings.y.format)
        }
      })
    } else if (data.yDataType === DataTypeEnum.numeric) {
      const yRoundedScaleLinear = this._getRoundedScaleLinear(data.minY, data.maxY, axisSettings.y.boundsUnitsMajor)
      _.map(yRoundedScaleLinear, val => {
        if (val === 0) {
          const yCoordOfXAxisOrigin = this._normalizeYCoords(data, 0)
          const xAxisOrigin = new GridLine(vb.x, yCoordOfXAxisOrigin, vb.x + vb.width, yCoordOfXAxisOrigin)
          if (axisSettings.showY && data.minY <= 0 && data.maxY >= 0) {
            pushTickLabel('y', xAxisOrigin.x1, xAxisOrigin.y1, xAxisOrigin.x2, xAxisOrigin.y2, 0, ticksY, axisSettings.y.format)
          }
          if (data.minY < 0 && data.maxY > 0) {
            originAxis.push(xAxisOrigin.getData())
          }
        } else {
          const gridLine = new GridLine(vb.x, this._normalizeYCoords(data, val), vb.x + vb.width, this._normalizeYCoords(data, val))
          gridLineStack.push(gridLine.getData())
          if (axisSettings.showY) {
            pushTickLabel('y', gridLine.x1, gridLine.y1, gridLine.x2, gridLine.y2, val, ticksY, axisSettings.y.format)
          }
        }
      })
    } else if (data.yDataType === DataTypeEnum.ordinal) {
      const scaleOrdinal = d3.scale.ordinal().domain(data.yLevels).rangePoints([0, 1])
      const nonPaddingProportion = 1 - data.ordinalMinYPaddingProportion - data.ordinalMaxYPaddingProportion
      _.map(data.yLevels, y => {
        const gridY = scaleOrdinal(y) * vb.height * nonPaddingProportion + vb.y + vb.height * data.ordinalMinYPaddingProportion
        const gridLine = new GridLine(vb.x, gridY, vb.x + vb.width, gridY)
        gridLineStack.push(gridLine.getData())
        if (axisSettings.showY) {
          pushTickLabel('y', gridLine.x1, gridLine.y1, gridLine.x2, gridLine.y2, y, ticksY, axisSettings.x.format) // TODO: TicksY needs to be removed along with ticksX
        }
      })
    }

    return {
      gridOrigin: originAxis,
      gridLines: gridLineStack,
      axisLeader: axisLeaderStack,
      axisLeaderLabel: axisLeaderLabelStack,
    }
  }
}

module.exports = AxisUtils
