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

    @groups = _.keys @linePts

    @_createLineArrays()


  _createLineArrays: =>
    @linesMapped = {}
    @lines = {}

    _.map(@linePts, (groupPts, groupName) =>
      @lines[groupName] = []
      @linesMapped[groupName] = []

      switch groupPts.length
        when 0, 1 then return
        when 2 then @lines[groupName] = [[groupPts[0].x, groupPts[0].y, groupPts[1].x, groupPts[1].y]]
        else
          # Adds another point for every "middle" point
          for pt, i in groupPts
            @linesMapped[groupName].push(pt)

            if i != 0 and i != groupPts.length - 1
              @linesMapped[groupName].push(pt)

          # Constructs the line array
          i = 0
          while i < @linesMapped[groupName].length
            @lines[groupName].push [@linesMapped[groupName][i].x, @linesMapped[groupName][i].y, @linesMapped[groupName][i+1].x, @linesMapped[groupName][i+1].y]
            i += 2

    )
    @lines

  getLineArray: (group) =>
    unless @lines?
      @_createLineArrays()

    @lines[group]

  getTrendLines: () =>
    @lines

  getUniqueGroups: =>
    @groups
