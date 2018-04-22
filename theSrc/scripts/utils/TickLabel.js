import Utils from './Utils'
import moment from 'moment'

class TickLabel {
  constructor (text, numDecimals, prefix, suffix, isDateFormat) {
    this.text = text
    this.numDecimals = numDecimals
    this.prefix = prefix
    this.suffix = suffix
    this.isDateFormat = isDateFormat
  }

  getLabel () {
    if (this.isDateFormat) {
      return moment(this.text).format('YYYY-MM-DD')
    } else {
      return Utils.getFormattedNum(this.text, this.numDecimals, this.prefix, this.suffix)
    }
  }
}

module.exports = TickLabel
