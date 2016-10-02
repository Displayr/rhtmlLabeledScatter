
class RectPlot
  constructor: (stateObj,
                stateChangedCallback,
                @width,
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
                @zTitle = '',
                title,
                @colors,
                @transparency,
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
                @showLabels = true,
                labelsFontFamily,
                labelsFontSize,
                labelsFontColor,
                @xDecimals = null,
                @yDecimals = null,
                @zDecimals = null,
                @xPrefix = '',
                @yPrefix = '',
                @zPrefix = '',
                @xSuffix = '',
                @ySuffix = '',
                @zSuffix = '',
                @legendShow,
                @legendFontFamily,
                @legendFontSize,
                @legendFontColor,
                @axisFontFamily,
                @axisFontColor,
                @axisFontSize,
                @pointRadius = 2,
                xBoundsMinimum = null,
                xBoundsMaximum = null,
                yBoundsMinimum = null,
                yBoundsMaximum = null,
                @xBoundsUnitsMajor = null,
                @yBoundsUnitsMajor = null) ->

    @state = new State(stateObj, stateChangedCallback)

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
      topPadding: 5
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
    @axisDimensionTextRightPadding = 0 # Set later, for when axis markers labels protrude (VIS-146)
    @verticalPadding = 5
    @horizontalPadding = 10

    @bounds =
      xmin: xBoundsMinimum
      xmax: xBoundsMaximum
      ymin: yBoundsMinimum
      ymax: yBoundsMaximum

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
      @title.paddingBot = 20

    @title.y = @verticalPadding + @title.textHeight

    @grid = if grid? then grid else true
    @origin = if origin? then origin else true
    @fixedRatio = if fixedRatio? then fixedRatio else true

    unless @label?
      @label = []
      for x in @X
        @label.push ''
      @showLabels = false

    @setDim(@svg, @width, @height)

  setDim: (svg, width, height) =>
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
      width:              width - @legendDim.width - @horizontalPadding*3 - @axisLeaderLineLength - @axisDimensionTextWidth - @yTitle.textHeight - @axisDimensionTextRightPadding
      height:             height - @verticalPadding*2 - @title.textHeight - @title.paddingBot - @axisDimensionTextHeight - @xTitle.textHeight - @axisLeaderLineLength - @xTitle.topPadding
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
                         @pointRadius,
                         @bounds,
                         @transparency)

  drawLabsAndPlot: =>
    @data.normalizeData()
    @data.calcDataArrays()
    @title.x = @viewBoxDim.x + @viewBoxDim.width/2

    unless @state.isLegendPtsSynced(@data.outsidePlotPtsId)
      for pt in @state.getLegendPts()
        unless _.includes @data.outsidePlotPtsId, pt
          @data.moveElemToLegend(pt)

      for pt in @data.outsidePlotPtsId
        unless _.includes @state.getLegendPts(), pt
          @state.pushLegendPt pt
      console.log "rhtmlLabeledScatter: drawLabsAndPlot false"
      return false

    @drawTitle()
    @drawAnc()
    @drawLabs()
    @drawDraggedMarkers()
    @drawRect()
    @drawAxisLabels()
    return true

  draw: =>
    unless @drawDimensionMarkers() and @drawLegend() and @drawLabsAndPlot() # fails if any func == false
      console.log 'rhtmlLabeledScatter: redraw'
      # Redraw is needed
      @draw()
      return

  drawTitle: =>
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

  drawRect: =>
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

  drawDimensionMarkers: =>
    axisArrays = AxisUtils.get().getAxisDataArrays(@, @data, @viewBoxDim)

    if @grid
      @svg.selectAll('.origin').remove()
      @svg.selectAll('.origin')
          .data(axisArrays.gridOrigin)
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
               .data(axisArrays.gridLines)
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
          .data(axisArrays.gridOrigin)
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
             .data(axisArrays.axisLeader)
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
    markerLabels = @svg.selectAll('.dim-marker-label')
             .data(axisArrays.axisLeaderLabel)
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
    initAxisTextWidth = @axisDimensionTextWidth
    initAxisTextHeight = @axisDimensionTextHeight
    for markerLabel, i in markerLabels[0]
      bb = markerLabel.getBBox()
      if @axisDimensionTextWidth < bb.width
        @axisDimensionTextWidth = bb.width
      if @axisDimensionTextHeight < bb.height
        @axisDimensionTextHeight = bb.height
      if @width < bb.x + bb.width
        @axisDimensionTextRightPadding = bb.width/2

    if initAxisTextWidth != @axisDimensionTextWidth or
       initAxisTextHeight != @axisDimensionTextHeight
      @setDim(@svg, @width, @height)
      console.log "rhtmlLabeledScatter: drawDimensionMarkers fail"
      return false
    return true

  drawAxisLabels: =>
    axisLabels = [
      { # x axis label
        x: @viewBoxDim.x + @viewBoxDim.width/2
        y: @viewBoxDim.y + @viewBoxDim.height +
           @axisLeaderLineLength +
           @axisDimensionTextHeight +
           @xTitle.topPadding +
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

  drawLegend: =>
    @data.setupLegendGroupsAndPts()

    legendLabelDragAndDrop = =>
      plot = @
      data = @data
      dragStart = ->

      dragMove = ->
        d3.select(@)
        .attr('x', d3.select(@).x = d3.event.x)
        .attr('y', d3.select(@).y = d3.event.y)

        # Save the new location of text so links can be redrawn
        id = d3.select(@).attr('id').split('legend-')[1]
        legendPt = _.find data.legendPts, (l) -> l.id == Number(id)
        legendPt.lab.x = d3.event.x
        legendPt.lab.y = d3.event.y

      dragEnd = ->
        id = Number(d3.select(@).attr('id').split('legend-')[1])
        legendPt = _.find data.legendPts, (l) -> l.id == Number(id)
        if plot.data.isLegendPtOutsideViewBox(legendPt.lab)
          d3.select(@)
            .attr('x', d3.select(@).x = legendPt.x)
            .attr('y', d3.select(@).y = legendPt.y)
        else
          plot.elemDraggedOnPlot(id)


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
      if Utils.get().isArr(@Z)
        @svg.selectAll('.legend-bubbles').remove()
        @svg.selectAll('.legend-bubbles')
            .data(@data.legendBubbles)
            .enter()
            .append('circle')
            .attr('class', 'legend-bubbles')
            .attr('cx', (d) -> d.cx)
            .attr('cy', (d) -> d.cy)
            .attr('r', (d) -> d.r)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.5)

      @svg.selectAll('.legend-bubbles-labels').remove()
      @svg.selectAll('.legend-bubbles-labels')
          .data(@data.legendBubbles)
          .enter()
          .append('text')
          .attr('class', 'legend-bubbles-labels')
          .attr('x', (d) -> d.x)
          .attr('y', (d) -> d.y)
          .attr('text-anchor', 'middle')
          .attr('font-size', @legendFontSize)
          .attr('font-family', @legendFontFamily)
          .attr('fill', @legendFontColor)
          .text((d) -> d.text)

      if @zTitle != ''
        legendFontSize = @legendFontSize
        @svg.selectAll('.legend-bubbles-title').remove()
        legendBubbleTitleSvg = @svg.selectAll('.legend-bubbles-title')
            .data(@data.legendBubblesTitle)
            .enter()
            .append('text')
            .attr('class', 'legend-bubbles-title')
            .attr('x', (d) -> d.x)
            .attr('y', (d) -> d.y - (legendFontSize*1.5))
            .attr('text-anchor', 'middle')
            .attr('font-family', @legendFontFamily)
            .attr('font-weight', 'bold')
            .attr('fill', @legendFontColor)
            .text @zTitle

        SvgUtils.get().setSvgBBoxWidthAndHeight @data.legendBubblesTitle, legendBubbleTitleSvg

      @svg.selectAll('.legend-groups-pts').remove()
      @svg.selectAll('.legend-groups-pts')
               .data(@data.legendGroups)
               .enter()
               .append('circle')
               .attr('class', 'legend-groups-pts')
               .attr('cx', (d) -> d.cx)
               .attr('cy', (d) -> d.cy)
               .attr('r', (d) -> d.r)
               .attr('fill', (d) -> d.color)
               .attr('stroke', (d) -> d.stroke)
               .attr('stroke-opacity', (d) -> d['stroke-opacity'])
               .attr('fill-opacity', (d) -> d.fillOpacity)

      @svg.selectAll('.legend-groups-text').remove()
      @svg.selectAll('.legend-groups-text')
               .data(@data.legendGroups)
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

      drag = legendLabelDragAndDrop()
      @svg.selectAll('.legend-dragged-pts-text').remove()
      @svg.selectAll('.legend-dragged-pts-text')
               .data(@data.legendPts)
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
               .text((d) -> if d.markerId? then Utils.get().getSuperscript(d.markerId+1) + d.text else d.text)
               .call(drag)

      # Height and width are not provided
      SvgUtils.get().setSvgBBoxWidthAndHeight @data.legendGroups, @svg.selectAll('.legend-groups-text')
      SvgUtils.get().setSvgBBoxWidthAndHeight @data.legendPts, @svg.selectAll('.legend-dragged-pts-text')

      if @data.resizedAfterLegendGroupsDrawn()
        console.log "rhtmlLabeledScatter: drawLegend false"
        return false

    return true

  drawAnc: =>
    @svg.selectAll('.anc').remove()
    anc = @svg.selectAll('.anc')
             .data(@data.pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('cx', (d) -> d.x)
             .attr('cy', (d) -> d.y)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)
             .attr('fill-opacity', (d) -> d.fillOpacity)
    if Utils.get().isArr(@Z)
      anc.append('title')
         .text((d) =>
           xlabel = Utils.get().getFormattedNum(d.labelX, @xDecimals, @xPrefix, @xSuffix)
           ylabel = Utils.get().getFormattedNum(d.labelY, @yDecimals, @yPrefix, @ySuffix)
           zlabel = Utils.get().getFormattedNum(d.labelZ, @zDecimals, @zPrefix, @zSuffix)
           "#{d.label}\n#{zlabel}\n#{d.group}\n[#{xlabel}, #{ylabel}]")
    else
      anc.append('title')
         .text((d) =>
           xlabel = Utils.get().getFormattedNum(d.labelX, @xDecimals, @xPrefix, @xSuffix)
           ylabel = Utils.get().getFormattedNum(d.labelY, @yDecimals, @yPrefix, @ySuffix)
           "#{d.label}\n#{d.group}\n[#{xlabel}, #{ylabel}]")

  drawDraggedMarkers: =>
    @svg.selectAll('.marker').remove()
    @svg.selectAll('.marker')
        .data(@data.outsidePlotMarkers)
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
        .data(@data.outsidePlotMarkers)
        .enter()
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', (d) -> d.markerTextX)
        .attr('y', (d) -> d.markerTextY)
        .attr('font-family', 'Arial')
        .attr('text-anchor', 'start')
        .attr('font-size', @data.legendDim.markerTextSize)
        .attr('fill', (d) -> d.color)
        .text((d) -> d.markerLabel)

  elemDraggedOffPlot: (id) =>
    @data.moveElemToLegend(id)
    @state.pushLegendPt(id)
    @resetPlotAfterDragEvent()

  elemDraggedOnPlot: (id) =>
    @data.removeElemFromLegend(id)
    @state.pullLegendPt(id)
    @resetPlotAfterDragEvent()

  resetPlotAfterDragEvent: =>
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
    @draw()

  drawLabs: =>
    labelDragAndDrop = =>
      plot = @
      dragStart = () ->
        plot.svg.selectAll('.link').remove()

      dragMove = () ->
        d3.select(@)
        .attr('x', d3.select(@).x = d3.event.x)
        .attr('y', d3.select(@).y = d3.event.y)

        # Save the new location of text so links can be redrawn
        id = d3.select(@).attr('id')
        label = _.find plot.data.lab, (l) -> l.id == Number(id)
        label.x = d3.event.x
        label.y = d3.event.y

      dragEnd = ->
        # If label is dragged out of viewBox, remove the lab and add to legend
        id = Number(d3.select(@).attr('id'))
        lab = _.find plot.data.lab, (l) -> l.id == id
        if plot.data.isOutsideViewBox(lab)
          plot.elemDraggedOffPlot(id)
        else
          plot.state.pushUserPositionedLabel(id, lab.x, lab.y, plot.viewBoxDim)
          plot.drawLinks()

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
      @state.updateLabelsWithUserPositionedData(@data.lab, @data.viewBoxDim)

      @svg.selectAll('.lab').remove()
      @svg.selectAll('.lab')
               .data(@data.lab)
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

      labels_svg = @svg.selectAll('.lab')

      SvgUtils.get().setSvgBBoxWidthAndHeight @data.lab, labels_svg
      console.log "rhtmlLabeledScatter: Running label placement algorithm..."
      labeler = d3.labeler()
                  .svg(@svg)
                  .w1(@viewBoxDim.x)
                  .w2(@viewBoxDim.x + @viewBoxDim.width)
                  .h1(@viewBoxDim.y)
                  .h2(@viewBoxDim.y + @viewBoxDim.height)
                  .anchor(@data.pts)
                  .label(@data.lab)
                  .pinned(@state.getUserPositionedLabIds())
                  .start(500)

      labels_svg.transition()
                .duration(800)
                .attr('x', (d) -> d.x)
                .attr('y', (d) -> d.y)

      @drawLinks()

  drawLinks: =>
    links = []
    for pt, i in @data.pts
      newLinkPt = LinkUtils.get().getNewPtOnLabelBorder @data.lab[i], pt, @data.pts
      if newLinkPt?
        ancBorderPt = LinkUtils.get().getPtOnAncBorder pt.x, pt.y, pt.r, newLinkPt[0], newLinkPt[1]
        links.push({
          x1: ancBorderPt[0]
          y1: ancBorderPt[1]
          x2: newLinkPt[0]
          y2: newLinkPt[1]
          width: 1
          color: pt.color
        })

    @svg.selectAll('.link')
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
             .style('stroke-opacity', @data.plotColors.getFillOpacity(@transparency))
