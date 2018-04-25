import Utils from './Utils'
import moment from 'moment'
import _ from 'lodash'
import autoBind from 'es6-autobind'

class TickLabel {
  constructor (text, tickIncr, userDecimals, prefix, suffix, isDateFormat, leaderLineLength, labelHeight,
                x1, y1, x2, y2) {
    autoBind(this)
    this.text = text
    this.prefix = prefix
    this.suffix = suffix
    this.isDateFormat = isDateFormat
    this.tickIncr = tickIncr
    this.userDecimals = userDecimals
    this.leaderLineLength = leaderLineLength
    this.labelHeight = labelHeight
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }

  computeNumDecimals (tickIncr, userDecimals) {
    // Return user specified number of decimals or 0 if the tickIncr is an integer
    if (!_.isNull(userDecimals)) return userDecimals
    if (_.isInteger(tickIncr)) return 0

    // Otherwise, return the inverse exponent of the tick increment
    const tickExponent = Utils.getExponentOfNum(tickIncr)
    return ((tickExponent < 0) ? Math.abs(tickExponent) : 0)
  }

  getDisplayLabel () {
    this.numDecimals = this.computeNumDecimals(this.tickIncr, this.userDecimals)
    if (this.isDateFormat) {
      return moment(this.text).format('YYYY-MM-DD')
    } else {
      return Utils.getFormattedNum(this.text, this.numDecimals, this.prefix, this.suffix)
    }
  }

  getXAxisLabelData () {
    return {
      x: this.x1,
      y: this.y2 + this.leaderLineLength + this.labelHeight,
      label: this.getDisplayLabel(),
      anchor: 'middle',
      type: 'col'
    }
  }

  getYAxisLabelData () {
    return {
      x: this.x1 - this.leaderLineLength,
      y: this.y2 + (this.labelHeight / 3),
      label: this.getDisplayLabel(),
      anchor: 'end',
      type: 'row'
    }
  }
}

module.exports = TickLabel
