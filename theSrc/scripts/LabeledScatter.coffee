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


    viewBoxDim = calcViewBoxDim(testData.X, testData.Y, @width, @height)

    @outerSvg.append('rect')
             .attr('class', 'plot-viewbox')
             .attr('x', @width / 5)
             .attr('y', @height / 5)
             .attr('width', viewBoxDim.width)
             .attr('height', viewBoxDim.height)
             .attr('fill', 'none')
             .attr('stroke', 'black')
             .attr('stroke-width', '1px')

  calcViewBoxDim = (X, Y, width, height) ->
    return {
      width: width /2
      height: height / 2
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X)
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    }
