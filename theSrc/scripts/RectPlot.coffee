
class RectPlot
  constructor: (@state,
                @width,
                @height,
                @X,
                @Y,
                @Z,
                @group,
                @label,
                @labelAlt = [],
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
                labelsLogoScale = [],
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
                @legendBubblesShow = true,
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
                @yBoundsUnitsMajor = null,
                trendLines = false,
                trendLinesLineThickness = 1,
                trendLinesPointSize = 2,
                @plotBorderShow = true
  ) ->

    @maxDrawFailureCount = 200

    @labelsFont =
      size:            labelsFontSize
      color:           labelsFontColor
      family:          labelsFontFamily
      logoScale:       labelsLogoScale

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

    @trendLines =
      show:           trendLines
      lineThickness:  trendLinesLineThickness
      pointSize:      trendLinesPointSize

    @axisLeaderLineLength = 5
    @axisDimensionText =
      rowMaxWidth: 0
      rowMaxHeight: 0
      colMaxWidth: 0
      colMaxHeight: 0
      rightPadding: 0  # Set later, for when axis markers labels protrude (VIS-146)
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
      fontWeight:   'normal'
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
      width:              width - @legendDim.width - @horizontalPadding*3 - @axisLeaderLineLength - @axisDimensionText.rowMaxWidth - @yTitle.textHeight - @axisDimensionText.rightPadding
      height:             height - @verticalPadding*2 - @title.textHeight - @title.paddingBot - @axisDimensionText.colMaxHeight - @xTitle.textHeight - @axisLeaderLineLength - @xTitle.topPadding
      x:                  @horizontalPadding*2 + @axisDimensionText.rowMaxWidth + @axisLeaderLineLength + @yTitle.textHeight
      y:                  @verticalPadding + @title.textHeight + @title.paddingBot
      labelFontSize:      @labelsFont.size
      labelSmallFontSize: @labelsFont.size * 0.75
      labelFontColor:     @labelsFont.color
      labelFontFamily:    @labelsFont.family
      labelLogoScale:     @labelsFont.logoScale

    @legendDim.x = @viewBoxDim.x + @viewBoxDim.width
    @title.x = @viewBoxDim.x + @viewBoxDim.width/2

    @data = new PlotData(@X,
                         @Y,
                         @Z,
                         @group,
                         @label,
                         @labelAlt,
                         @viewBoxDim,
                         @legendDim,
                         @colors,
                         @fixedRatio,
                         @originAlign,
                         @pointRadius,
                         @bounds,
                         @transparency,
                         @legendShow,
                         @legendBubblesShow,
                         @axisDimensionText)

    @drawFailureCount = 0

  draw: =>
    return @drawDimensionMarkers()
      .then(@drawLegend.bind(@))
      .then(@drawLabsAndPlot.bind(@))
      .then(() =>
        # TODO Po if you remove this then the life expectancy bubble plot will not have the legendLabels in the legend. It will only have the groups
        if @data.legendRequiresRedraw
          return @drawLegend()
      )
      .then(() =>
        console.log "draw succeeded after #{@drawFailureCount} failures"
        @drawFailureCount = 0
      )
      .catch( (err) =>
        @drawFailureCount++
        if @drawFailureCount >= @maxDrawFailureCount
          console.log "draw failure #{err.message} (fail count: #{@drawFailureCount}). Exceeded max draw failures of #{@maxDrawFailureCount}. Terminating"
          throw err

        if err and err.retry
          console.log "draw failure #{err.message} (fail count: #{@drawFailureCount}). Redrawing"
          return @draw()

        throw err
      )

  drawLabsAndPlot: =>
    @data.normalizeData()

    return @data.getPtsAndLabs('RectPlot.drawLabsAndPlot').then(() =>
      @title.x = @viewBoxDim.x + @viewBoxDim.width/2

      unless @state.isLegendPtsSynced(@data.outsidePlotPtsId)
        for pt in @state.getLegendPts()
          unless _.includes @data.outsidePlotPtsId, pt
            @data.addElemToLegend(pt)

        for pt in @data.outsidePlotPtsId
          unless _.includes @state.getLegendPts(), pt
            @state.pushLegendPt pt
        error = new Error("drawLabsAndPlot failed : state.isLegendPtsSynced = false")
        error.retry = true
        throw error
    ).then(() =>
      try
        @drawTitle()
        @drawAnc()
        @drawLabs()
        @drawTrendLines() if @trendLines.show
        @drawDraggedMarkers()
        @drawRect() if @plotBorderShow
        @drawAxisLabels()
      catch error
        console.log error
    )

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
    new Promise((resolve, reject) =>
      # TODO: unnecessary double call ? PlotData.constructor calls PlotData.calculateMinMax ?
      @data.calculateMinMax()
      axisArrays = AxisUtils.getAxisDataArrays(@, @data, @viewBoxDim)

      # TODO KZ this sequence can be easily consolidated
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
               .attr('type', (d) -> d.type)

      # Figure out the max width of the yaxis dimensional labels
      initAxisTextRowWidth = @axisDimensionText.rowMaxWidth
      initAxisTextColWidth = @axisDimensionText.colMaxWidth
      initAxisTextRowHeight = @axisDimensionText.rowMaxHeight
      initAxisTextColHeight = @axisDimensionText.colMaxHeight
      for markerLabel, i in markerLabels[0]
        labelType = d3.select(markerLabel).attr('type')
        bb = markerLabel.getBBox()
        @axisDimensionText.rowMaxWidth = bb.width if @axisDimensionText.rowMaxWidth < bb.width and labelType == 'row'
        @axisDimensionText.colMaxWidth = bb.width if @axisDimensionText.colMaxWidth < bb.width and labelType == 'col'
        @axisDimensionText.rowMaxHeight = bb.height if @axisDimensionText.rowMaxHeight < bb.height and labelType == 'row'
        @axisDimensionText.colMaxHeight = bb.height if @axisDimensionText.colMaxHeight < bb.height and labelType == 'col'

        if @width < bb.x + bb.width
          @axisDimensionText.rightPadding = bb.width/2

      if initAxisTextRowWidth != @axisDimensionText.rowMaxWidth or
         initAxisTextColWidth != @axisDimensionText.colMaxWidth or
         initAxisTextRowHeight != @axisDimensionText.rowMaxHeight or
         initAxisTextColHeight != @axisDimensionText.colMaxHeight
        @setDim(@svg, @width, @height)
        @data.revertMinMax()
        error = new Error("axis marker out of bound")
        error.retry = true
        return reject(error)
      return resolve()
    )


  drawAxisLabels: =>
    axisLabels = [
      { # x axis label
        x: @viewBoxDim.x + @viewBoxDim.width/2
        y: @viewBoxDim.y + @viewBoxDim.height +
           @axisLeaderLineLength +
           @axisDimensionText.colMaxHeight +
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
             .style('font-weight', 'normal')
             .style('display', (d) -> d.display)

  drawLegend: =>
    new Promise((resolve, reject) =>
      @data.setupLegendGroupsAndPts()

      if @legendBubblesShow and Utils.isArrOfNums(@Z)
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
              .attr('font-weight', 'normal')
              .attr('fill', @legendFontColor)
              .text @zTitle

          SvgUtils.setSvgBBoxWidthAndHeight @data.legendBubblesTitle, legendBubbleTitleSvg

      drag = DragUtils.getLegendLabelDragAndDrop(@, @data)
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
          .text((d) -> if d.markerId? then Utils.getSuperscript(d.markerId+1) + d.text else d.text)
          .call(drag)

      SvgUtils.setSvgBBoxWidthAndHeight @data.legendPts, @svg.selectAll('.legend-dragged-pts-text')

      if @legendShow
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

        # Height and width are not provided
        SvgUtils.setSvgBBoxWidthAndHeight @data.legendGroups, @svg.selectAll('.legend-groups-text')

      if @legendShow or (@legendBubblesShow and Utils.isArrOfNums(@Z)) or @data.legendPts?
        if @data.resizedAfterLegendGroupsDrawn(@legendShow)
          @data.revertMinMax()
          error = new Error("drawLegend Failed")
          error.retry = true
          return reject(error)
      return resolve()
    )

  drawAnc: =>
    @svg.selectAll('.anc').remove()
    anc = @svg.selectAll('.anc')
             .data(@data.pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('id', (d) -> "anc-#{d.id}")
             .attr('cx', (d) -> d.x)
             .attr('cy', (d) -> d.y)
             .attr('fill', (d) -> d.color)
             .attr('fill-opacity', (d) -> d.fillOpacity)
             .attr('r', (d) =>
                    if @trendLines.show
                      @trendLines.pointSize
                    else
                      d.r)
    if Utils.isArrOfNums(@Z)
      anc.append('title')
         .text((d) =>
           xlabel = Utils.getFormattedNum(d.labelX, @xDecimals, @xPrefix, @xSuffix)
           ylabel = Utils.getFormattedNum(d.labelY, @yDecimals, @yPrefix, @ySuffix)
           zlabel = Utils.getFormattedNum(d.labelZ, @zDecimals, @zPrefix, @zSuffix)
           labelTxt = if d.label == '' then d.labelAlt else d.label
           "#{labelTxt}, #{d.group}\n#{zlabel}\n(#{xlabel}, #{ylabel})")
    else
      anc.append('title')
         .text((d) =>
           xlabel = Utils.getFormattedNum(d.labelX, @xDecimals, @xPrefix, @xSuffix)
           ylabel = Utils.getFormattedNum(d.labelY, @yDecimals, @yPrefix, @ySuffix)
           labelTxt = if d.label == '' then d.labelAlt else d.label
           "#{labelTxt}, #{d.group}\n(#{xlabel}, #{ylabel})")

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
    if @showLabels and not @trendLines.show
      drag = DragUtils.getLabelDragAndDrop(@)
      @state.updateLabelsWithUserPositionedData(@data.lab, @data.viewBoxDim)

      @svg.selectAll('.lab-img').remove()
      @svg.selectAll('.lab-img')
          .data(@data.lab)
          .enter()
          .append('svg:image')
          .attr('class', 'lab-img')
          .attr('xlink:href', (d) -> d.url)
          .attr('id', (d) -> d.id if d.url != '')
          .attr('x', (d) -> d.x - d.width/2)
          .attr('y', (d) -> d.y - d.height)
          .attr('width', (d) -> d.width)
          .attr('height', (d) -> d.height)
          .call(drag)

      @svg.selectAll('.lab').remove()
      @svg.selectAll('.lab')
               .data(@data.lab)
               .enter()
               .append('text')
               .attr('class', 'lab')
               .attr('id', (d) -> d.id if d.url == '')
               .attr('x', (d) -> d.x)
               .attr('y', (d) -> d.y)
               .attr('font-family', (d) -> d.fontFamily)
               .text((d) -> d.text if d.url == '')
               .attr('text-anchor', 'middle')
               .attr('fill', (d) -> d.color)
               .attr('font-size', (d) -> d.fontSize)
               .call(drag)

      labels_svg = @svg.selectAll('.lab')
      labels_img_svg = @svg.selectAll('.lab-img')

      SvgUtils.setSvgBBoxWidthAndHeight @data.lab, labels_svg
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

      labels_img_svg.transition()
                    .duration(800)
                    .attr('x', (d) -> d.x - d.width/2)
                    .attr('y', (d) -> d.y - d.height)

      @drawLinks()

    else if @showLabels and @trendLines.show
      @tl = new TrendLine(@data.pts, @data.lab)
      @state.updateLabelsWithUserPositionedData(@data.lab, @data.viewBoxDim)

      drag = DragUtils.getLabelDragAndDrop(@, @trendLines.show)

      @svg.selectAll('.lab-img').remove()
      @svg.selectAll('.lab-img')
        .data(@tl.arrowheadLabels)
        .enter()
        .append('svg:image')
        .attr('class', 'lab-img')
        .attr('xlink:href', (d) -> d.url)
        .attr('id', (d) -> d.id if d.url != '')
        .attr('x', (d) -> d.x - d.width/2)
        .attr('y', (d) -> d.y - d.height)
        .attr('width', (d) -> d.width)
        .attr('height', (d) -> d.height)
        .call(drag)


      @svg.selectAll('.lab').remove()
      @svg.selectAll('.lab')
        .data(@tl.arrowheadLabels)
        .enter()
        .append('text')
        .attr('class', 'lab')
        .attr('id', (d) -> d.id if d.url == '')
        .attr('x', (d) -> d.x)
        .attr('y', (d) -> d.y)
        .attr('font-family', (d) -> d.fontFamily)
        .text((d) -> d.text if d.url == '')
        .attr('text-anchor', 'middle')
        .attr('fill', (d) -> d.color)
        .attr('font-size', (d) -> d.fontSize)
        .call(drag)

      labels_svg = @svg.selectAll('.lab')
      labels_img_svg = @svg.selectAll('.lab-img')
      SvgUtils.setSvgBBoxWidthAndHeight @tl.arrowheadLabels, labels_svg

      labeler = d3.labeler()
                  .svg(@svg)
                  .w1(@viewBoxDim.x)
                  .w2(@viewBoxDim.x + @viewBoxDim.width)
                  .h1(@viewBoxDim.y)
                  .h2(@viewBoxDim.y + @viewBoxDim.height)
                  .anchor(@tl.arrowheadPts)
                  .label(@tl.arrowheadLabels)
                  .pinned(@state.getUserPositionedLabIds())
                  .start(500)

      labels_svg.transition()
        .duration(800)
        .attr('x', (d) -> d.x)
        .attr('y', (d) -> d.y)

      labels_img_svg.transition()
        .duration(800)
        .attr('x', (d) -> d.x - d.width/2)
        .attr('y', (d) -> d.y - d.height)

  drawLinks: =>
    links = new Links(@data.pts, @data.lab)
    @svg.selectAll('.link').remove()
    @svg.selectAll('.link')
             .data(links.getLinkData())
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

  drawTrendLines: =>
    @state.updateLabelsWithUserPositionedData(@data.lab, @data.viewBoxDim)
    if @tl == undefined or @tl == null
      @tl = new TrendLine(@data.pts, @data.lab)

    _.map(@tl.getUniqueGroups(), (group) =>
      #Arrowhead marker
      @svg.selectAll("#triangle-#{group}").remove()
      @svg.append('svg:defs').append('svg:marker')
          .attr('id', "triangle-#{group}")
          .attr('refX', 6)
          .attr('refY', 6)
          .attr('markerWidth', 30)
          .attr('markerHeight', 30)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 12 6 0 12 3 6')
          .style('fill', @data.plotColors.getColorFromGroup(group));

      @svg.selectAll(".trendline-#{group}").remove()
      @svg.selectAll(".trendline-#{group}")
        .data(@tl.getLineArray(group))
        .enter()
        .append('line')
        .attr('class', "trendline-#{group}")
        .attr('x1', (d) -> d[0])
        .attr('y1', (d) -> d[1])
        .attr('x2', (d) -> d[2])
        .attr('y2', (d) -> d[3])
        .attr('stroke', @data.plotColors.getColorFromGroup(group))
        .attr('stroke-width', @trendLines.lineThickness)
        .attr('marker-end', (d, i) =>
          # Draw arrowhead on last element in trendline
          if i == (@tl.getLineArray(group)).length - 1
            "url(#triangle-#{group})"
        )
    )
