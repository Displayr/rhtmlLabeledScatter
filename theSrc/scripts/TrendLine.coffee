class TrendLine
  constructor: (@pts, @labs) ->
    @linePts = {}
    @arrowheadLabels = {}
    @groupToLabel = {}

    _.map(@pts, (pt, i) =>
      unless @linePts[pt.group]?
        @linePts[pt.group] = []

      unless @groupToLabel[pt.group]? and @arrowheadLabels[pt.group]?
        @groupToLabel[pt.group] = @labs[i]
        @arrowheadLabels[pt.group] = @labs[i]

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
    @arrowheadPts = []

    _.map(@linePts, (groupPts, groupName) =>
      @lines[groupName] = []
      @linesMapped[groupName] = []

      switch groupPts.length
        when 0
          return
        when 1
          @arrowheadPts.push(groupPts[0])
          return
        when 2
          @lines[groupName] = [[groupPts[0].x, groupPts[0].y, groupPts[1].x, groupPts[1].y]]
          @arrowheadPts.push(groupPts[1])
          @arrowheadLabels[groupName].x = groupPts[1].x - @arrowheadLabels[groupName].width/2
          @arrowheadLabels[groupName].y = groupPts[1].y - @arrowheadLabels[groupName].height/2
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

          lastLinePt = _.last(@linesMapped[groupName])
          @arrowheadPts.push(lastLinePt)
          @arrowheadLabels[groupName].x = lastLinePt.x - @arrowheadLabels[groupName].width/2
          @arrowheadLabels[groupName].y = lastLinePt.y - @arrowheadLabels[groupName].height/2

    )
    @lines

  getLineArray: (group) =>
    unless @lines?
      @_createLineArrays()

    @lines[group]

  getArrowheadPts: () =>
    unless @arrowheadPts?
      @_createLineArrays()

    @arrowheadPts

  getArrowheadLabels: () =>
    _.values @arrowheadLabels

  getTrendLines: () =>
    @lines

  getUniqueGroups: =>
    @groups
