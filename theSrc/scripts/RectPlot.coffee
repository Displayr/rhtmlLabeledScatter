class RectPlot
  constructor: (width, height, X, Y, group, label, svg) ->
    @svg = svg
    @viewBoxDim =
      width: width / 2
      height: height / 2
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    @viewBoxDim['x'] = width / 5
    @viewBoxDim['y'] = height / 5

    @data = new PlotData(X, Y, group, label, @viewBoxDim)
    @minX = @data.minX
    @maxX = @data.maxX
    @minY = @data.minY
    @maxY = @data.maxY

  draw: ->
    @svg.append('rect')
        .attr('class', 'plot-viewbox')
        .attr('x', @viewBoxDim.x)
        .attr('y', @viewBoxDim.y)
        .attr('width', @viewBoxDim.width)
        .attr('height', @viewBoxDim.height)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', '1px')

    @drawDimensionMarkers()
    @drawAxisLabels()
    @drawAnc()
    @drawLabs()
    @drawLegend()

  drawDimensionMarkers: ->
    originX = @_normalizeXCoords 0
    originY = @_normalizeYCoords 0
    originAxis = [
      {x1: @viewBoxDim.x, y1: originY, x2: @viewBoxDim.x + @viewBoxDim.width, y2: originY},
      {x1: originX, y1: @viewBoxDim.y, x2: originX, y2: @viewBoxDim.y + @viewBoxDim.height}
    ]

    @svg.selectAll('.origin')
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
    while between(i, @minX, @maxX) or between(-i, @minX, @maxX)
      colsPositive++ if between(i, @minX, @maxX)
      colsNegative++ if between(-i, @minX, @maxX)
      i += 0.25

    rowsPositive = 0
    rowsNegative = 0
    i = 0.25
    while between(i, @minY, @maxY) or between(-i, @minY, @maxY)
      rowsNegative++ if between(i, @minY, @maxY) # y axis inversed svg
      rowsPositive++ if between(-i, @minY, @maxY)
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
        x1 = @_normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = @_normalizeXCoords val
        y2 = @viewBoxDim.y + @viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val

      if i < colsNegative
        val = -(i+1)*0.25
        x1 = @_normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = @_normalizeXCoords val
        y2 = @viewBoxDim.y + @viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val
      i++

    i = 0
    while i < Math.max(rowsPositive, rowsNegative)
      x1 = y1 = x2 = y2 = 0
      if i < rowsPositive
        val = -(i+1)*0.25
        x1 = @viewBoxDim.x
        y1 = @_normalizeYCoords val
        x2 = @viewBoxDim.x + @viewBoxDim.width
        y2 = @_normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      if i < rowsNegative
        val = (i+1)*0.25
        x1 = @viewBoxDim.x
        y1 = @_normalizeYCoords val
        x2 = @viewBoxDim.x + @viewBoxDim.width
        y2 = @_normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      i++

    @svg.selectAll('.dim-marker')
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

    @svg.selectAll('.dim-marker-leader')
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

    @svg.selectAll('.dim-marker-label')
             .data(dimensionMarkerLabelStack)
             .enter()
             .append('text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.label)
             .attr('text-anchor', (d) -> d.anchor)

  drawAxisLabels: () ->
    yAxisPadding = 35
    xAxisPadding = 40
    axisLabels = [
      { # x axis label
        x: @viewBoxDim.x + @viewBoxDim.width/2
        y: @viewBoxDim.y + @viewBoxDim.height + xAxisPadding
        text: 'Dimension 1 (64%)'
        anchor: 'middle'
        transform: 'rotate(0)'
      },
      { # y axis label
        x: @viewBoxDim.x - yAxisPadding
        y: @viewBoxDim.y + @viewBoxDim.height/2
        text: 'Dimension 2 (24%)'
        anchor: 'middle'
        transform: 'rotate(270,'+(@viewBoxDim.x-yAxisPadding) + ', ' + (@viewBoxDim.y + @viewBoxDim.height/2)+ ')'
      }
    ]

    @svg.selectAll('.axis-label')
             .data(axisLabels)
             .enter()
             .append('text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial')
             .attr('text-anchor', (d) -> d.anchor)
             .attr('transform', (d) -> d.transform)
             .text((d) -> d.text)
             .style('font-weight', 'bold')

  drawLegend: ->
    legendPtRad = 6
    legendLeftPadding = 30
    heightOfRow = 25
    legendStartY = Math.max((@viewBoxDim.y + @viewBoxDim.height/2 - heightOfRow*(@data.legend.length)/2 + legendPtRad), @viewBoxDim.y + legendPtRad)
    i = 0
    while i < @data.legend.length
      li = @data.legend[i]
      li['r'] = legendPtRad
      li['cx'] = @viewBoxDim.x + @viewBoxDim.width + legendLeftPadding
      li['cy'] = legendStartY + i*heightOfRow
      li['x'] = li['cx'] + 15
      li['y'] = li['cy'] + li['r']
      li['anchor'] = 'start'
      i++

    @svg.selectAll('.legend-pts')
             .data(@data.legend)
             .enter()
             .append('circle')
             .attr('cx', (d) -> d.cx)
             .attr('cy', (d) -> d.cy)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)
             .attr('stroke', (d) -> d.stroke)
             .attr('stroke-opacity', (d) -> d['stroke-opacity'])

    @svg.selectAll('.legend-text')
             .data(@data.legend)
             .enter()
             .append('text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.text)
             .attr('text-anchor', (d) -> d.anchor)

  _normalizeXCoords: (Xcoord) ->
    (Xcoord-@minX)/(@maxX - @minX)*@viewBoxDim.width + @viewBoxDim.x

  _normalizeYCoords: (Ycoord) ->
    (Ycoord-@minY)/(@maxY - @minY)*@viewBoxDim.height + @viewBoxDim.y

  drawAnc: ->
    @svg.selectAll('.anc')
             .data(@data.pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('cx', (d) -> d.x)
             .attr('cy', (d) -> d.y)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)

  drawLabs: ->
    labels_svg = @svg.selectAll('.label')
             .data(@data.lab)
             .enter()
             .append('text')
             .attr('class', 'init-labs')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.text)
             .attr('text-anchor', 'middle')
             .attr('fill', (d) -> d.color)

    i = 0
    while i < @data.len
      @data.lab[i].width = labels_svg[0][i].getBBox().width
      @data.lab[i].height = labels_svg[0][i].getBBox().height
      i++


    labeler = d3.labeler()
                .svg(@svg)
                .w1(@viewBoxDim.x)
                .w2(@viewBoxDim.x + @viewBoxDim.width)
                .h1(@viewBoxDim.y)
                .h2(@viewBoxDim.y + @viewBoxDim.height)
                .anchor(@data.anc)
                .label(@data.lab)
                .start(500)

    labels_svg.transition()
              .duration(800)
              .attr('x', (d) -> d.x)
              .attr('y', (d) -> d.y)

    @drawLinks()

  drawLinks: ->
    # calc the links from anc to label text if ambiguous
    newPtOnLabelBorder = (label, anchor, anchor_array) ->
      labelBorder =
        botL: [label.x - label.width/2,     label.y]
        botC: [label.x,                     label.y]
        botR: [label.x + label.width/2,     label.y]
        topL: [label.x - label.width/2,     label.y - label.height + 8]
        topC: [label.x,                     label.y - label.height + 8]
        topR: [label.x + label.width/2,     label.y - label.height + 8]
        midL: [label.x - label.width/2,     label.y - label.height/2]
        midR: [label.x + label.width/2,     label.y - label.height/2]

      padding = 10
      centered = (anchor.x > label.x - label.width/2) and (anchor.x < label.x + label.width/2)
      paddedCenter = (anchor.x > label.x - label.width/2 - padding) and (anchor.x < label.x + label.width/2 + padding)
      abovePadded = anchor.y < label.y - label.height - padding
      above = anchor.y < label.y - label.height
      aboveMid = anchor.y < label.y - label.height/2
      belowPadded = anchor.y > label.y + padding
      below = anchor.y > label.y
      belowMid = anchor.y >= label.y - label.height/2
      left = anchor.x < label.x - label.width/2
      right = anchor.x > label.x + label.width/2
      leftPadded = anchor.x < label.x - label.width/2 - padding
      rightPadded = anchor.x > label.x + label.width/2 + padding

      if centered and abovePadded
        return labelBorder.topC
      else if centered and belowPadded
        return labelBorder.botC
      else if above and left
        return labelBorder.topL
      else if above and right
        return labelBorder.topR
      else if below and left
        return labelBorder.botL
      else if below and right
        return labelBorder.botR
      else if leftPadded
        return labelBorder.midL
      else if rightPadded
        return labelBorder.midR
      else
        # Draw the link if there are any anc nearby
        ambiguityFactor = 10
        padL = labelBorder.topL[0] - ambiguityFactor
        padR = labelBorder.topR[0] + ambiguityFactor
        padT = labelBorder.topL[1] - ambiguityFactor
        padB = labelBorder.botR[1] + ambiguityFactor
        ancNearby = 0
        for a in anchor_array
          if (a.x > padL and a.x < padR) and (a.y > padT and a.y < padB)
            ancNearby++
        if ancNearby > 1
          if not left and not right and not above and not below
            return labelBorder.botC
          else if centered and above
            return labelBorder.topC
          else if centered and below
            return labelBorder.botC
          else if left and above
            return labelBorder.topL
          else if left and below
            return labelBorder.botL
          else if right and above
            return labelBorder.topR
          else if right and below
            return labelBorder.botR
          else if left
            return labelBorder.midL
          else if right
            return labelBorder.midR

    @links = []
    i = 0
    while i < @data.len
      newLinkPt = newPtOnLabelBorder @data.lab[i], @data.anc[i], @data.pts
      @links.push({
        x1: @data.anc[i].x
        y1: @data.anc[i].y
        x2: newLinkPt[0]
        y2: newLinkPt[1]
        width: 1
      }) if newLinkPt?
      i++

    @svg.selectAll('.link')
             .data(@links)
             .enter()
             .append('line')
             .attr('x1', (d) -> d.x1)
             .attr('y1', (d) -> d.y1)
             .attr('x2', (d) -> d.x2)
             .attr('y2', (d) -> d.y2)
             .attr('stroke-width', (d) -> d.width)
             .attr('stroke', 'gray')
