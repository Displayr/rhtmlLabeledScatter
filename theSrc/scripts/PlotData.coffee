class PlotData
  constructor: (X, Y, group, label, viewBoxDim, legendDim, colors) ->
    @X = X
    @Y = Y
    @origX = X.slice(0)
    @origY = Y.slice(0)
    @normX = X.slice(0)
    @normY = Y.slice(0)
    @group = group
    @label = label
    @viewBoxDim = viewBoxDim
    @legendDim = legendDim
    @draggedOutPtsId = []
    @legendPts = []

    @colorWheel = if colors then colors else [ # default qColors
      '#5B9BD5'
      '#ED7D31'
      '#A5A5A5'
      '#1EC000'
      '#4472C4'
      '#70AD47'
      '#255E91'
      '#9E480E'
      '#636363'
      '#997300'
      '#264478'
      '#43682B'
      # '#FFFFFF' white in original color wheel but removed
      '#FF2323'
    ]
    @cIndex = 0 # color index

    if @X.length is @Y.length
      @len = @origLen= X.length
      @normalizeData()
      @setupColors()
      @calcDataArrays()
    else
      throw new Error("Inputs X and Y lengths do not match!")

  normalizeData: ->
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
    @maxX = if @maxX < 0 then 0 else @maxX+xThres # so axis can be on origin
    @minX = if @minX > 0 then 0 else @minX-xThres
    yThres = thres*(@maxY - @minY)
    @maxY = if @maxY < 0 then 0 else @maxY+yThres
    @minY = if @minY > 0 then 0 else @minY-yThres

    i = 0
    while i < @origLen
      unless _.includes ptsOut, i
        @normX[i] = (@X[i] - @minX)/(@maxX - @minX)
        @normY[i] = (@Y[i] - @minY)/(@maxY - @minY)
      i++

  setupColors: ->
    @legendGroups = []
    @groupToColorMap = {}
    group = @group
    i = 0
    while i < @len
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
    @anc = []

    i = 0
    while i < @origLen
      unless _.includes @draggedOutPtsId, i
        x = @normX[i]*@viewBoxDim.width + @viewBoxDim.x
        y = (1-@normY[i])*@viewBoxDim.height + @viewBoxDim.y
        @pts.push({
          x: x
          y: y
          r: 2
          label: @label[i]
          labelX: @origX[i].toPrecision(3).toString()
          labelY: @origY[i].toPrecision(3).toString()
          group: @group[i]
          color: @groupToColorMap[@group[i]]
          id: i
        })
        @lab.push({
          x: x
          y: y
          text: @label[i]
          color: @groupToColorMap[@group[i]]
          id: i
        })
        @anc.push({
          x: x
          y: y
          r: 2
          id: i
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
    c = 1
    while i < numItems
      if cols > 1
        exceededCurrentCol = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow > viewBoxDim.y + viewBoxDim.height
        numElemsInCol = numItems/cols
        plottedEvenBalanceOfItemsBtwnCols = i >= numElemsInCol*c
        if exceededCurrentCol or plottedEvenBalanceOfItemsBtwnCols
          colSpacing = (legendDim.colSpace + legendDim.ptRadius*2 + legendDim.ptToTextSpace)*c
          numItemsInPrevCols = i
          c++

        totalItemsSpacingExceedLegendArea = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow > viewBoxDim.y + viewBoxDim.height
        break if totalItemsSpacingExceedLegendArea

      li = itemsArray[i]
      li.cx = legendDim.x + legendDim.leftPadding + colSpacing
      li.cy = legendStartY + (i-numItemsInPrevCols)*legendDim.heightOfRow
      li.x = li.cx + legendDim.ptToTextSpace
      li.y = li.cy + li.r
      i++

  # determine positions of items in legend (groups and/or pts dragged off plot)
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

  moveElemToLegend: (id, legendPts) ->
    checkId = (e) -> e.id == id
    movedPt = _.remove @pts, checkId
    movedLab = _.remove @lab, checkId
    movedAnc = _.remove @anc, checkId
    legendPts.push {
      pt: movedPt[0]
      lab: movedLab[0]
      anc: movedAnc[0]
      r: @legendDim.ptMovedRadius
      anchor: 'start'
      text: movedPt[0].label + ' (' + movedPt[0].labelX + ', ' + movedPt[0].labelY + ')'
      yOffset: @legendDim.yPtOffset
      color: movedPt[0].color
    }
    @draggedOutPtsId.push id
    @len--
    @normalizeData()
    @calcDataArrays()
    @setupLegendGroupsAndPts(@)
