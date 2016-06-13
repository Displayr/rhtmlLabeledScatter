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
    viewBoxX = @width / 5
    viewBoxY = @height / 5

    @outerSvg.append('rect')
             .attr('class', 'plot-viewbox')
             .attr('x', viewBoxX)
             .attr('y', viewBoxY)
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

    pts = []
    i = 0
    while i < data.X.length
      pts.push({
        x: data.X[i]*viewBoxDim.width + viewBoxX
        y: data.Y[i]*viewBoxDim.height + viewBoxY
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

  calcViewBoxDim = (X, Y, width, height) ->
    return {
      width: width / 2
      height: height / 2
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    }
