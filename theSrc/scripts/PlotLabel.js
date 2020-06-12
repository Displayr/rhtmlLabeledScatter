import _ from 'lodash'
import 'babel-polyfill'
import DisplayError from './DisplayError'
import { getHorizontalLabelDimensionsUsingSvgApproximation } from 'rhtmlLabelUtils'

/* global Image */ // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image

/* To Refactor:
 * *no method to access the label promises (PlotData accesses the internal directly)
 */

// PlotLabel class
// The primary purpose of this class is to support images as the labels and
// to parse them apart from the regular text labels

class PlotLabel {
  constructor (givenLabelArray, labelAlt, logoScale, parentContainer, fontSize, fontFamily) {
    this.givenLabelArray = givenLabelArray
    this.labelAlt = labelAlt
    this.logoScale = logoScale
    this.parentContainer = parentContainer
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.promiseLabelArray = _.map(this.givenLabelArray, (label, index) => {
      if (PlotLabel._isStringLinkToImg(label)) {
        return this._makeImgLabPromise(label, this.labelAlt[index] || '', this.logoScale[index])
      } else {
        return this._makeLabPromise(label)
      }
    })
  }

  getLabels () {
    return this.promiseLabelArray
  }

  _makeLabPromise (label) {
    const { width, height } = getHorizontalLabelDimensionsUsingSvgApproximation({
      parentContainer: this.parentContainer,
      text: label,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily
    })

    return Promise.resolve({
      width,
      height,
      label,
      url: ''
    })
  }

  _makeImgLabPromise (labelLink, labelAlt, scalingFactor = 1) {
    return new Promise(function (resolve) {
      const img = new Image()
      let imgLoaded = false

      img.onload = function () {
        const defaultArea = 10000 * scalingFactor
        const height = this.height || 0
        const width = this.width || 0
        const aspectRatio = width / height

        const adjW = Math.sqrt(defaultArea * aspectRatio)
        const adjH = adjW / aspectRatio
        img.src = '' // remove img
        imgLoaded = true
        return resolve({
          width: adjW,
          height: adjH,
          label: labelAlt,
          url: labelLink
        })
      }

      img.onerror = function () {
        if (imgLoaded) { return null }

        console.log(`Error: Image URL not valid - ${labelLink}`)
        const defaultErrorLogoSize = 20

        return resolve({
          width: defaultErrorLogoSize,
          height: defaultErrorLogoSize,
          label: '',
          url: DisplayError.getErrorImgUrl()
        })
      }

      img.src = labelLink
    })
  }

  static _isStringLinkToImg (label) {
    const isUrl = /^(https:|http:|\/images\/)/.test(label)
    const correctExtension = /\.(png|svg|jpg|gif)/.test(label)
    return (isUrl && correctExtension)
  }
}

module.exports = PlotLabel
