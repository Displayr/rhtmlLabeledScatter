class PlotData
  constructor: (X, Y, group, label, viewBoxDim) ->
    @X = X
    @Y = Y
    @group = group
    @label = label
    @viewBoxDim = viewBoxDim
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
    color = new RColor #using rColor library to gen random colours
    group = @group

    i = 0
    while i < @len
      unless (_.some @legend, (e) -> e.text is group[i])
        newColor = color.get(true, 0.9, 0.9)
        @legend.push {text: @group[i], color: newColor}
      @pts.push({
        x: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        y: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        r: 2
        label: @label[i]
        labelX: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        labelY: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        group: @group[i]
        color: newColor
      })
      @lab.push({
        x: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        y: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        text: @label[i]
      })
      @anc.push({
        x: @X[i]*@viewBoxDim.width + @viewBoxDim.x
        y: @Y[i]*@viewBoxDim.height + @viewBoxDim.y
        r: 2
      })
      i++
