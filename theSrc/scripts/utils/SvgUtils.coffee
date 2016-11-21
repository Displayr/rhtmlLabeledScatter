class SvgUtils
  instance = null

  @get: ->
    if not instance?
      instance = new SU()
    instance

  class SU

    constructor: ->

    setSvgBBoxWidthAndHeight: (dataArray, svgArray) ->
      for dataElem, i in dataArray
        if !(dataElem.width?) and !(dataElem.height?)
          dataElem.width = svgArray[0][i].getBBox().width
          dataElem.height = svgArray[0][i].getBBox().height
