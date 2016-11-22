class TrendLine
  constructor: (@pts) ->

    @linePts = {}

    _.map(@pts, (pt) =>
      unless @linePts[pt.group]?
        @linePts[pt.group] = []

      @linePts[pt.group].push {
        x: pt.x
        y: pt.y
        z: pt.r
      }
    )

    console.log @linePts


    @createLineArray()


  createLineArray: =>
    @lines = {}

#    _.map(@linePts, (linePt) ->
#      console.log linePt
#    )

  getTrendLines: () =>
    @lines
