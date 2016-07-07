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
          text: @group[i]
          color: newColor
        }
        @groupToColorMap[@group[i]] = newColor
      i++

  calcDataArrays: () ->
    @pts = []
    @lab = []
    @anc = []
    group = @group

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

  setupLegendGroups: (legendGroups, legendDim) ->
    legendStartY =
      Math.max((@viewBoxDim.y +
        @viewBoxDim.height/2 -
        legendDim.heightOfRow*(legendGroups.length)/2 +
        legendDim.ptRadius),
        @viewBoxDim.y + legendDim.ptRadius)

    i = 0
    while i < legendGroups.length
      li = legendGroups[i]
      li.r = legendDim.ptRadius
      li.cx = legendDim.x + legendDim.leftPadding
      li.cy = legendStartY + i*legendDim.heightOfRow
      li.x = li.cx + legendDim.ptToTextSpace
      li.y = li.cy + li.r
      li.anchor = 'start'
      i++

  calcLegendDisplayPtsAndGroups: (legendGroups, legendDim, legendPts) ->
    if legendPts.length > 0
      legendStartY =
        Math.max((@viewBoxDim.y +
          @viewBoxDim.height/2 -
          legendDim.heightOfRow*(legendGroups.length + legendPts.length)/2 +
          legendDim.ptRadius),
          @viewBoxDim.y + legendDim.ptRadius)

      i = 0
      j = 0
      while i < legendGroups.length + legendPts.length
        if i < legendGroups.length
          lgi = legendGroups[i]
          lgi.r = legendDim.ptRadius
          lgi.cx = legendDim.x + legendDim.leftPadding
          lgi.cy = legendStartY + i*legendDim.heightOfRow
          lgi.x = lgi.cx + legendDim.ptToTextSpace
          lgi.y = lgi.cy + lgi.r
          lgi.anchor = 'start'
        else
          j = i - legendGroups.length
          lpj = legendPts[j]
          lpj.r = legendDim.ptRadius
          lpj.cx = legendDim.x + legendDim.leftPadding
          lpj.cy = legendStartY + (i+1)*legendDim.heightOfRow
          lpj.x = lpj.cx + legendDim.ptToTextSpace
          lpj.y = lpj.cy + lpj.r
          lpj.color = lpj.pt.color
          lpj.text = lpj.pt.label + lpj.pt.labelX + lpj.pt.labelY
          lpj.anchor = 'start'
        i++
    else
      @setupLegendGroups(legendGroups, legendDim)


  resizedAfterLegendGroupsDrawn: ->
    initVal = @legendDim.maxTextWidth

    legendGrpsTextMax = (_.maxBy(@legendGroups, (e) -> e.width)).width
    legendPtsTextMax = if @legendPts.length > 0 then (_.maxBy(@legendPts, (e) -> e.width)).width else 0
    @legendDim.maxTextWidth = Math.max(legendGrpsTextMax, legendPtsTextMax)

    @legendDim.width = @legendDim.maxTextWidth +
      @legendDim.leftPadding +
      @legendDim.ptRadius * 2 +
      @legendDim.rightPadding +
      @legendDim.ptToTextSpace

    @viewBoxDim.width = @viewBoxDim.svgWidth - @legendDim.width - @viewBoxDim.x
    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width
    @setupLegendGroups(@legendGroups, @legendDim)
    @calcLegendDisplayPtsAndGroups(@legendGroups, @legendDim, @legendPts)

    initVal != @legendDim.maxTextWidth

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
    }
    @draggedOutPtsId.push id
    @len--
    @normalizeData()
    @calcDataArrays()
    @calcLegendDisplayPtsAndGroups(@legendGroups, @legendDim, legendPts)
