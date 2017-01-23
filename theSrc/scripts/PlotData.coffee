'use strict'

class PlotData
  constructor: (@X,
                @Y,
                @Z,
                @group,
                @label,
                @labelAlt,
                @viewBoxDim,
                @legendDim,
                @colorWheel,
                @fixedAspectRatio,
                @originAlign,
                @pointRadius,
                @bounds,
                @transparency,
                @legendShow,
                @legendBubblesShow,
                @axisDimensionText) ->

    @origX = @X.slice(0)
    @origY = @Y.slice(0)
    @normX = @X.slice(0)
    @normY = @Y.slice(0)
    @normZ = @Z.slice() if Utils.get().isArr(@Z)
    @outsidePlotPtsId = []
    @legendPts = []
    @outsidePlotCondensedPts = []
    @legendBubbles = []
    @legendBubblesLab = []

    @cIndex = 0 # color index

    if @X.length is @Y.length
      @len = @origLen= X.length
      @normalizeData()
      @normalizeZData() if Utils.get().isArr(@Z)
      @plotColors = new PlotColors(@)
      @labelNew = new PlotLabel(@label, @labelAlt, @viewBoxDim.labelLogoScale)
      @getPtsAndLabs()
    else
      throw new Error("Inputs X and Y lengths do not match!")

  revertMinMax: =>
    @minX = @minXold
    @maxX = @maxXold
    @minY = @minYold
    @maxY = @maxYold

  calculateMinMax: =>
    @minXold = @minX
    @maxXold = @maxX
    @minYold = @minY
    @maxYold = @maxY

    ptsOut = @outsidePlotPtsId
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
    rangeX = @maxX - @minX
    rangeY = @maxY - @minY
    thres = 0.08
    xThres = thres*rangeX
    yThres = thres*rangeY
    if xThres == 0 # if there is no difference, add arbitrary threshold of 1
      xThres = 1
    if yThres == 0 # if there is no difference, add arbitrary threshold of 1
      yThres = 1

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
      factor = Math.abs(rangeX - rangeY)/2
      if rangeX > rangeY
        @maxY += factor
        @minY -= factor
      else if rangeX < rangeY
        @maxX += factor
        @minX -= factor

      if @viewBoxDim.width > @viewBoxDim.height
        rangeX = @maxX-@minX
        factor = (@viewBoxDim.width/@viewBoxDim.height - 1)/2
        @maxX += rangeX*factor
        @minX -= rangeX*factor
      else if @viewBoxDim.width < @viewBoxDim.height
        rangeY = (@maxY-@minY)
        factor = (@viewBoxDim.height/@viewBoxDim.width - 1)/2
        @maxY += rangeY*factor
        @minY -= rangeY*factor

    # If user has sent x and y boundaries, these hold higher priority
    @maxX = @bounds.xmax if Utils.get().isNum(@bounds.xmax)
    @minX = @bounds.xmin if Utils.get().isNum(@bounds.xmin)
    @maxY = @bounds.ymax if Utils.get().isNum(@bounds.ymax)
    @minY = @bounds.ymin if Utils.get().isNum(@bounds.ymin)

  normalizeData: =>
    @calculateMinMax()

    #create list of movedOffPts that need markers
    @outsidePlotMarkers = []
    @outsidePlotMarkersIter = 0

    for lp in @legendPts
      id = lp.pt.id
      draggedNormX = (@X[id] - @minX)/(@maxX - @minX)
      draggedNormY = (@Y[id] - @minY)/(@maxY - @minY)
      newMarkerId = @outsidePlotMarkersIter
      lp.markerId = newMarkerId

      if Math.abs(draggedNormX) > 1 or Math.abs(draggedNormY) > 1 or
         draggedNormX < 0 or draggedNormY < 0

        draggedNormX = if draggedNormX > 1 then 1 else draggedNormX
        draggedNormX = if draggedNormX < 0 then 0 else draggedNormX
        draggedNormY = if draggedNormY > 1 then 1 else draggedNormY
        draggedNormY = if draggedNormY < 0 then 0 else draggedNormY
        x2 = draggedNormX*@viewBoxDim.width + @viewBoxDim.x
        y2 = (1-draggedNormY)*@viewBoxDim.height + @viewBoxDim.y

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

        @outsidePlotMarkers.push
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
        @outsidePlotCondensedPts = _.filter @outsidePlotCondensedPts, (e) -> e.dataId != id
        @len = @origLen - @outsidePlotMarkers.length

      else # no marker required, but still inside plot window
        console.log "rhtmlLabeledScatter: Condensed point added"
        condensedPtsDataIdArray = _.map @outsidePlotCondensedPts, (e) -> e.dataId
        unless _.includes condensedPtsDataIdArray, id
          @outsidePlotCondensedPts.push(
            dataId: id
            markerId: newMarkerId
          )
      @outsidePlotMarkersIter++

    # Remove pts that are outside plot if user bounds were set
    @outsideBoundsPtsId = []
    if _.some(@bounds, (b) -> Utils.get().isNum(b))
      i = 0
      while i < @origLen
        unless _.includes(@outsideBoundsPtsId, i)
          if @X[i] < @minX or @X[i] > @maxX or
             @Y[i] < @minY or @Y[i] > @maxY
            @outsideBoundsPtsId.push i
        i++

    i = 0
    while i < @origLen
      @normX[i] = if @minX == @maxX then @minX else (@X[i] - @minX)/(@maxX - @minX)
      @normY[i] = if @minY == @maxY then @minX else (@Y[i] - @minY)/(@maxY - @minY)
      i++

  normalizeZData: =>
    legendUtils = LegendUtils.get()

    maxZ = _.max @Z
    legendUtils.calcZQuartiles(@, maxZ)
    legendUtils.normalizeZValues(@, maxZ)

  getPtsAndLabs: =>
    Promise.all(@labelNew.promiseLabelArray).then((resolvedLabels) =>
      @pts = []
      @lab = []

      i = 0
      while i < @origLen
        if (not _.includes(@outsidePlotPtsId, i)) or
           _.includes((_.map @outsidePlotCondensedPts, (e) -> e.dataId), i)
          x = @normX[i]*@viewBoxDim.width + @viewBoxDim.x
          y = (1-@normY[i])*@viewBoxDim.height + @viewBoxDim.y
          r = @pointRadius
          if Utils.get().isArr(@Z)
            legendUtils = LegendUtils.get()
            r = legendUtils.normalizedZtoRadius @viewBoxDim, @normZ[i]
          fillOpacity = @plotColors.getFillOpacity(@transparency)

          label = resolvedLabels[i].label
          labelAlt = if @labelAlt?[i]? then @labelAlt[i] else ''
          width = resolvedLabels[i].width
          height = resolvedLabels[i].height
          url = resolvedLabels[i].url

          labelZ = if Utils.get().isArr(@Z) then @Z[i].toString() else ''
          fontSize = @viewBoxDim.labelFontSize

          # If pt hsa been already condensed
          if _.includes (_.map @outsidePlotCondensedPts, (e) -> e.dataId), i
            pt = _.find @outsidePlotCondensedPts, (e) -> e.dataId == i
            label = pt.markerId + 1
            fontSize = @viewBoxDim.labelSmallFontSize
            url = ''
            width = null
            height = null

          fontColor = ptColor = @plotColors.getColor(i)
          fontColor = @viewBoxDim.labelFontColor if @viewBoxDim.labelFontColor? and !(@viewBoxDim.labelFontColor == '')
          group = if @group? then @group[i] else ''
          @pts.push({
            x: x
            y: y
            r: r
            label: label
            labelAlt: labelAlt
            labelX: @origX[i].toPrecision(3).toString()
            labelY: @origY[i].toPrecision(3).toString()
            labelZ: labelZ
            group: group
            color: ptColor
            id: i
            fillOpacity: fillOpacity
          })
          @lab.push({
            x: x
            y: y
            color: fontColor
            id: i
            fontSize: fontSize
            fontFamily: @viewBoxDim.labelFontFamily
            text: label
            width: width
            height: height
            url: url
          })
        i++

      # Remove pts outside plot because user bounds set
      for p in @outsideBoundsPtsId
        @addElemToLegend(p) unless _.includes(@outsidePlotPtsId, p)
    ).catch((err) -> console.log err)

  setLegendItemsPositions: (numItems, itemsArray, cols) =>
    bubbleLegendTextHeight = 20
    @legendHeight = @viewBoxDim.height
    if @legendBubblesTitle? and @legendBubblesShow
      @legendHeight = @legendBubblesTitle[0].y - bubbleLegendTextHeight - @viewBoxDim.y

    if @Zquartiles?
      legendUtils = LegendUtils.get()
      legendUtils.setupBubbles(@)

    startOfCenteredLegendItems = (@viewBoxDim.y + @legendHeight/2 -
                                  @legendDim.heightOfRow*(numItems/cols)/2 +
                                  @legendDim.ptRadius)
    startOfViewBox = @viewBoxDim.y + @legendDim.ptRadius
    legendStartY = Math.max(startOfCenteredLegendItems, startOfViewBox)

    colSpacing = 0
    numItemsInPrevCols = 0

    i = 0
    currentCol = 1
    while i < numItems
      if cols > 1
        numElemsInCol = numItems/cols
        exceededCurrentCol = legendStartY + (i-numItemsInPrevCols)*@legendDim.heightOfRow > @viewBoxDim.y + @legendHeight
        plottedEvenBalanceOfItemsBtwnCols = i >= numElemsInCol*currentCol
        if exceededCurrentCol or plottedEvenBalanceOfItemsBtwnCols
          colSpacing = (@legendDim.colSpace + @legendDim.ptRadius*2 + @legendDim.ptToTextSpace)*currentCol
          numItemsInPrevCols = i
          currentCol++

        totalItemsSpacingExceedLegendArea = legendStartY + (i-numItemsInPrevCols)*@legendDim.heightOfRow > @viewBoxDim.y + @legendHeight
        break if totalItemsSpacingExceedLegendArea

      li = itemsArray[i]
      if li.isDraggedPt
        li.x = @legendDim.x + @legendDim.leftPadding + colSpacing
        li.y = legendStartY + (i-numItemsInPrevCols)*@legendDim.heightOfRow + @legendDim.vertPtPadding
      else
        li.cx = @legendDim.x + @legendDim.leftPadding + colSpacing + li.r
        li.cy = legendStartY + (i-numItemsInPrevCols)*@legendDim.heightOfRow
        li.x = li.cx + @legendDim.ptToTextSpace
        li.y = li.cy + li.r
      i++

  setupLegendGroupsAndPts: =>
    if @legendPts.length > 0 and @legendShow == true
      totalLegendItems = @legendGroups.length + @legendPts.length
      legendItemArray = []
      i = 0
      j = 0
      while i < totalLegendItems
        if i < @legendGroups.length
          legendItemArray.push @legendGroups[i]
        else
          j = i - @legendGroups.length
          legendItemArray.push @legendPts[j]
        i++

      @setLegendItemsPositions(totalLegendItems, legendItemArray, @legendDim.cols)
    else if @legendPts.length > 0 and @legendShow == false
      @setLegendItemsPositions(@legendPts.length, @legendPts, @legendDim.cols)
    else
      @setLegendItemsPositions(@legendGroups.length, @legendGroups, @legendDim.cols)

  resizedAfterLegendGroupsDrawn: =>
    initWidth = @viewBoxDim.width

    totalLegendItems = if @legendShow then @legendGroups.length + @legendPts.length else @legendPts.length
    legendGrpsTextMax = if @legendGroups.length > 0 and @legendShow then (_.maxBy(@legendGroups, (e) -> e.width)).width else 0
    legendPtsTextMax = if @legendPts.length > 0 then (_.maxBy(@legendPts, (e) -> e.width)).width else 0

    maxTextWidth = _.max [legendGrpsTextMax, legendPtsTextMax]

    spacingAroundMaxTextWidth = @legendDim.leftPadding +
                                @legendDim.ptRadius * 2 +
                                @legendDim.rightPadding +
                                @legendDim.ptToTextSpace

    bubbleLeftRightPadding = @legendDim.leftPadding + @legendDim.rightPadding

    @legendDim.cols = Math.ceil((totalLegendItems)*@legendDim.heightOfRow/@legendHeight)
    @legendDim.width = maxTextWidth*@legendDim.cols + spacingAroundMaxTextWidth + @legendDim.centerPadding*(@legendDim.cols-1)

    bubbleTitleWidth = @legendBubblesTitle?[0].width
    @legendDim.width = _.max [@legendDim.width, bubbleTitleWidth + bubbleLeftRightPadding, @legendBubblesMaxWidth + bubbleLeftRightPadding]

    @legendDim.colSpace = maxTextWidth

    @viewBoxDim.width = @viewBoxDim.svgWidth - @legendDim.width - @viewBoxDim.x - @axisDimensionText.rowMaxWidth
    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width

    initWidth != @viewBoxDim.width

  isOutsideViewBox: (lab) =>
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

  isLegendPtOutsideViewBox: (lab) =>
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

  addElemToLegend: (id) =>
    checkId = (e) -> e.id == id
    movedPt = _.remove @pts, checkId
    movedLab = _.remove @lab, checkId
    @legendPts.push {
      id: id
      pt: movedPt[0]
      lab: movedLab[0]
      anchor: 'start'
      text: movedLab[0].text + ' (' + movedPt[0].labelX + ', ' + movedPt[0].labelY + ')'
      color: movedPt[0].color
      isDraggedPt: true
    }
    @outsidePlotPtsId.push id
    @normalizeData()
    @getPtsAndLabs()
    @setupLegendGroupsAndPts()

  removeElemFromLegend: (id) =>
    checkId = (e) -> e.id == id
    legendPt = _.remove @legendPts, checkId
    @pts.push legendPt.pt
    @lab.push legendPt.lab

    _.remove @outsidePlotPtsId, (i) -> i == id
    _.remove @outsidePlotCondensedPts, (i) -> i.dataId == id

    @normalizeData()
    @getPtsAndLabs()
    @setupLegendGroupsAndPts()
