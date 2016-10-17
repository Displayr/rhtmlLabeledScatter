class AxisUtils
  instance = null

  @get: ->
    if not instance?
      instance = new AU()
    instance

  class AU

    constructor: ->

    # Calc tick increments - http://stackoverflow.com/questions/326679/choosing-an-attractive-linear-scale-for-a-graphs-y-axis
    _getTickRange: (max, min) ->
      maxTicks = 8
      range = max - min
      unroundedTickSize = range/(maxTicks-1)
      x = Math.ceil(Math.log(unroundedTickSize)/Math.LN10-1)
      pow10x = Math.pow(10, x)
      roundedTickRange = Math.ceil(unroundedTickSize / pow10x) * pow10x
      roundedTickRange

    _between: (num, min, max) ->
      num >= min and num <= max

    _normalizeXCoords: (data, Xcoord) ->
      viewBoxDim = data.viewBoxDim
      (Xcoord-data.minX)/(data.maxX - data.minX)*viewBoxDim.width + viewBoxDim.x

    _normalizeYCoords: (data, Ycoord) ->
      viewBoxDim = data.viewBoxDim
      -(Ycoord-data.minY)/(data.maxY - data.minY)*viewBoxDim.height + viewBoxDim.y + viewBoxDim.height

    getAxisDataArrays: (plot, data, viewBoxDim) ->
      # exit if all points have been dragged off plot
      return unless data.len > 0

      pushDimensionMarker = (type, x1, y1, x2, y2, label) ->
        leaderLineLen = plot.axisLeaderLineLength
        labelHeight = _.max [plot.axisDimensionText.rowMaxHeight, plot.axisDimensionText.colMaxHeight]
        xDecimals = plot.xDecimals
        yDecimals = plot.yDecimals
        xPrefix = plot.xPrefix
        yPrefix = plot.yPrefix
        xSuffix = plot.xSuffix
        ySuffix = plot.ySuffix

        if type == 'c'
          dimensionMarkerLeaderStack.push({
            x1: x1
            y1: y2
            x2: x1
            y2: y2 + leaderLineLen
          })
          dimensionMarkerLabelStack.push({
            x: x1
            y: y2 + leaderLineLen + labelHeight
            label: Utils.get().getFormattedNum(label, xDecimals, xPrefix, xSuffix)
            anchor: 'middle'
            type: 'col'
          })

        if type == 'r'
          dimensionMarkerLeaderStack.push({
            x1: x1 - leaderLineLen
            y1: y1
            x2: x1
            y2: y2
          })
          dimensionMarkerLabelStack.push({
            x: x1 - leaderLineLen
            y: y2 + labelHeight/3
            label: Utils.get().getFormattedNum(label, yDecimals, yPrefix, ySuffix)
            anchor: 'end'
            type: 'row'
          })

      dimensionMarkerStack = []
      dimensionMarkerLeaderStack = []
      dimensionMarkerLabelStack = []

      ticksX = if Utils.get().isNum(plot.xBoundsUnitsMajor)
                 ticksX = plot.xBoundsUnitsMajor / 2
               else
                 @_getTickRange(data.maxX, data.minX)
      ticksY = if Utils.get().isNum(plot.yBoundsUnitsMajor)
                 ticksY = plot.yBoundsUnitsMajor / 2
               else
                 @_getTickRange(data.maxY, data.minY)

      originAxis = []
      oax_y = @_normalizeYCoords data,  0
      if (oax_y <= viewBoxDim.y + viewBoxDim.height) and (oax_y >= viewBoxDim.y)
        oax = {
          x1: viewBoxDim.x
          y1: oax_y
          x2: viewBoxDim.x + viewBoxDim.width
          y2: oax_y
        }
        pushDimensionMarker 'r', oax.x1, oax.y1, oax.x2, oax.y2, 0
        originAxis.push(oax) unless (data.minY is 0) or (data.maxY is 0)

      oay_x = @_normalizeXCoords data,  0
      if (oay_x >= viewBoxDim.x) and (oay_x <= viewBoxDim.x + viewBoxDim.width)
        oay = {
          x1: oay_x
          y1: viewBoxDim.y
          x2: oay_x
          y2: viewBoxDim.y + viewBoxDim.height
        }
        pushDimensionMarker 'c', oay.x1, oay.y1, oay.x2, oay.y2, 0
        originAxis.push(oay) unless (data.minX is 0) or (data.maxX is 0)


      #calculate number of dimension markers
      colsPositive = 0
      colsNegative = 0
      if @_between(0, data.minX, data.maxX)
        colsPositive = data.maxX / ticksX - 1
        colsNegative = Math.abs(data.minX / ticksX) - 1
      else
        cols = (data.maxX - data.minX) / ticksX
        if data.minX < 0
          colsNegative = cols
          colsPositive = 0
        else
          colsNegative = 0
          colsPositive = cols

      rowsPositive = 0
      rowsNegative = 0
      if @_between(0, data.minY, data.maxY)
        rowsPositive = Math.abs(data.minY / ticksY) - 1
        rowsNegative = data.maxY / ticksY - 1
      else
        rows = (data.maxY - data.minY) / ticksY
        if data.minY < 0
          rowsNegative = 0
          rowsPositive = rows
        else
          rowsNegative = rows
          rowsPositive = 0

      i = 0
      while i < Math.max(colsPositive, colsNegative)
        if i < colsPositive
          val = (i+1)*ticksX
          if not @_between(0, data.minX, data.maxX)
            val = data.minX + i*ticksX
          x1 = @_normalizeXCoords data,  val
          y1 = viewBoxDim.y
          x2 = @_normalizeXCoords data,  val
          y2 = viewBoxDim.y + viewBoxDim.height

          dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
          if i % 2
            pushDimensionMarker 'c', x1, y1, x2, y2, val.toPrecision(14)

        if i < colsNegative
          val = -(i+1)*ticksX
          x1 = @_normalizeXCoords data,  val
          y1 = viewBoxDim.y
          x2 = @_normalizeXCoords data,  val
          y2 = viewBoxDim.y + viewBoxDim.height
          dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
          if i % 2
            pushDimensionMarker 'c', x1, y1, x2, y2, val.toPrecision(14)
        i++

      i = 0
      while i < Math.max(rowsPositive, rowsNegative)
        x1 = y1 = x2 = y2 = 0
        if i < rowsPositive
          val = -(i+1)*ticksY
          x1 = viewBoxDim.x
          y1 = @_normalizeYCoords data,  val
          x2 = viewBoxDim.x + viewBoxDim.width
          y2 = @_normalizeYCoords data,  val
          dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
          if i % 2
            pushDimensionMarker 'r', x1, y1, x2, y2, val.toPrecision(14)

        if i < rowsNegative
          val = (i+1)*ticksY
          if not @_between(0, data.minY, data.maxY)
            val = data.minY + i*ticksY
          x1 = viewBoxDim.x
          y1 = @_normalizeYCoords data,  val
          x2 = viewBoxDim.x + viewBoxDim.width
          y2 = @_normalizeYCoords data,  val
          dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
          if i % 2
            pushDimensionMarker 'r', x1, y1, x2, y2, val.toPrecision(14)
        i++

      return {
        gridOrigin:       originAxis
        gridLines:        dimensionMarkerStack
        axisLeader:       dimensionMarkerLeaderStack
        axisLeaderLabel:  dimensionMarkerLabelStack
      }
