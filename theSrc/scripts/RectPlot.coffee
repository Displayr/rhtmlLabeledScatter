class RectPlot
  constructor: (width, height, X, Y, svg) ->
    @svg = svg
    @viewBoxDim = _calcViewBoxDim X, Y, width, height
    @viewBoxDim['x'] = width / 5
    @viewBoxDim['y'] = height / 5

  getViewBoxDim: -> @viewBoxDim

  draw: (minX, maxX, minY, maxY) ->
    @svg.append('rect')
        .attr('class', 'plot-viewbox')
        .attr('x', @viewBoxDim.x)
        .attr('y', @viewBoxDim.y)
        .attr('width', @viewBoxDim.width)
        .attr('height', @viewBoxDim.height)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', '1px')

    drawDimensionMarkers(minX, maxX, minY, maxY, @viewBoxDim, @svg)

  drawDimensionMarkers = (minX, maxX, minY, maxY, viewBoxDim, svg)->
    originX = _normalizeXCoords 0, minX, maxX, viewBoxDim
    originY = _normalizeYCoords 0, minY, maxY, viewBoxDim
    originAxis = [
      {x1: viewBoxDim.x, y1: originY, x2: viewBoxDim.x + viewBoxDim.width, y2: originY},
      {x1: originX, y1: viewBoxDim.y, x2: originX, y2: viewBoxDim.y + viewBoxDim.height}
    ]

    svg.selectAll('.origin')
        .data(originAxis)
        .enter()
        .append('line')
        .attr('class', 'origin')
        .attr('x1', (d) -> d.x1)
        .attr('y1', (d) -> d.y1)
        .attr('x2', (d) -> d.x2)
        .attr('y2', (d) -> d.y2)
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('3, 3'))

    #calculate number of dimension markers
    between = (num, min, max) ->
      num > min and num < max

    colsPositive = 0
    colsNegative = 0
    i = 0.25
    while between(i, minX, maxX) or between(-i, minX, maxX)
      colsPositive++ if between(i, minX, maxX)
      colsNegative++ if between(-i, minX, maxX)
      i += 0.25

    rowsPositive = 0
    rowsNegative = 0
    i = 0.25
    while between(i, minY, maxY) or between(-i, minY, maxY)
      rowsNegative++ if between(i, minY, maxY) # y axis inversed svg
      rowsPositive++ if between(-i, minY, maxY)
      i += 0.25

    dimensionMarkerStack = []
    dimensionMarkerLeaderStack = []
    dimensionMarkerLabelStack = []
    pushDimensionMarker = (type, x1, y1, x2, y2, label) ->
      leaderLineLen = 5
      labelHeight = 15
      numShown = label.toFixed(1)
      if type == 'c'
        dimensionMarkerLeaderStack.push({x1: x1, y1: y2, x2: x1, y2: y2 + leaderLineLen})
        dimensionMarkerLabelStack.push({x: x1, y: y2 + leaderLineLen + labelHeight, label: numShown, anchor: 'middle'})
      if type == 'r'
        dimensionMarkerLeaderStack.push({x1: x1 - leaderLineLen, y1: y1, x2: x1, y2: y2})
        dimensionMarkerLabelStack.push({x: x1 - leaderLineLen, y: y2 + labelHeight/3, label: numShown, anchor: 'end'})
    pushDimensionMarker 'r', originAxis[0].x1, originAxis[0].y1, originAxis[0].x2, originAxis[0].y2, 0
    pushDimensionMarker 'c', originAxis[1].x1, originAxis[1].y1, originAxis[1].x2, originAxis[1].y2, 0
    i = 0
    while i < Math.max(colsPositive, colsNegative)
      if i < colsPositive
        val = (i+1)*0.25
        x1 = _normalizeXCoords val, minX, maxX, viewBoxDim
        y1 = viewBoxDim.y
        x2 = _normalizeXCoords val, minX, maxX, viewBoxDim
        y2 = viewBoxDim.y + viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val

      if i < colsNegative
        val = -(i+1)*0.25
        x1 = _normalizeXCoords val, minX, maxX, viewBoxDim
        y1 = viewBoxDim.y
        x2 = _normalizeXCoords val, minX, maxX, viewBoxDim
        y2 = viewBoxDim.y + viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val
      i++

    i = 0
    while i < Math.max(rowsPositive, rowsNegative)
      x1 = y1 = x2 = y2 = 0
      if i < rowsPositive
        val = -(i+1)*0.25
        x1 = viewBoxDim.x
        y1 = _normalizeYCoords val, minY, maxY, viewBoxDim
        x2 = viewBoxDim.x + viewBoxDim.width
        y2 = _normalizeYCoords val, minY, maxY, viewBoxDim
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      if i < rowsNegative
        val = (i+1)*0.25
        x1 = viewBoxDim.x
        y1 = _normalizeYCoords val, minY, maxY, viewBoxDim
        x2 = viewBoxDim.x + viewBoxDim.width
        y2 = _normalizeYCoords val, minY, maxY, viewBoxDim
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      i++

    svg.selectAll('.dim-marker')
             .data(dimensionMarkerStack)
             .enter()
             .append('line')
             .attr('class', 'dim-marker')
             .attr('x1', (d) -> d.x1)
             .attr('y1', (d) -> d.y1)
             .attr('x2', (d) -> d.x2)
             .attr('y2', (d) -> d.y2)
             .attr('stroke-width', 0.2)
             .attr('stroke', 'grey')

    svg.selectAll('.dim-marker-leader')
             .data(dimensionMarkerLeaderStack)
             .enter()
             .append('line')
             .attr('class', 'dim-marker-leader')
             .attr('x1', (d) -> d.x1)
             .attr('y1', (d) -> d.y1)
             .attr('x2', (d) -> d.x2)
             .attr('y2', (d) -> d.y2)
             .attr('stroke-width', 1)
             .attr('stroke', 'black')

    svg.selectAll('.dim-marker-label')
             .data(dimensionMarkerLabelStack)
             .enter()
             .append('text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.label)
             .attr('text-anchor', (d) -> d.anchor)

  _calcViewBoxDim = (X, Y, width, height) ->
    return {
      width: width / 2
      height: height / 2
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    }

  _normalizeXCoords = (Xcoord, minX, maxX, viewBoxDim) ->
    (Xcoord-minX)/(maxX - minX)*viewBoxDim.width + viewBoxDim.x

  _normalizeYCoords = (Ycoord, minY, maxY, viewBoxDim) ->
    (Ycoord-minY)/(maxY - minY)*viewBoxDim.height + viewBoxDim.y
