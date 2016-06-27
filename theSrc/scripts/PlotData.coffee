class PlotData
  constructor: (X, Y, group, label, viewBoxDim, legendDim, colors) ->
    @X = X
    @Y = Y
    @origX = X.slice(0)
    @origY = Y.slice(0)
    @group = group
    @label = label
    @viewBoxDim = viewBoxDim
    @legendDim = legendDim

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
      @len = X.length
      @normalizeData()
      @initDataArrays()
    else
      throw new Error("Inputs X and Y lengths do not match!")

  normalizeData: ->
    @minX = _.min @X
    @maxX = _.max @X
    @minY = _.min @Y
    @maxY = _.max @Y

    thres = 0.08
    xThres = thres*(@maxX - @minX)
    @maxX = if @maxX < 0 then 0 else @maxX+xThres
    @minX = if @minX > 0 then 0 else @minX-xThres
    yThres = thres*(@maxY - @minY)
    @maxY = if @maxY < 0 then 0 else @maxY+yThres
    @minY = if @minY > 0 then 0 else @minY-yThres

    i = 0
    while i < @len
      @X[i] = (@X[i] - @minX)/(@maxX - @minX)
      @Y[i] = (@Y[i] - @minY)/(@maxY - @minY)
      i++

    return

  initDataArrays: () ->
    @pts = []
    @lab = []
    @anc = []
    @legendGroups = []
    @legendPts = []
    group = @group

    # color = new RColor #using rColor library to gen random colours

    i = 0
    while i < @len
      unless (_.some @legendGroups, (e) -> e.text is group[i])
        # newColor = color.get(true, 0.9, 0.9)
        newColor = @getDefaultColor()
        @legendGroups.push {
          text: @group[i]
          color: newColor
          # stroke: 'gray'
          # 'stroke-opacity': 0.3
        }
      x = @X[i]*@viewBoxDim.width + @viewBoxDim.x
      y = (1-@Y[i])*@viewBoxDim.height + @viewBoxDim.y
      @pts.push({
        x: x
        y: y
        r: 2
        label: @label[i]
        labelX: @origX[i].toPrecision(3).toString()
        labelY: @origY[i].toPrecision(3).toString()
        group: @group[i]
        color: newColor
        id: i
      })
      @lab.push({
        x: x
        y: y
        text: @label[i]
        color: newColor
        id: i
      })
      @anc.push({
        x: x
        y: y
        r: 2
        id: i
      })
      i++

    @setupLegendGroups(@legendGroups, @legendDim)

  setupLegendGroups: (legendGroups, legendDim) ->
    legendStartY =
      Math.max((@viewBoxDim.y +
        @viewBoxDim.height/2 -
        legendDim.heightOfRow*(legendGroups.length)/2 +
        legendDim.ptRadius), @viewBoxDim.y + legendDim.ptRadius)
    i = 0
    while i < legendGroups.length
      li = legendGroups[i]
      li['r'] = legendDim.ptRadius
      li['cx'] = legendDim.x + legendDim.leftPadding
      li['cy'] = legendStartY + i*legendDim.heightOfRow
      li['x'] = li['cx'] + legendDim.ptToTextSpace
      li['y'] = li['cy'] + li['r']
      li['anchor'] = 'start'
      i++

  resizedAfterLegendGroupsDrawn: ->
    initVal = @legendDim.maxTextWidth
    @legendDim.maxTextWidth = (_.maxBy @legendGroups, (e) -> e.width).width

    @legendDim.width = @legendDim.maxTextWidth +
      @legendDim.leftPadding +
      @legendDim.ptRadius * 2 +
      @legendDim.rightPadding +
      @legendDim.ptToTextSpace

    @viewBoxDim.width = @viewBoxDim.svgWidth - @legendDim.width
    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width
    @setupLegendGroups(@legendGroups, @legendDim)
    console.log 'here'
    console.log @viewBoxDim.width

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

  moveElemToLegend: (id) ->
    checkId = (e) -> e.id == id
    movedPt = _.remove @pts, checkId
    movedLab = _.remove @lab, checkId
    movedAnc = _.remove @anc, checkId
    @legendPts.push {
      pt: movedPt
      lab: movedLab
      anc: movedAnc
    }
    @len--
