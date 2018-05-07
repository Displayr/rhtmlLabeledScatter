/* To Refactor:
 *   * use a data uri instead of an S3 asset pointing at Kyles S3 account
 *   * Are we allowed to use this image ?
 *
 */

import $ from 'jquery'
import Utils from './utils/Utils'

class DisplayError {
  static isAxisValid (inputArray, svg, errorMsg) {
    if (!Utils.isArrOfNums(inputArray)) {
      this.checkIfArrayOfDates(inputArray, svg, errorMsg)
    }
  }

  static checkIfArrayOfDates (inputArray, svg, errorMsg) {
    if (!Utils.isArrOfDates(inputArray)) {
      this.displayErrorMessage(svg, errorMsg)
    }
  }

  static checkIfArrayOfPositiveNums (inputArray, svg, errorMsg) {
    if (!Utils.isArrOfPositiveNums(inputArray)) {
      this.displayErrorMessage(svg, errorMsg)
    }
  }

  static checkIfArrayOfNums (inputArray, svg, errorMsg) {
    if (!Utils.isArrOfNums(inputArray)) {
      this.displayErrorMessage(svg, errorMsg)
    }
  }

  static displayErrorMessage (svg, msg) {
    const errorContainer = $('<div class="rhtml-error-container">')
    const errorImage = $(`<img width="32px" height="32px" src="${this.getErrorImgUrl()}"/>`)
    const errorText = $('<span style="color:red;">')
      .html(msg.toString())

    errorContainer.append(errorImage)
    errorContainer.append(errorText)

    $(svg).empty()
    $(svg).append(errorContainer)

    throw new Error(msg)
  }

  static getErrorImgUrl () {
    return 'data:image/png;base64,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'
  }
}

module.exports = DisplayError
