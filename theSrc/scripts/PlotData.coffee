class PlotData
  constructor: (X, Y, group, label, viewBoxDim, colors) ->
    @X = X
    @Y = Y
    @origX = X.slice(0)
    @origY = Y.slice(0)
    @group = group
    @label = label
    @viewBoxDim = viewBoxDim

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
    @minX = Infinity
    @maxX = -Infinity
    @minY = Infinity
    @maxY = -Infinity
    i = 0
    while i < @len
      @minX = @X[i] if @minX > @X[i]
      @maxX = @X[i] if @maxX < @X[i]
      @minY = @Y[i] if @minY > @Y[i]
      @maxY = @Y[i] if @maxY < @Y[i]
      i++

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
    @legend = []
    group = @group

    # color = new RColor #using rColor library to gen random colours



    i = 0
    while i < @len
      unless (_.some @legend, (e) -> e.text is group[i])
        # newColor = color.get(true, 0.9, 0.9)
        newColor = @getDefaultColor()
        @legend.push {
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
      })
      i++

  getDefaultColor: ->
    @colorWheel[(@cIndex++)%(@colorWheel.length)]
