class RectPlot
  constructor: (width, height, X, Y, group, label, svg) ->
    @svg = svg

    @yAxisPadding = 50
    @xAxisPadding = 40

    @viewBoxDim =
      width: width - 200
      height: height - @xAxisPadding - 20
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    @viewBoxDim['x'] = @yAxisPadding + 25
    @viewBoxDim['y'] = 10

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
    @drawAnc(@svg, @data)
    @drawLabs(@svg, @data, @drawAnc, @viewBoxDim, @drawLinks, @drawLabs)
    @drawLegend()

  drawDimensionMarkers: ->
    # Calc tick increments - http://stackoverflow.com/questions/326679/choosing-an-attractive-linear-scale-for-a-graphs-y-axis
    getTickRange = (max, min) ->
      maxTicks = 8
      range = max - min
      unroundedTickSize = range/(maxTicks-1)
      x = Math.ceil(Math.log10(unroundedTickSize)-1)
      pow10x = Math.pow(10, x)
      roundedTickRange = Math.ceil(unroundedTickSize / pow10x) * pow10x
      roundedTickRange

    between = (num, min, max) ->
      num > min and num < max

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

    dimensionMarkerStack = []
    dimensionMarkerLeaderStack = []
    dimensionMarkerLabelStack = []

    ticksX = getTickRange(@maxX, @minX)
    ticksY = getTickRange(@maxY, @minY)

    originAxis = []
    oax = {
      x1: @viewBoxDim.x
      y1: @_normalizeYCoords 0
      x2: @viewBoxDim.x + @viewBoxDim.width
      y2: @_normalizeYCoords 0
    }
    pushDimensionMarker 'r', oax.x1, oax.y1, oax.x2, oax.y2, 0
    originAxis.push(oax) unless (@minY is 0) or (@maxY is 0)

    oay = {
      x1: @_normalizeXCoords 0
      y1: @viewBoxDim.y
      x2: @_normalizeXCoords 0
      y2: @viewBoxDim.y + @viewBoxDim.height
    }
    pushDimensionMarker 'c', oay.x1, oay.y1, oay.x2, oay.y2, 0
    originAxis.push(oay) unless (@minX is 0) or (@maxX is 0)


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
        .style('stroke-dasharray', ('4, 6'))

    #calculate number of dimension markers
    colsPositive = 0
    colsNegative = 0
    i = ticksX
    while between(i, @minX, @maxX) or between(-i, @minX, @maxX)
      colsPositive++ if between(i, @minX, @maxX)
      colsNegative++ if between(-i, @minX, @maxX)
      i += ticksX

    rowsPositive = 0
    rowsNegative = 0
    i = ticksY
    while between(i, @minY, @maxY) or between(-i, @minY, @maxY)
      rowsNegative++ if between(i, @minY, @maxY) # y axis inversed svg
      rowsPositive++ if between(-i, @minY, @maxY)
      i += ticksY


    i = 0
    while i < Math.max(colsPositive, colsNegative)
      if i < colsPositive
        val = (i+1)*ticksX
        x1 = @_normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = @_normalizeXCoords val
        y2 = @viewBoxDim.y + @viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val

      if i < colsNegative
        val = -(i+1)*ticksX
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
        val = -(i+1)*ticksY
        x1 = @viewBoxDim.x
        y1 = @_normalizeYCoords val
        x2 = @viewBoxDim.x + @viewBoxDim.width
        y2 = @_normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      if i < rowsNegative
        val = (i+1)*ticksY
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
             .attr('font-family', 'Arial')
             .text((d) -> d.label)
             .attr('text-anchor', (d) -> d.anchor)

  drawAxisLabels: ->
    axisLabels = [
      { # x axis label
        x: @viewBoxDim.x + @viewBoxDim.width/2
        y: @viewBoxDim.y + @viewBoxDim.height + @xAxisPadding
        text: 'Dimension 1 (64%)'
        anchor: 'middle'
        transform: 'rotate(0)'
      },
      { # y axis label
        x: @viewBoxDim.x - @yAxisPadding
        y: @viewBoxDim.y + @viewBoxDim.height/2
        text: 'Dimension 2 (24%)'
        anchor: 'middle'
        transform: 'rotate(270,'+(@viewBoxDim.x-@yAxisPadding) + ', ' + (@viewBoxDim.y + @viewBoxDim.height/2)+ ')'
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
             .attr('font-family', 'Arial')
             .text((d) -> d.text)
             .attr('text-anchor', (d) -> d.anchor)

  _normalizeXCoords: (Xcoord) ->
    (Xcoord-@minX)/(@maxX - @minX)*@viewBoxDim.width + @viewBoxDim.x

  _normalizeYCoords: (Ycoord) ->
    -(Ycoord-@minY)/(@maxY - @minY)*@viewBoxDim.height + @viewBoxDim.y + @viewBoxDim.height

  drawAnc: (svg, data) ->
    svg.selectAll('.anc')
             .data(data.pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('cx', (d) -> d.x)
             .attr('cy', (d) -> d.y)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)
             .append('title')
             .text((d) -> "#{d.label}\n#{d.group}\n[#{d.labelX}, #{d.labelY}]")

  drawLabs: (svg, data, drawAnc, viewBoxDim, drawLinks, drawLabs) ->
    labelDragAndDrop = (svg, drawLinks, data, drawLabs, drawAnc, viewBoxDim) ->
      dragStart = () ->
        svg.selectAll('.link').remove()

      dragMove = () ->
        d3.select(this)
        .attr('x', d3.select(this).x = d3.event.x)
        .attr('y', d3.select(this).y = d3.event.y)
        .attr('cursor', 'all-scroll')

        # Save the new location of text so links can be redrawn
        id = d3.select(this).attr('id')
        label = _.find data.lab, (l) -> l.id == Number(id)
        label.x = d3.event.x
        label.y = d3.event.y

      dragEnd = ->
        # If label is dragged out of viewBox, remove the lab and add to legend
        id = Number(d3.select(this).attr('id'))
        lab = _.find data.lab, (l) -> l.id == id
        if data.isOutsideViewBox(lab)
          data.moveElemToLegend(id)
          svg.selectAll('.lab').remove()
          svg.selectAll('.anc').remove()
          drawAnc(svg, data)
          drawLabs(svg, data, drawAnc, viewBoxDim, drawLinks, drawLabs)
        else
          drawLinks(svg, data)

      d3.behavior.drag()
               .origin(() ->
                 {
                   x: d3.select(this).attr("x")
                   y: d3.select(this).attr("y")
                 }
                )
               .on('dragstart', dragStart)
               .on('drag', dragMove)
               .on('dragend', dragEnd)

    drag = labelDragAndDrop(svg, drawLinks, data, drawLabs, drawAnc, viewBoxDim)
    svg.selectAll('.lab')
             .data(data.lab)
             .enter()
             .append('text')
             .attr('class', 'lab')
             .attr('id', (d) -> d.id)
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial')
             .text((d) -> d.text)
             .attr('text-anchor', 'middle')
             .attr('fill', (d) -> d.color)
             .call(drag)

    labels_svg = svg.selectAll('.lab')
    i = 0
    while i < data.len
      data.lab[i].width = labels_svg[0][i].getBBox().width
      data.lab[i].height = labels_svg[0][i].getBBox().height
      i++


    labeler = d3.labeler()
                .svg(svg)
                .w1(viewBoxDim.x)
                .w2(viewBoxDim.x + viewBoxDim.width)
                .h1(viewBoxDim.y)
                .h2(viewBoxDim.y + viewBoxDim.height)
                .anchor(data.anc)
                .label(data.lab)
                .start(500)

    labels_svg.transition()
              .duration(800)
              .attr('x', (d) -> d.x)
              .attr('y', (d) -> d.y)

    drawLinks(svg, data)

  drawLinks: (svg, data) ->
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

    links = []
    i = 0
    while i < data.len
      newLinkPt = newPtOnLabelBorder data.lab[i], data.anc[i], data.pts
      links.push({
        x1: data.anc[i].x
        y1: data.anc[i].y
        x2: newLinkPt[0]
        y2: newLinkPt[1]
        width: 1
      }) if newLinkPt?
      i++

    svg.selectAll('.link')
             .data(links)
             .enter()
             .append('line')
             .attr('class', 'link')
             .attr('x1', (d) -> d.x1)
             .attr('y1', (d) -> d.y1)
             .attr('x2', (d) -> d.x2)
             .attr('y2', (d) -> d.y2)
             .attr('stroke-width', (d) -> d.width)
             .attr('stroke', 'gray')
