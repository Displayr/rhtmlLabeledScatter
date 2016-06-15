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
    console.log @outerSvg
    console.log testData
    data = testData


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
    originX = (-minX)/(maxX - minX)*viewBoxDim.width + viewBoxDim.x
    originY = (-minY)/(maxY - minY)*viewBoxDim.height + viewBoxDim.y

    pts = []
    i = 0
    while i < data.X.length
      pts.push({
        x: data.X[i]*viewBoxDim.width + viewBoxDim.x
        y: data.Y[i]*viewBoxDim.height + viewBoxDim.y
        r: 2
        label: data.label[i]
        labelX: data.X[i]*viewBoxDim.width + viewBoxDim.x
        labelY: data.Y[i]*viewBoxDim.height + viewBoxDim.y
        group: data.group[i]
      })
      i++

    lab = []
    anc = []
    i = 0
    while i < data.X.length
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


    @outerSvg.append('line')
             .attr('class', 'origin')
             .attr('x1', viewBoxDim.x)
             .attr('y1', originY)
             .attr('x2', viewBoxDim.x + viewBoxDim.width)
             .attr('y2', originY)
             .attr('stroke-width', 1)
             .attr('stroke', 'black')
             .style("stroke-dasharray", ("3, 3"))
    @outerSvg.append('line')
             .attr('class', 'origin')
             .attr('x1', originX)
             .attr('y1', viewBoxDim.y)
             .attr('x2', originX)
             .attr('y2', viewBoxDim.y + viewBoxDim.height)
             .attr('stroke-width', 1)
             .attr('stroke', 'black')
             .style("stroke-dasharray", ("3, 3"))


  calcViewBoxDim = (X, Y, width, height) ->
    return {
      width: width / 2
      height: height / 2
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    }
