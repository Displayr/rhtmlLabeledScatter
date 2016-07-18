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
    console.log '_processConfig'
    console.log 'the config has already been added to the context at @config, you must now "process" it'
    console.log @config

  _redraw: () ->
    console.log '_redraw'
    data = testData5
    plot = new RectPlot(@width, @height, data.X, data.Y, data.group, data.label, @outerSvg)
    plot.draw()
