'use strict'

class PlotData
  constructor: (@X,
                @Y,
                @Z,
                @group,
                @label,
                @viewBoxDim,
                @legendDim,
                @colorWheel,
                @fixedAspectRatio,
                @originAlign,
                @pointRadius) ->

    @origX = @X.slice(0)
    @origY = @Y.slice(0)
    @normX = @X.slice(0)
    @normY = @Y.slice(0)
    @draggedOutPtsId = []
    @legendPts = []
    @draggedOutCondensedPts = []

    @cIndex = 0 # color index

    @superscript = '⁰¹²³⁴⁵⁶⁷⁸⁹'

    if @X.length is @Y.length
      @len = @origLen= X.length
      @normalizeData(@)
      @normalizeZData(@) if @Z?
      @setupColors()
      @calcDataArrays()
    else
      throw new Error("Inputs X and Y lengths do not match!")

  normalizeData: (data) ->
    viewBoxDim = data.viewBoxDim

    ptsOut = @draggedOutPtsId
    notMovedX = _.filter(@origX, (val, key) ->
      !(_.includes(ptsOut, key))
    )
    notMovedY = _.filter(@origY, (val, key) ->
      !(_.includes(ptsOut, key))
    )

    @minX = _.min notMovedX
    @maxX = _.max notMovedX
    @minY = _.min notMovedY
    @maxY = _.max notMovedY

    # threshold used so pts are not right on border of plot
    thres = 0.08
    xThres = thres*(@maxX - @minX)
    yThres = thres*(@maxY - @minY)
    @maxX += xThres
    @minX -= xThres
    @maxY += yThres
    @minY -= yThres
    # originAlign: compensates to make sure origin lines are on axis
    if @originAlign
      @maxX = if @maxX < 0 then 0 else @maxX+xThres # so axis can be on origin
      @minX = if @minX > 0 then 0 else @minX-xThres
      @maxY = if @maxY < 0 then 0 else @maxY+yThres
      @minY = if @minY > 0 then 0 else @minY-yThres

    if @fixedAspectRatio
      rangeX = @maxX - @minX
      rangeY = @maxY - @minY
      diff = Math.abs(viewBoxDim.width - viewBoxDim.height)
      if viewBoxDim.width > viewBoxDim.height
        factor = rangeY*(diff/viewBoxDim.width)
        @maxY += factor/2
        @minY -= factor/2
      else
        factor = rangeX*(diff/viewBoxDim.height)
        @maxX += factor/2
        @minX -= factor/2

      rangeX = @maxX - @minX
      rangeY = @maxY - @minY
      diff = Math.abs(rangeX - rangeY)
      if rangeX > rangeY
        @maxY += diff/2
        @minY -= diff/2
      else
        @maxX += diff/2
        @minX -= diff/2

    #create list of movedOffPts that need markers
    @draggedOutMarkers = []
    @draggedOutMarkersIter = 0

    for lp in @legendPts
      id = lp.pt.id
      draggedNormX = (@X[id] - @minX)/(@maxX - @minX)
      draggedNormY = (@Y[id] - @minY)/(@maxY - @minY)
      newMarkerId = @draggedOutMarkersIter
      lp.markerId = newMarkerId

      if Math.abs(draggedNormX) > 1 or Math.abs(draggedNormY) > 1 or
         draggedNormX < 0 or draggedNormY < 0

        draggedNormX = if draggedNormX > 1 then 1 else draggedNormX
        draggedNormX = if draggedNormX < 0 then 0 else draggedNormX
        draggedNormY = if draggedNormY > 1 then 1 else draggedNormY
        draggedNormY = if draggedNormY < 0 then 0 else draggedNormY
        x2 = draggedNormX*viewBoxDim.width + viewBoxDim.x
        y2 = (1-draggedNormY)*viewBoxDim.height + viewBoxDim.y

        markerTextX = markerTextY = 0
        numDigitsInId = Math.ceil(Math.log(newMarkerId+1.1)/Math.LN10)
        if draggedNormX is 1 #right bound
          x1 = x2 + @legendDim.markerLen
          y1 = y2
          markerTextX = x1
          markerTextY = y1 + @legendDim.markerTextSize/2
        else if draggedNormX is 0 #left bound
          x1 = x2 - @legendDim.markerLen
          y1 = y2
          markerTextX = x1 - @legendDim.markerCharWidth*(numDigitsInId+1)
          markerTextY = y1 + @legendDim.markerTextSize/2
        else if draggedNormY is 1 # top bound
          x1 = x2
          y1 = y2 + -draggedNormY*@legendDim.markerLen
          markerTextX = x1 - @legendDim.markerCharWidth*(numDigitsInId)
          markerTextY = y1
        else if draggedNormY is 0 # bot bound
          x1 = x2
          y1 = y2 + @legendDim.markerLen
          markerTextX = x1 - @legendDim.markerCharWidth*(numDigitsInId)
          markerTextY = y1 + @legendDim.markerTextSize

        @draggedOutMarkers.push
          markerLabel: newMarkerId + 1
          ptId: id
          x1: x1
          y1: y1
          x2: x2
          y2: y2
          markerTextX: markerTextX
          markerTextY: markerTextY
          width: @legendDim.markerWidth
          color: lp.color

        # if the points were condensed, remove point
        @draggedOutCondensedPts = _.filter @draggedOutCondensedPts, (e) -> e.dataId != id
        @len = @origLen - @draggedOutMarkers.length

      else # no marker required, but still inside plot window
        console.log "Condensed point added"
        condensedPtsDataIdArray = _.map @draggedOutCondensedPts, (e) -> e.dataId
        unless _.includes condensedPtsDataIdArray, id
          @draggedOutCondensedPts.push(
            dataId: id
            markerId: newMarkerId
          )
      @draggedOutMarkersIter++

    i = 0
    while i < @origLen
      @normX[i] = (@X[i] - @minX)/(@maxX - @minX)
      @normY[i] = (@Y[i] - @minY)/(@maxY - @minY)
      i++

  normalizeZData: (data) ->
    data.origZ = data.Z.slice(0)
    minZ = _.min data.Z
    maxZ = _.max data.Z

    i = 0
    while i < data.Z.length
      normalizedArea = data.Z[i]/maxZ
      data.Z[i] = Math.sqrt(normalizedArea/Math.PI)
      i++

  setupColors: ->
    @legendGroups = []
    if @group?
      @groupToColorMap = {}
      group = @group
      i = 0
      while i < @group.length
        unless (_.some @legendGroups, (e) -> e.text is group[i])
          newColor = @getDefaultColor()
          @legendGroups.push {
            text:   @group[i]
            color:  newColor
            r:      @legendDim.ptRadius
            anchor: 'start'
          }
          @groupToColorMap[@group[i]] = newColor
        i++

  calcDataArrays: () ->
    @pts = []
    @lab = []

    i = 0
    while i < @origLen
      if (not _.includes(@draggedOutPtsId, i)) or
         _.includes (_.map @draggedOutCondensedPts, (e) -> e.dataId), i
        x = @normX[i]*@viewBoxDim.width + @viewBoxDim.x
        y = (1-@normY[i])*@viewBoxDim.height + @viewBoxDim.y
        r = if @Z? then (@viewBoxDim.width/8)*@Z[i] else @pointRadius
        fillOpacity = if @Z? then 0.3 else 1
        label = @label[i]
        fontSize = @viewBoxDim.labelFontSize

        if _.includes (_.map @draggedOutCondensedPts, (e) -> e.dataId), i
          pt = _.find @draggedOutCondensedPts, (e) -> e.dataId == i
          label = pt.markerId + 1
          fontSize = @viewBoxDim.labelSmallFontSize

        fontColor = ptColor = if @groupToColorMap? then @groupToColorMap[@group[i]] else 'black'
        fontColor = @viewBoxDim.labelFontColor if @viewBoxDim.labelFontColor? and !(@viewBoxDim.labelFontColor == '')
        group = if @group? then @group[i] else ''
        @pts.push({
          x: x
          y: y
          r: r
          label: label
          labelX: @origX[i].toPrecision(3).toString()
          labelY: @origY[i].toPrecision(3).toString()
          group: group
          color: ptColor
          id: i
          fillOpacity: fillOpacity
        })
        @lab.push({
          x: x
          y: y
          text: label
          color: fontColor
          id: i
          fontSize: fontSize
          fontFamily: @viewBoxDim.labelFontFamily
        })
      i++

  setLegendItemsPositions: (data, numItems, itemsArray, cols) ->
    legendDim = data.legendDim
    viewBoxDim = data.viewBoxDim

    startOfCenteredLegendItems = (viewBoxDim.y + viewBoxDim.height/2 -
                                  legendDim.heightOfRow*(numItems/cols)/2 +
                                  legendDim.ptRadius)
    startOfViewBox = viewBoxDim.y + legendDim.ptRadius
    legendStartY = Math.max(startOfCenteredLegendItems, startOfViewBox)

    colSpacing = 0
    numItemsInPrevCols = 0

    i = 0
    currentCol = 1
    while i < numItems
      if cols > 1
        numElemsInCol = numItems/cols
        exceededCurrentCol = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow > viewBoxDim.y + viewBoxDim.height
        plottedEvenBalanceOfItemsBtwnCols = i >= numElemsInCol*currentCol
        if exceededCurrentCol or plottedEvenBalanceOfItemsBtwnCols
          colSpacing = (legendDim.colSpace + legendDim.ptRadius*2 + legendDim.ptToTextSpace)*currentCol
          numItemsInPrevCols = i
          currentCol++

        totalItemsSpacingExceedLegendArea = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow > viewBoxDim.y + viewBoxDim.height
        break if totalItemsSpacingExceedLegendArea

      li = itemsArray[i]
      if li.isDraggedPt
        li.x = legendDim.x + legendDim.leftPadding + colSpacing
        li.y = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow + legendDim.vertPtPadding
      else
        li.cx = legendDim.x + legendDim.leftPadding + colSpacing + li.r
        li.cy = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow
        li.x = li.cx + legendDim.ptToTextSpace
        li.y = li.cy + li.r
      i++

  setupLegendGroupsAndPts: (data) ->
    legendGroups = data.legendGroups
    legendDim = data.legendDim
    legendPts = data.legendPts

    if legendPts.length > 0
      totalLegendItems = legendGroups.length + legendPts.length
      legendItemArray = []
      i = 0
      j = 0
      while i < totalLegendItems
        if i < legendGroups.length
          legendItemArray.push legendGroups[i]
        else
          j = i - legendGroups.length
          legendItemArray.push legendPts[j]
        i++

      data.setLegendItemsPositions(data, totalLegendItems, legendItemArray, legendDim.cols)
    else
      @setLegendItemsPositions(@, legendGroups.length, legendGroups, legendDim.cols)

  resizedAfterLegendGroupsDrawn: ->
    initWidth = @viewBoxDim.width

    totalLegendItems = @legendGroups.length + @legendPts.length
    legendGrpsTextMax = 0
    if @legendGroups.length > 0
      legendGrpsTextMax = (_.maxBy(@legendGroups, (e) -> e.width)).width
    legendPtsTextMax = if @legendPts.length > 0 then (_.maxBy(@legendPts, (e) -> e.width)).width else 0
    maxTextWidth = Math.max(legendGrpsTextMax, legendPtsTextMax)

    spacingAroundMaxTextWidth = @legendDim.leftPadding +
                                @legendDim.ptRadius * 2 +
                                @legendDim.rightPadding +
                                @legendDim.ptToTextSpace

    @legendDim.cols = Math.ceil((totalLegendItems)*@legendDim.heightOfRow/@viewBoxDim.height)
    @legendDim.width = maxTextWidth*@legendDim.cols + spacingAroundMaxTextWidth + @legendDim.centerPadding*(@legendDim.cols-1)
    @legendDim.colSpace = maxTextWidth

    @viewBoxDim.width = @viewBoxDim.svgWidth - @legendDim.width - @viewBoxDim.x
    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width
    @setupLegendGroupsAndPts(@)

    initWidth != @viewBoxDim.width

  getDefaultColor: ->
    @colorWheel[(@cIndex++)%(@colorWheel.length)]

  isOutsideViewBox: (lab) ->
    left  = lab.x - lab.width/2
    right = lab.x + lab.width/2
    top   = lab.y - lab.height
    bot   = lab.y

    if left < @viewBoxDim.x or
        right > @viewBoxDim.x + @viewBoxDim.width or
        top < @viewBoxDim.y or
        bot > @viewBoxDim.y + @viewBoxDim.height
      return true
    return false

  isLegendPtOutsideViewBox: (lab) ->
    left  = lab.x
    right = lab.x + lab.width
    top   = lab.y - lab.height
    bot   = lab.y

    if left < @viewBoxDim.x or
        right > @viewBoxDim.x + @viewBoxDim.width or
        top < @viewBoxDim.y or
        bot > @viewBoxDim.y + @viewBoxDim.height
      return true
    return false

  moveElemToLegend: (id, data) ->
    checkId = (e) -> e.id == id
    movedPt = _.remove @pts, checkId
    movedLab = _.remove @lab, checkId
    data.legendPts.push {
      id: id
      pt: movedPt[0]
      lab: movedLab[0]
      anchor: 'start'
      text: movedPt[0].label + ' (' + movedPt[0].labelX + ', ' + movedPt[0].labelY + ')'
      color: movedPt[0].color
      isDraggedPt: true
    }
    @draggedOutPtsId.push id
    @normalizeData(data)
    @calcDataArrays()
    @setupLegendGroupsAndPts(@)

  removeElemFromLegend: (id, data) ->
    checkId = (e) -> e.id == id
    legendPt = _.remove data.legendPts, checkId
    @pts.push legendPt.pt
    @lab.push legendPt.lab

    _.remove @draggedOutPtsId, (i) -> i == id
    _.remove @draggedOutCondensedPts, (i) -> i.dataId == id

    @normalizeData(data)
    @calcDataArrays()
    @setupLegendGroupsAndPts(@)
