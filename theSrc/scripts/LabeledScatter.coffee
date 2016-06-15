 # TEMPLATE! - update the method signature here
 #  -You will need to update most of this file, as this is where all the specific widget stuff goes
 #  -Simplest way to make a new widget is to extend RhtmlStatefulWidget (which also gives you RhtmlSvgWidget)
 #   then rewrite _processConfig and

class LabeledScatter extends RhtmlSvgWidget

  constructor: (el, width, height) ->
    super el, width, height
    @width = width
    @height = height
    @_initializeState { selected: null }

  resize: (width, height) ->
    @width = width
    @height = height
    _redraw()

  _processConfig: () ->
    console.log '_processConfig. Change this function in your rhtmlWidget'
    console.log 'the config has already been added to the context at @config, you must now "process" it'
    console.log @config

  _redraw: () ->
    console.log '_redraw. Change this function in your rhtmlWidget'
    console.log 'the outer SVG has already been created and added to the DOM. You should do things with it'
    data = testData

    calcViewBoxDim = (X, Y, width, height) ->
      return {
        width: width / 2
        height: height / 2
        rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
        rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
      }

    viewBoxDim = calcViewBoxDim(testData.X, testData.Y, @width, @height)
    viewBoxDim['x'] = @width / 5
    viewBoxDim['y'] = @height / 5

    @outerSvg.append('rect')
             .attr('class', 'plot-viewbox')
             .attr('x', viewBoxDim.x)
             .attr('y', viewBoxDim.y)
             .attr('width', viewBoxDim.width)
             .attr('height', viewBoxDim.height)
             .attr('fill', 'none')
             .attr('stroke', 'black')
             .attr('stroke-width', '1px')

    #normalize
    minX = Infinity
    maxX = -Infinity
    minY = Infinity
    maxY = -Infinity
    i = 0
    while i < data.X.length
      minX = data.X[i] if minX > data.X[i]
      maxX = data.X[i] if maxX < data.X[i]
      minY = data.Y[i] if minY > data.Y[i]
      maxY = data.Y[i] if maxY < data.Y[i]
      i++

    threshold = 0.05
    i = 0
    while i < data.X.length
      data.X[i] = threshold + (data.X[i] - minX)/(maxX - minX)*(1-2*threshold)
      data.Y[i] = threshold + (data.Y[i] - minY)/(maxY - minY)*(1-2*threshold)
      i++

    normalizeXCoords = (Xcoord) ->
      (Xcoord-minX)/(maxX - minX)*viewBoxDim.width + viewBoxDim.x
    normalizeYCoords = (Ycoord) ->
      (Ycoord-minY)/(maxY - minY)*viewBoxDim.height + viewBoxDim.y

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

    pts = []
    lab = []
    anc = []
    legend = []
    color = new RColor #using rColor library
    i = 0
    while i < data.X.length
      unless (_.some legend, (e) -> e.text is data.group[i])
        newColor = color.get(true, 0.9, 0.9)
        legend.push {text: data.group[i], color: newColor}
      pts.push({
        x: data.X[i]*viewBoxDim.width + viewBoxDim.x
        y: data.Y[i]*viewBoxDim.height + viewBoxDim.y
        r: 2
        label: data.label[i]
        labelX: data.X[i]*viewBoxDim.width + viewBoxDim.x
        labelY: data.Y[i]*viewBoxDim.height + viewBoxDim.y
        group: data.group[i]
        color: newColor
      })
      lab.push({
        x: data.X[i]*viewBoxDim.width + viewBoxDim.x
        y: data.Y[i]*viewBoxDim.height + viewBoxDim.y
        text: data.label[i]
      })
      anc.push({
        x: data.X[i]*viewBoxDim.width + viewBoxDim.x
        y: data.Y[i]*viewBoxDim.height + viewBoxDim.y
        r: 2
      })
      i++


    @outerSvg.selectAll('.anc')
             .data(pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('cx', (d) -> d.x)
             .attr('cy', (d) -> d.y)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)

    labels_svg = @outerSvg.selectAll('.label')
             .data(lab)
             .enter()
             .append('text')
             .attr('class', 'init-labs')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.text)
             .attr('text-anchor', 'middle')

    i = 0
    while i < data.X.length
      lab[i].width = labels_svg[0][i].getBBox().width
      lab[i].height = labels_svg[0][i].getBBox().height
      i++

    labeler = d3.labeler()
                .svg(@outerSvg)
                .w1(viewBoxDim.x)
                .w2(viewBoxDim.x + viewBoxDim.width)
                .h1(viewBoxDim.y)
                .h2(viewBoxDim.y + viewBoxDim.height)
                .anchor(anc)
                .label(lab)
                .start(500)

    labels_svg.transition()
              .duration(800)
              .attr('x', (d) -> d.x)
              .attr('y', (d) -> d.y)

    originX = normalizeXCoords 0
    originY = normalizeYCoords 0
    originAxis = [
      {x1: viewBoxDim.x, y1: originY, x2: viewBoxDim.x + viewBoxDim.width, y2: originY},
      {x1: originX, y1: viewBoxDim.y, x2: originX, y2: viewBoxDim.y + viewBoxDim.height}
    ]

    @outerSvg.selectAll('.origin')
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
        x1 = normalizeXCoords val
        y1 = viewBoxDim.y
        x2 = normalizeXCoords val
        y2 = viewBoxDim.y + viewBoxDim.height
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'c', x1, y1, x2, y2, val

      if i < colsNegative
        val = -(i+1)*0.25
        x1 = normalizeXCoords val
        y1 = viewBoxDim.y
        x2 = normalizeXCoords val
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
        y1 = normalizeYCoords val
        x2 = viewBoxDim.x + viewBoxDim.width
        y2 = normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      if i < rowsNegative
        val = (i+1)*0.25
        x1 = viewBoxDim.x
        y1 = normalizeYCoords val
        x2 = viewBoxDim.x + viewBoxDim.width
        y2 = normalizeYCoords val
        dimensionMarkerStack.push {x1: x1, y1: y1, x2: x2, y2: y2}
        if i % 2
          pushDimensionMarker 'r', x1, y1, x2, y2, val
      i++

    yAxisPadding = 30
    xAxisPadding = 40
    axisLabels = [
      { # x axis label
        x: viewBoxDim.x + viewBoxDim.width/2
        y: viewBoxDim.y + viewBoxDim.height + xAxisPadding
        text: 'Dimension 1 (64%)'
        anchor: 'middle'
        transform: 'rotate(0)'
      },
      { # y axis label
        x: viewBoxDim.x - yAxisPadding
        y: viewBoxDim.y + viewBoxDim.height/2
        text: 'Dimension 2 (24%)'
        anchor: 'middle'
        transform: 'rotate(270,'+(viewBoxDim.x-yAxisPadding) + ', ' + (viewBoxDim.y + viewBoxDim.height/2)+ ')'
      }
    ]

    legendPtRad = 6
    legendLeftPadding = 30
    heightOfRow = 25
    legendStartY = Math.max((viewBoxDim.y + viewBoxDim.height/2 - heightOfRow*(legend.length)/2 + legendPtRad), viewBoxDim.y + legendPtRad)
    i = 0
    while i < legend.length
      li = legend[i]
      li['r'] = legendPtRad
      li['cx'] = viewBoxDim.x + viewBoxDim.width + legendLeftPadding
      li['cy'] = legendStartY + i*heightOfRow
      li['x'] = li['cx'] + 15
      li['y'] = li['cy'] + li['r']
      li['anchor'] = 'start'
      i++

    @outerSvg.selectAll('.dim-marker')
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

    @outerSvg.selectAll('.dim-marker-leader')
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

    @outerSvg.selectAll('.dim-marker-label')
             .data(dimensionMarkerLabelStack)
             .enter()
             .append('text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.label)
             .attr('text-anchor', (d) -> d.anchor)

    @outerSvg.selectAll('.axis-label')
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

    @outerSvg.selectAll('.legend-pts')
             .data(legend)
             .enter()
             .append('circle')
             .attr('cx', (d) -> d.cx)
             .attr('cy', (d) -> d.cy)
             .attr('r', (d) -> d.r)
             .attr('fill', (d) -> d.color)

    @outerSvg.selectAll('.legend-text')
             .data(legend)
             .enter()
             .append('text')
             .attr('x', (d) -> d.x)
             .attr('y', (d) -> d.y)
             .attr('font-family', 'Arial Narrow')
             .text((d) -> d.text)
             .attr('text-anchor', (d) -> d.anchor)
