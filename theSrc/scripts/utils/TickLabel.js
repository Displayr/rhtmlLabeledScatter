import Utils from './Utils'
import _ from 'lodash'
import autoBind from 'es6-autobind'
import DataTypeEnum from './DataTypeEnum'
import d3 from 'd3'

class TickLabel {
  constructor (text, tickIncr, userDecimals, prefix, suffix, dataType, leaderLineLength, labelHeight,
                x1, y1, x2, y2, tickLabelFormat) {
    autoBind(this)
    this.text = text
    this.prefix = prefix
    this.suffix = suffix
    this.isDateFormat = (dataType === DataTypeEnum.date)
    this.labelDataType = dataType
    this.tickIncr = tickIncr
    this.userDecimals = userDecimals
    this.leaderLineLength = leaderLineLength
    this.labelHeight = labelHeight
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.tickLabelFormat = tickLabelFormat
  }

  computeNumDecimals (tickIncr, userDecimals) {
    // Return user specified number of decimals or 0 if the tickIncr is an integer
    if (!_.isNull(userDecimals)) return userDecimals
    if (_.isInteger(tickIncr)) return 0

    const integerAndDecimalStrings = tickIncr.toString().split('.')
    return integerAndDecimalStrings.length === 2 ? integerAndDecimalStrings[1].length : 0
  }

  getDisplayLabel () {
    this.numDecimals = this.computeNumDecimals(this.tickIncr, this.userDecimals)
    if (this.isDateFormat) {
      // return moment(this.text).format(this.dateFormat)
      let formatDate = _.isNull(this.tickLabelFormat) ? d3.time.format('%Y-%m-%d') : d3.time.format(this.tickLabelFormat)
      return this.prefix + formatDate(new Date(this.text)) + this.suffix
    } else if (this.labelDataType === DataTypeEnum.ordinal) {
      return this.prefix + this.text + this.suffix
    } else if (this.tickLabelFormat !== null) {
      return this.prefix + d3.format(this.tickLabelFormat)(Number(this.text)) + this.suffix
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
      type: 'x',
    }
  }

  getYAxisLabelData () {
    return {
      x: this.x1 - this.leaderLineLength,
      y: this.y2 + (this.labelHeight / 3),
      label: this.getDisplayLabel(),
      anchor: 'end',
      type: 'y',
    }
  }
}

module.exports = TickLabel
