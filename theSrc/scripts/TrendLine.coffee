class TrendLines
  constructor: (@X, @Y, @Z, @group) ->
    unless @X.length == @Y.length and @X.length == @Z.length and @X.length == @group.length
      throw new Error('Given X, Y, Z, group unequal lengths!')

    @lines = {}

    for x, i in @X
      lines[@group[i]] = [] unless lines[@group[i]]?
      @line.push []



  getTrendLines: () =>
    @lines
