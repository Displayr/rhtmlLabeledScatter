class SvgUtils
  instance = null

  @get: ->
    if not instance?
      instance = new SU()
    instance

  class SU

    constructor: ->


    setSvgBBoxWidthAndHeight: (arrayLen, dataArray, svgArray) ->
      i = 0
      while i < arrayLen
        dataArray[i].width =  svgArray[0][i].getBBox().width
        dataArray[i].height = svgArray[0][i].getBBox().height
        i++
      return

    getSvgTextArrayMaxHeight: (svg) ->

    getAxisMarkerTextMaxWidth: () ->
