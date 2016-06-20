class PlotData
  constructor: (X, Y) ->
    @X = X
    @Y = Y
    if @X.length is @Y.length
      @len = X.length
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

  getX: -> @X
  getY: -> @Y
  getLen: -> @len
  getMinX: -> @minX
  getMaxX: -> @maxX
  getMinY: -> @minY
  getMaxY: -> @maxY
