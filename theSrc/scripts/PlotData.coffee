class PlotData
  constructor: (X, Y, group, label, viewBoxDim, colors) ->
    @X = X
    @Y = Y
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
      # '#FFFFFF' was in original color wheel but removed
      '#FF2323'
    ]
    @cIndex = 0

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

    threshold = 0.05
    i = 0
    while i < @len
      @X[i] = threshold + (@X[i] - @minX)/(@maxX - @minX)*(1-2*threshold)
      @Y[i] = threshold + (@Y[i] - @minY)/(@maxY - @minY)*(1-2*threshold)
      i++

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
      @pts.push({
        x: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        y: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        r: 2
        label: @label[i]
        labelX: @X[i].toPrecision(3).toString()
        labelY: @Y[i].toPrecision(3).toString()
        group: @group[i]
        color: newColor
      })
      @lab.push({
        x: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        y: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        text: @label[i]
        color: newColor
      })
      @anc.push({
        x: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        y: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        r: 2
      })
      i++

  getDefaultColor: ->
    @colorWheel[(@cIndex++)%(@colorWheel.length)]
