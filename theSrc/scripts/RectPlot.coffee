
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
                @zTitle = '',
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
                @showLabels = true,
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
    @verticalPadding = 5
    @horizontalPadding = 10

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
                         @pointRadius)

  draw: (plot) ->
    dimensionMarkerPromise = new Promise (resolve, reject) ->
      plot.drawDimensionMarkers(reject)
      resolve()
    legendPromise = new Promise (resolve, reject) ->
      plot.drawLegend(plot, plot.data, reject)
      resolve()

    resizePromises = [dimensionMarkerPromise, legendPromise]
    Promise.all(resizePromises).then(() ->

      plot.data.normalizeData(plot.data)
      plot.data.calcDataArrays()
      plot.title.x = plot.viewBoxDim.x + plot.viewBoxDim.width/2

      plot.drawTitle()
      plot.drawAnc(plot.data)
      plot.drawLabs(plot)
      plot.drawDraggedMarkers(plot.data)
      plot.drawRect()
      plot.drawAxisLabels()
    ).catch((resizedPlot) ->
      # A redraw is needed
      resizedPlot.draw(resizedPlot)
    )


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

  drawDimensionMarkers: (reject) ->
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
    ml = @svg.selectAll('.dim-marker-label')
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
      reject(@)

  drawAxisLabels: ->
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

  drawLegend: (plot, data, reject)->
    data.setupLegendGroupsAndPts(data)

    superscript = [8304, 185, 178, 179, 8308, 8309, 8310, 8311, 8312, 8313] # '⁰¹²³⁴⁵⁶⁷⁸⁹'

    getSuperscript = (id) ->
      ss = ''
      while id > 0
        digit = id % 10
        ss = String.fromCharCode(superscript[id % 10]) + ss
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
          plot.elemDraggedOnPlot(plot, id)


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
      if @Z? and @Z instanceof Array
        @svg.selectAll('.legend-bubbles').remove()
        @svg.selectAll('.legend-bubbles')
            .data(data.legendBubbles)
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
          .data(data.legendBubbles)
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
            .data(data.legendBubblesTitle)
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

        SvgUtils.get().setSvgBBoxWidthAndHeight data.legendBubblesTitle.length, data.legendBubblesTitle, legendBubbleTitleSvg

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

      SvgUtils.get().setSvgBBoxWidthAndHeight data.legendGroups.length, data.legendGroups, legendGroupsLab
      SvgUtils.get().setSvgBBoxWidthAndHeight data.legendPts.length, data.legendPts, legendDraggedPtsLab

      if data.resizedAfterLegendGroupsDrawn()
        reject(plot)

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
    if @Z? and @Z instanceof Array
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

  elemDraggedOffPlot: (plot, id) ->
    plot.data.moveElemToLegend(id, plot.data)
    plot.resetPlotAfterDragEvent(plot)

  elemDraggedOnPlot: (plot, id) ->
    plot.data.removeElemFromLegend(id, plot.data)
    plot.resetPlotAfterDragEvent(plot)

  resetPlotAfterDragEvent: (plot) ->
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
    plot.draw(plot)

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
          plot.elemDraggedOffPlot(plot, id)
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

      SvgUtils.get().setSvgBBoxWidthAndHeight plot.data.len, plot.data.lab, labels_svg

      console.log "Running label placement algorithm..."
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
    utils = LinkUtils.get()

    links = []
    i = 0
    while i < data.len
      newLinkPt = utils.getNewPtOnLabelBorder data.lab[i], data.pts[i], data.pts
      if newLinkPt?
        ancBorderPt = utils.getPtOnAncBorder data.pts[i].x, data.pts[i].y, data.pts[i].r, newLinkPt[0], newLinkPt[1]
        links.push({
          x1: ancBorderPt[0]
          y1: ancBorderPt[1]
          x2: newLinkPt[0]
          y2: newLinkPt[1]
          width: 1
          color: data.pts[i].color
        })
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
