/* To Refactor:
 *   * use a data uri instead of an S3 asset pointing at Kyles S3 account
 *   * Are we allowed to use this image ?
 *
 */

import $ from 'jquery'
import Utils from './utils/Utils'

class DisplayError {
  static checkIfArrayOfNums (candidateArray, svg, errorMsg) {
    if (!Utils.isArrOfNums(candidateArray)) {
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
    return 'https://s3-ap-southeast-2.amazonaws.com/kyle-public-numbers-assets/htmlwidgets/CroppedImage/error_128.png'
  }
}

module.exports = DisplayError
