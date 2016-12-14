# PlotLabel class
# The primary purpose of this class is to support images as the labels and
# to parse them apart from the regular text labels

class PlotLabel

  constructor: (@givenLabelArray, @labelAlt, @logoScale) ->
    @promiseLabelArray = []

    for label, i in @givenLabelArray
      if @_isStringLinkToImg(label)
        labelAlt = if @labelAlt?[i]? then @labelAlt[i] else ''
        @promiseLabelArray.push @_makeImgLabPromise(label, labelAlt, @logoScale[i])
      else
        @promiseLabelArray.push @_makeLabPromise(label)

  _makeLabPromise: (label) =>
    new Promise((resolve, reject) =>
      resolve({
        width: null
        height: null
        label: label
        url: ''
      })
    )

  _makeImgLabPromise: (labelLink, labelAlt, scalingFactor = 1) =>
    new Promise((resolve, reject) =>
      img = new Image()
      imgLoaded = false

      img.onload = ->
        defaultArea = 10000 * scalingFactor
        height = if @height? then @height else 0
        width = if @width? then @width else 0
        aspectRatio = width/height

        adjW = Math.sqrt(defaultArea*aspectRatio)
        adjH = adjW/aspectRatio
        img.src = '' # remove img
        imgLoaded = true
        resolve({
          width: adjW
          height: adjH
          label: labelAlt
          url: labelLink
        })

      img.onerror = ->
        unless imgLoaded
          console.log 'Error: Image URL not valid - ' + labelLink
          defaultErrorLogoSize = 20

          resolve({
            width: defaultErrorLogoSize
            height: defaultErrorLogoSize
            label: ''
            url: DisplayError.get().getErrorImgUrl()
          })

      img.src = labelLink
    )

  _isStringLinkToImg: (label) ->
    (_.includes(label, 'http://') or _.includes(label, 'https://')) and
      (_.includes(label, '.png') or _.includes(label, '.svg') or _.includes(label, '.jpg'))
