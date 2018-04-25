import Utils from './Utils'
import moment from 'moment'
import _ from 'lodash'
import autoBind from 'es6-autobind'

class TickLabel {
  constructor (text, tickIncr, userDecimals, prefix, suffix, isDateFormat) {
    autoBind(this)
    this.text = text
    this.prefix = prefix
    this.suffix = suffix
    this.isDateFormat = isDateFormat
    this.tickIncr = tickIncr
    this.userDecimals = userDecimals
  }

  computeNumDecimals (tickIncr, userDecimals) {
    // Return user specified number of decimals or 0 if the tickIncr is an integer
    if (!_.isNull(userDecimals)) return userDecimals
    if (_.isInteger(tickIncr)) return 0

    // Otherwise, return the inverse exponent of the tick increment
    const tickExponent = Utils.getExponentOfNum(tickIncr)
    return ((tickExponent < 0) ? Math.abs(tickExponent) : 0)
  }

  getLabel () {
    this.numDecimals = this.computeNumDecimals(this.tickIncr, this.userDecimals)
    if (this.isDateFormat) {
      return moment(this.text).format('YYYY-MM-DD')
    } else {
      return Utils.getFormattedNum(this.text, this.numDecimals, this.prefix, this.suffix)
    }
  }
}

module.exports = TickLabel
