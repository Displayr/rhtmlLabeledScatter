class RectPlot
  constructor: (width, height, X, Y, group, label, svg, fixedRatio) ->
    @svg = svg

    @yAxisPadding = 50
    @xAxisPadding = 40

    @legendDim =
      width:          300 #init value
      heightOfRow:    25 #init val
      rightPadding:   10
      leftPadding:    30
      centerPadding:  30
      ptRadius:       6
      ptMovedRadius:  2
      ptToTextSpace:  15
      yPtOffset:      4
      cols:           1
      markerLen:      5
      markerWidth:    1
      markerTextSize: 10
      markerCharWidth:4

    @viewBoxDim =
      svgWidth: width
      svgHeight: height
      width: width - @legendDim.width
      height: height - @xAxisPadding - 20
      x: @yAxisPadding + 25
      y: 15

    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width

    fixedRatio = true unless fixedRatio?
    # colors set to null here
    @data = new PlotData(X, Y, group, label,@viewBoxDim, @legendDim, null, fixedRatio)

  draw: ->
    @drawLabs(@)
    @drawLegend(@, @data)
    @drawDraggedMarkers(@data)
    @drawRect(@svg, @viewBoxDim)
    @drawDimensionMarkers()
    @drawAxisLabels(@svg, @viewBoxDim, @xAxisPadding, @yAxisPadding)
    @drawAnc(@data)

  redraw: (data) ->
    plotElems = [
      '.plot-viewbox'
      '.origin'
      '.dim-marker'
      '.dim-marker-leader'
      '.dim-marker-label'
      '.axis-label'
      '.legend-pts'
      '.legend-text'
      '.anc'
      '.lab'
      '.link'
    ]
    for elem in plotElems
      @svg.selectAll(elem).remove()
    data.normalizeData(data)
    data.calcDataArrays()
    @draw()

  drawRect: ->
    @svg.selectAll('.plot-viewbox').remove()
    @svg.append('rect')
      .attr('class', 'plot-viewbox')
      .attr('x', @viewBoxDim.x)
      .attr('y', @viewBoxDim.y)
      .attr('width', @viewBoxDim.width)
      .attr('height', @viewBoxDim.height)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')

  drawDimensionMarkers: ->
    data = @data
    viewBoxDim = @viewBoxDim

    return unless data.len > 0 # if all points have been dragged off plot

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

    normalizeXCoords = (Xcoord) ->
      (Xcoord-data.minX)/(data.maxX - data.minX)*viewBoxDim.width + viewBoxDim.x

    normalizeYCoords = (Ycoord) ->
      -(Ycoord-data.minY)/(data.maxY - data.minY)*viewBoxDim.height + viewBoxDim.y + viewBoxDim.height

    dimensionMarkerStack = []
    dimensionMarkerLeaderStack = []
    dimensionMarkerLabelStack = []

    ticksX = getTickRange(@data.maxX, @data.minX)
    ticksY = getTickRange(@data.maxY, @data.minY)

    originAxis = []
    oax = {
      x1: @viewBoxDim.x
      y1: normalizeYCoords 0
      x2: @viewBoxDim.x + @viewBoxDim.width
      y2: normalizeYCoords 0
    }
    pushDimensionMarker 'r', oax.x1, oax.y1, oax.x2, oax.y2, 0
    originAxis.push(oax) unless (@data.minY is 0) or (@data.maxY is 0)

    oay = {
      x1: normalizeXCoords 0
      y1: @viewBoxDim.y
      x2: normalizeXCoords 0
      y2: @viewBoxDim.y + @viewBoxDim.height
    }
    pushDimensionMarker 'c', oay.x1, oay.y1, oay.x2, oay.y2, 0
    originAxis.push(oay) unless (@data.minX is 0) or (@data.maxX is 0)

    @svg.selectAll('.origin').remove()
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
    while between(i, @data.minX, @data.maxX) or between(-i, @data.minX, @data.maxX)
      colsPositive++ if between(i, @data.minX, @data.maxX)
      colsNegative++ if between(-i, @data.minX, @data.maxX)
      i += ticksX

    rowsPositive = 0
    rowsNegative = 0
    i = ticksY
    while between(i, @data.minY, @data.maxY) or between(-i, @data.minY, @data.maxY)
      rowsNegative++ if between(i, @data.minY, @data.maxY) # y axis inversed svg
      rowsPositive++ if between(-i, @data.minY, @data.maxY)
      i += ticksY


    i = 0
    while i < Math.max(colsPositive, colsNegative)
      if i < colsPositive
        val = (i+1)*ticksX
        x1 = normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = normalizeXCoords val
        y2 = @viewBoxDim.y + @viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val

      if i < colsNegative
        val = -(i+1)*ticksX
        x1 = normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = normalizeXCoords val
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
        y1 = normalizeYCoords val
        x2 = @viewBoxDim.x + @viewBoxDim.width
        y2 = normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      if i < rowsNegative
        val = (i+1)*ticksY
        x1 = @viewBoxDim.x
        y1 = normalizeYCoords val
        x2 = @viewBoxDim.x + @viewBoxDim.width
        y2 = normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      i++

    @svg.selectAll('.dim-marker').remove()
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

    @svg.selectAll('.dim-marker-leader').remove()
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

    @svg.selectAll('.dim-marker-label').remove()
    @svg.selectAll('.dim-marker-label')
             .data(dimensionMarkerLabelStack)
             .enter()
             .append('text')
             .attr('class', 'dim-marker-label')
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

    @svg.selectAll('.axis-label').remove()
    @svg.selectAll('.axis-label')
             .data(axisLabels)
             .enter()
             .append('text')
             .attr('class', 'axis-label')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial')
             .attr('text-anchor', (d) -> d.anchor)
             .attr('transform', (d) -> d.transform)
             .text((d) -> d.text)
             .style('font-weight', 'bold')

  drawLegend: (plot, data)->
    data.setupLegendGroupsAndPts(data)

    superscript = '⁰¹²³⁴⁵⁶⁷⁸⁹'
    getSuperscript = (id) ->
      ss = ''
      while id > 0
        digit = id % 10
        ss = superscript[id % 10] + ss
        id = (id - digit)/10
      ss

    @svg.selectAll('.legend-groups-pts').remove()
    @svg.selectAll('.legend-groups-pts')
             .data(data.legendGroups)
             .enter()
             .append('circle')
             .attr('class', 'legend-groups-pts')
             .attr('cx', (d) -> d.cx)
             .attr('cy', (d) -> d.cy)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)
             .attr('stroke', (d) -> d.stroke)
             .attr('stroke-opacity', (d) -> d['stroke-opacity'])

    @svg.selectAll('.legend-groups-text').remove()
    @svg.selectAll('.legend-groups-text')
             .data(data.legendGroups)
             .enter()
             .append('text')
             .attr('class', 'legend-groups-text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial')
             .text((d) -> d.text)
             .attr('text-anchor', (d) -> d.anchor)

    @svg.selectAll('.legend-pts-pts').remove()
    @svg.selectAll('.legend-pts-pts')
             .data(data.legendPts)
             .enter()
             .append('circle')
             .attr('class', 'legend-pts-pts')
             .attr('cx', (d) -> d.cx)
             .attr('cy', (d) -> d.cy - d.yOffset)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)

    @svg.selectAll('.legend-pts-text').remove()
    @svg.selectAll('.legend-pts-text')
             .data(data.legendPts)
             .enter()
             .append('text')
             .attr('class', 'legend-pts-text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial')
             .attr('text-anchor', (d) -> d.anchor)
             .attr('fill', (d) -> d.color)
             .text((d) -> if d.markerId? then getSuperscript(d.markerId+1) + d.text else d.text)

    legendGroupsLab = @svg.selectAll('.legend-groups-text')
    legendPtsLab = @svg.selectAll('.legend-pts-text')

    i = 0
    while i < data.legendGroups.length
      data.legendGroups[i].width = legendGroupsLab[0][i].getBBox().width
      data.legendGroups[i].height = legendGroupsLab[0][i].getBBox().height
      i++

    i = 0
    while i < data.legendPts.length
      data.legendPts[i].width = legendPtsLab[0][i].getBBox().width
      data.legendPts[i].height = legendPtsLab[0][i].getBBox().height
      i++

    if data.resizedAfterLegendGroupsDrawn()
      console.log 'Legend resize triggered'
      plot.redraw(data)
      plot.drawLegend(plot, data)

  drawAnc: (data) ->
    @svg.selectAll('.anc').remove()
    @svg.selectAll('.anc')
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

  drawDraggedMarkers: (data) ->
    @svg.selectAll('.marker').remove()
    @svg.selectAll('.marker')
        .data(data.draggedOutMarkers)
        .enter()
        .append('line')
        .attr('class', 'marker')
        .attr('x1', (d) -> d.x1)
        .attr('y1', (d) -> d.y1)
        .attr('x2', (d) -> d.x2)
        .attr('y2', (d) -> d.y2)
        .attr('stroke-width', (d) -> d.width)
        .attr('stroke', (d) -> d.color)

    @svg.selectAll('.marker-label').remove()
    @svg.selectAll('.marker-label')
        .data(data.draggedOutMarkers)
        .enter()
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', (d) -> d.markerTextX)
        .attr('y', (d) -> d.markerTextY)
        .attr('font-family', 'Arial')
        .attr('text-anchor', 'start')
        .attr('font-size', data.legendDim.markerTextSize)
        .attr('fill', (d) -> d.color)
        .text((d) -> d.markerLabel)

  elemDraggedOffPlot: (plot, data, id) ->
    data.moveElemToLegend(id, data)
    plot.drawRect()
    plot.drawAxisLabels()
    plot.drawDimensionMarkers()
    plot.drawAnc(data)
    plot.drawLabs(plot)
    plot.drawDraggedMarkers(data)
    plot.drawLegend(plot, data)

  drawLabs: (plot) ->
    labelDragAndDrop = ->
      dragStart = () ->
        plot.svg.selectAll('.link').remove()

      dragMove = () ->
        d3.select(this)
        .attr('x', d3.select(this).x = d3.event.x)
        .attr('y', d3.select(this).y = d3.event.y)

        # Save the new location of text so links can be redrawn
        id = d3.select(this).attr('id')
        label = _.find plot.data.lab, (l) -> l.id == Number(id)
        label.x = d3.event.x
        label.y = d3.event.y

      dragEnd = ->
        # If label is dragged out of viewBox, remove the lab and add to legend
        id = Number(d3.select(this).attr('id'))
        lab = _.find plot.data.lab, (l) -> l.id == id
        if plot.data.isOutsideViewBox(lab)
          plot.elemDraggedOffPlot(plot, plot.data, id)
        else
          plot.drawLinks(plot.svg, plot.data)

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

    drag = labelDragAndDrop()
    plot.svg.selectAll('.lab').remove()
    plot.svg.selectAll('.lab')
             .data(plot.data.lab)
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

    labels_svg = plot.svg.selectAll('.lab')
    i = 0
    while i < plot.data.len
      plot.data.lab[i].width = labels_svg[0][i].getBBox().width
      plot.data.lab[i].height = labels_svg[0][i].getBBox().height
      i++

    labeler = d3.labeler()
                .svg(plot.svg)
                .w1(plot.viewBoxDim.x)
                .w2(plot.viewBoxDim.x + plot.viewBoxDim.width)
                .h1(plot.viewBoxDim.y)
                .h2(plot.viewBoxDim.y + plot.viewBoxDim.height)
                .anchor(plot.data.anc)
                .label(plot.data.lab)
                .start(500)

    labels_svg.transition()
              .duration(800)
              .attr('x', (d) -> d.x)
              .attr('y', (d) -> d.y)

    plot.drawLinks(plot.svg, plot.data)

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
