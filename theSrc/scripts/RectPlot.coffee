
class RectPlot
  constructor: (@width,
                @height,
                @X,
                @Y,
                @Z,
                @group,
                @label,
                @svg,
                fixedRatio,
                xTitle,
                yTitle,
                title,
                @colors,
                grid,
                origin,
                @originAlign,
                titleFontFamily,
                titleFontSize,
                titleFontColor,
                xTitleFontFamily,
                xTitleFontSize,
                xTitleFontColor,
                yTitleFontFamily,
                yTitleFontSize,
                yTitleFontColor,
                labelsFontFamily,
                labelsFontSize,
                labelsFontColor,
                @xDecimals,
                @yDecimals,
                @xPrefix,
                @yPrefix,
                @legendShow,
                @legendFontFamily,
                @legendFontSize,
                @legendFontColor,
                @axisFontFamily,
                @axisFontColor,
                @axisFontSize,
                @pointRadius = 2) ->

    @labelsFont =
      size:            labelsFontSize
      color:           labelsFontColor
      family:          labelsFontFamily

    @xTitle =
      text:       xTitle
      textHeight: xTitleFontSize
      fontFamily: xTitleFontFamily
      fontSize:   xTitleFontSize
      fontColor:  xTitleFontColor
    @xTitle.textHeight = 0 if @xTitle.text is ''

    @yTitle =
      text:       yTitle
      textHeight: yTitleFontSize
      fontFamily: yTitleFontFamily
      fontSize:   yTitleFontSize
      fontColor:  yTitleFontColor
    @yTitle.textHeight = 0 if @yTitle.text is ''

    @axisLeaderLineLength = 5
    @axisDimensionTextHeight = 0 # This is set later
    @axisDimensionTextWidth = 0  # This is set later
    @verticalPadding = 5
    @horizontalPadding = 5

    @title =
      text:         title
      color:        titleFontColor
      anchor:       'middle'
      fontSize:     titleFontSize
      fontWeight:   'bold'
      fontFamily:   titleFontFamily

    if @title.text is ''
      @title.textHeight = 0
      @title.paddingBot = 0
    else
      @title.textHeight = titleFontSize
      @title.paddingBot = 10

    @title.y = @verticalPadding + @title.textHeight

    @grid = if grid? then grid else true
    @origin = if origin? then origin else true
    @fixedRatio = if fixedRatio? then fixedRatio else true

    unless @label?
      @label = []
      for x in @X
        @label.push ''
      @showLabels = false
    else
      @showLabels = true

    @setDim(@svg, @width, @height)

  draw: ->
    @drawTitle()
    @drawLabs(@) unless @Z?
    @drawLegend(@, @data)
    @drawDraggedMarkers(@data)
    @drawRect()
    @drawDimensionMarkers()
    @drawAxisLabels()
    @drawAnc(@data)

  setDim: (svg, width, height) ->
    @svg = svg
    @title.x = width/2
    @legendDim =
      width:          0  #init value
      heightOfRow:    @legendFontSize + 9 #init val
      rightPadding:   @legendFontSize / 1.6
      leftPadding:    @legendFontSize / 0.8
      centerPadding:  @legendFontSize / 0.53
      ptRadius:       @legendFontSize / 2.67
      ptToTextSpace:  @legendFontSize
      vertPtPadding:  5
      cols:           1
      markerLen:      5
      markerWidth:    1
      markerTextSize: 10
      markerCharWidth:4

    @viewBoxDim =
      svgWidth:           width
      svgHeight:          height
      width:              width - @legendDim.width - @horizontalPadding*3 - @axisLeaderLineLength - @axisDimensionTextWidth - @yTitle.textHeight
      height:             height - @verticalPadding*2 - @title.textHeight - @title.paddingBot - @axisDimensionTextHeight - @xTitle.textHeight - @axisLeaderLineLength
      x:                  @horizontalPadding*2 + @axisDimensionTextWidth + @axisLeaderLineLength + @yTitle.textHeight
      y:                  @verticalPadding + @title.textHeight + @title.paddingBot
      labelFontSize:      @labelsFont.size
      labelSmallFontSize: @labelsFont.size * 0.75
      labelFontColor:     @labelsFont.color
      labelFontFamily:    @labelsFont.family

    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width
    @title.x = @viewBoxDim.x + @viewBoxDim.width/2

    @data = new PlotData(@X,
                         @Y,
                         @Z,
                         @group,
                         @label,
                         @viewBoxDim,
                         @legendDim,
                         @colors,
                         @fixedRatio,
                         @originAlign,
                         @pointRadius)

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
    @title.x = @viewBoxDim.x + @viewBoxDim.width/2
    @draw()

  drawTitle: ->
    if @title.text != ''
      @svg.selectAll('.plot-title').remove()
      @svg.append('text')
          .attr('class', 'plot-title')
          .attr('font-family', @title.fontFamily)
          .attr('x', @title.x)
          .attr('y', @title.y)
          .attr('text-anchor', @title.anchor)
          .attr('fill', @title.color)
          .attr('font-size', @title.fontSize)
          .attr('font-weight', @title.fontWeight)
          .text(@title.text)

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
      x = Math.ceil(Math.log(unroundedTickSize)/Math.LN10-1)
      pow10x = Math.pow(10, x)
      roundedTickRange = Math.ceil(unroundedTickSize / pow10x) * pow10x
      roundedTickRange

    between = (num, min, max) ->
      num >= min and num <= max

    pushDimensionMarker = (type, x1, y1, x2, y2, label, leaderLineLen, labelHeight, xDecimals, yDecimals, xPrefix, yPrefix) ->
      if type == 'c'
        dimensionMarkerLeaderStack.push({x1: x1, y1: y2, x2: x1, y2: y2 + leaderLineLen})
        dimensionMarkerLabelStack.push({x: x1, y: y2 + leaderLineLen + labelHeight, label: xPrefix + label.toFixed(xDecimals), anchor: 'middle'})
      if type == 'r'
        dimensionMarkerLeaderStack.push({x1: x1 - leaderLineLen, y1: y1, x2: x1, y2: y2})
        dimensionMarkerLabelStack.push({x: x1 - leaderLineLen, y: y2 + labelHeight/3, label: yPrefix + label.toFixed(yDecimals), anchor: 'end'})

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
    pushDimensionMarker 'r', oax.x1, oax.y1, oax.x2, oax.y2, 0, @axisLeaderLineLength, @axisDimensionTextHeight, @xDecimals, @yDecimals, @xPrefix, @yPrefix
    originAxis.push(oax) unless (@data.minY is 0) or (@data.maxY is 0)

    oay = {
      x1: normalizeXCoords 0
      y1: @viewBoxDim.y
      x2: normalizeXCoords 0
      y2: @viewBoxDim.y + @viewBoxDim.height
    }
    pushDimensionMarker 'c', oay.x1, oay.y1, oay.x2, oay.y2, 0, @axisLeaderLineLength, @axisDimensionTextHeight, @xDecimals, @yDecimals, @xPrefix, @yPrefix
    originAxis.push(oay) unless (@data.minX is 0) or (@data.maxX is 0)

    #calculate number of dimension markers
    colsPositive = 0
    colsNegative = 0
    i = if between(0, @data.minX, @data.maxX) then ticksX else @data.minX
    while between(i, @data.minX, @data.maxX) or between(-i, @data.minX, @data.maxX)
      colsPositive++ if between(i, @data.minX, @data.maxX)
      colsNegative++ if between(-i, @data.minX, @data.maxX)
      i += ticksX

    rowsPositive = 0
    rowsNegative = 0
    i = if between(0, @data.minY, @data.maxY) then ticksY else @data.minY
    while between(i, @data.minY, @data.maxY) or between(-i, @data.minY, @data.maxY)
      rowsNegative++ if between(i, @data.minY, @data.maxY) # y axis inversed svg
      rowsPositive++ if between(-i, @data.minY, @data.maxY)
      i += ticksY

    i = 0
    while i < Math.max(colsPositive, colsNegative)
      if i < colsPositive
        val = (i+1)*ticksX
        if not between(0, @data.minX, @data.maxX)
          val = @data.minX + i*ticksX
        x1 = normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = normalizeXCoords val
        y2 = @viewBoxDim.y + @viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val, @axisLeaderLineLength, @axisDimensionTextHeight, @xDecimals, @yDecimals, @xPrefix, @yPrefix

      if i < colsNegative
        val = -(i+1)*ticksX
        x1 = normalizeXCoords val
        y1 = @viewBoxDim.y
        x2 = normalizeXCoords val
        y2 = @viewBoxDim.y + @viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val, @axisLeaderLineLength, @axisDimensionTextHeight, @xDecimals, @yDecimals, @xPrefix, @yPrefix
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
          pushDimensionMarker 'r', x1, y1, x2, y2, val, @axisLeaderLineLength, @axisDimensionTextHeight, @xDecimals, @yDecimals, @xPrefix, @yPrefix

      if i < rowsNegative
        val = (i+1)*ticksY
        if not between(0, @data.minY, @data.maxY)
          val = @data.minY + i*ticksY
        x1 = @viewBoxDim.x
        y1 = normalizeYCoords val
        x2 = @viewBoxDim.x + @viewBoxDim.width
        y2 = normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val, @axisLeaderLineLength, @axisDimensionTextHeight, @xDecimals, @yDecimals, @xPrefix, @yPrefix
      i++

    if @grid
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
          .attr('stroke-width', 0.2)
          .attr('stroke', 'grey')
      if @origin
        @svg.selectAll('.origin')
            .style('stroke-dasharray', ('4, 6'))
            .attr('stroke-width', 1)
            .attr('stroke', 'black')

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


    else if not @grid and @origin
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
          .style('stroke-dasharray', ('4, 6'))
          .attr('stroke-width', 1)
          .attr('stroke', 'black')


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
    ml = @svg.selectAll('.dim-marker-label')
             .data(dimensionMarkerLabelStack)
             .enter()
             .append('text')
             .attr('class', 'dim-marker-label')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', @axisFontFamily)
             .attr('fill', @axisFontColor)
             .attr('font-size', @axisFontSize)
             .text((d) -> d.label)
             .attr('text-anchor', (d) -> d.anchor)

    # Figure out the max width of the yaxis dimensional labels
    @maxTextWidthOfDimensionMarkerLabels = 0
    initWidth = @axisDimensionTextWidth
    initHeight = @axisDimensionTextHeight
    i = 0
    while i < ml[0].length
      bb = ml[0][i].getBBox()
      if @axisDimensionTextWidth < bb.width
        @axisDimensionTextWidth = bb.width
      if @axisDimensionTextHeight < bb.height
        @axisDimensionTextHeight = bb.height

      i++

    if initWidth != @axisDimensionTextWidth or initHeight != @axisDimensionTextHeight
      @setDim(@svg, @width, @height)
      @draw()

  drawAxisLabels: ->
    axisLabels = [
      { # x axis label
        x: @viewBoxDim.x + @viewBoxDim.width/2
        y: @viewBoxDim.y + @viewBoxDim.height +
           @axisLeaderLineLength +
           @axisDimensionTextHeight +
           @xTitle.textHeight
        text: @xTitle.text
        anchor: 'middle'
        transform: 'rotate(0)'
        display: if @xTitle is '' then 'none' else ''
        fontFamily: @xTitle.fontFamily
        fontSize: @xTitle.fontSize
        fontColor: @xTitle.fontColor
      },
      { # y axis label
        x: @horizontalPadding + @yTitle.textHeight
        y: @viewBoxDim.y + @viewBoxDim.height/2
        text: @yTitle.text
        anchor: 'middle'
        transform: 'rotate(270,'+(@horizontalPadding+@yTitle.textHeight) + ', ' + (@viewBoxDim.y + @viewBoxDim.height/2)+ ')'
        display: if @yTitle is '' then 'none' else ''
        fontFamily: @yTitle.fontFamily
        fontSize: @yTitle.fontSize
        fontColor: @yTitle.fontColor
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
             .attr('font-family', (d) -> d.fontFamily)
             .attr('font-size', (d) -> d.fontSize)
             .attr('fill', (d) -> d.fontColor)
             .attr('text-anchor', (d) -> d.anchor)
             .attr('transform', (d) -> d.transform)
             .text((d) -> d.text)
             .style('font-weight', 'bold')
             .style('display', (d) -> d.display)

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

    legendLabelDragAndDrop = (plot, data) ->
      dragStart = ->

      dragMove = ->
        d3.select(this)
        .attr('x', d3.select(this).x = d3.event.x)
        .attr('y', d3.select(this).y = d3.event.y)

        # Save the new location of text so links can be redrawn
        id = d3.select(this).attr('id').split('legend-')[1]
        legendPt = _.find data.legendPts, (l) -> l.id == Number(id)
        legendPt.lab.x = d3.event.x
        legendPt.lab.y = d3.event.y

      dragEnd = ->
        id = Number(d3.select(this).attr('id').split('legend-')[1])
        legendPt = _.find data.legendPts, (l) -> l.id == Number(id)
        if plot.data.isLegendPtOutsideViewBox(legendPt.lab)
          d3.select(this)
            .attr('x', d3.select(this).x = legendPt.x)
            .attr('y', d3.select(this).y = legendPt.y)
        else
          plot.elemDraggedOnPlot(plot, data, id)


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

    if @legendShow
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
               .attr('font-family', @legendFontFamily)
               .attr('fill', @legendFontColor)
               .attr('font-size', @legendFontSize)
               .text((d) -> d.text)
               .attr('text-anchor', (d) -> d.anchor)

      drag = legendLabelDragAndDrop(plot, data)
      @svg.selectAll('.legend-dragged-pts-text').remove()
      @svg.selectAll('.legend-dragged-pts-text')
               .data(data.legendPts)
               .enter()
               .append('text')
               .attr('class', 'legend-dragged-pts-text')
               .attr('id', (d) -> "legend-#{d.id}")
               .attr('x', (d) -> d.x)
               .attr('y', (d) -> d.y)
               .attr('font-family', @legendFontFamily)
               .attr('font-size', @legendFontSize)
               .attr('text-anchor', (d) -> d.anchor)
               .attr('fill', (d) -> d.color)
               .text((d) -> if d.markerId? then getSuperscript(d.markerId+1) + d.text else d.text)
               .call(drag)

      legendGroupsLab = @svg.selectAll('.legend-groups-text')
      legendDraggedPtsLab = @svg.selectAll('.legend-dragged-pts-text')

      i = 0
      while i < data.legendGroups.length
        data.legendGroups[i].width = legendGroupsLab[0][i].getBBox().width
        data.legendGroups[i].height = legendGroupsLab[0][i].getBBox().height
        i++

      i = 0
      while i < data.legendPts.length
        data.legendPts[i].width = legendDraggedPtsLab[0][i].getBBox().width
        data.legendPts[i].height = legendDraggedPtsLab[0][i].getBBox().height
        i++

      if data.resizedAfterLegendGroupsDrawn()
        console.log 'Legend resize triggered'
        plot.redraw(data, @viewBoxDim.svgWidth, @viewBoxDim.svgHeight)

  drawAnc: (data) ->
    @svg.selectAll('.anc').remove()
    anc = @svg.selectAll('.anc')
             .data(data.pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('cx', (d) -> d.x)
             .attr('cy', (d) -> d.y)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)
             .attr('fill-opacity', (d) -> d.fillOpacity)
    if @Z?
      anc.append('title')
         .text((d) -> "#{d.label}\n#{d.labelZ}\n#{d.group}\n[#{d.labelX}, #{d.labelY}]")
    else
      anc.append('title')
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
    plot.resetPlotAfterDragEvent(plot, data)

  elemDraggedOnPlot: (plot, data, id) ->
    data.removeElemFromLegend(id, data)
    plot.resetPlotAfterDragEvent(plot, data)

  resetPlotAfterDragEvent: (plot, data) ->
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

    if @showLabels
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
               .attr('font-family', (d) -> d.fontFamily)
               .text((d) -> d.text)
               .attr('text-anchor', 'middle')
               .attr('fill', (d) -> d.color)
               .attr('font-size', (d) -> d.fontSize)
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
                  .anchor(plot.data.pts)
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
      newLinkPt = newPtOnLabelBorder data.lab[i], data.pts[i], data.pts
      links.push({
        x1: data.pts[i].x
        y1: data.pts[i].y
        x2: newLinkPt[0]
        y2: newLinkPt[1]
        width: 1
        color: data.pts[i].color
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
             .attr('stroke', (d) -> d.color)
             .style('stroke-opacity', 0.7)
