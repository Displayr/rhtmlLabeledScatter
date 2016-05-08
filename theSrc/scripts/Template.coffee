 # TEMPLATE! - update the method signature here
 #  -You will need to update most of this file, as this is where all the specific widget stuff goes
 #  -Simplest way to make a new widget is to extend RhtmlStatefulWidget (which also gives you RhtmlSvgWidget)
 #   then rewrite _processConfig and

class Template extends RhtmlSvgWidget

  constructor: (el, width, height) ->
    super el, width, height

    @_initializeState { selected: null }

  _processConfig: () ->
    console.log '_processConfig. Change this function in your rhtmlWidget'
    console.log 'the config has already been added to the context at @config, you must now "process" it'
    console.log @config


  _redraw: () ->
    console.log '_redraw. Change this function in your rhtmlWidget'
    console.log 'the outer SVG has already been created and added to the DOM. You should do things with it'
    console.log @outerSvg

    data = [
      { color: 'red', name: 'red', x: 0, y: 0 }
      { color: 'blue', name: 'blue', x: @initialWidth / 2, y: 0 }
      { color: 'green', name: 'green', x: 0, y: @initialHeight / 2 }
      { color: 'orange', name: 'orange', x: @initialWidth / 2, y: @initialHeight / 2 }
    ]

    allCells = @outerSvg.selectAll('.node')
      .data data

    enteringCells = allCells.enter()
      .append 'g'
        .attr 'class', 'node'
        .attr 'transform', (d) ->
          return "translate(" + d.x + "," + d.y + ")"

    enteringCells.append 'rect'
      .attr 'width', @initialWidth / 2
      .attr 'height', @initialHeight / 2
      .attr 'class', 'rect'

    enteringCells.append 'text'
      .attr 'class', 'text'

    @_updateText()
    @_updateRectangles()

  _updateText: () ->
    allTexts = @outerSvg.selectAll('.text')
      .attr 'x', (d) => @initialWidth / 4 # note this is the midpoint (thats why we divide by 4 not 2)
      .attr 'y', (d) => @initialHeight / 4 # same midpoint consideration
      .style 'text-anchor', 'middle'
      #alignment-baseline and dominant-baseline should do same thing but
      #both may be necessary for browser compatability
      .style 'alignment-baseline', 'central'
      .style 'dominant-baseline', 'central'
      .style 'fill', 'white'
      .style 'font-weight', (d) =>
        return 900 if d.name == @state.selected
        return 200
      .style 'font-size', (d) =>
        return 60 if d.name == @state.selected
        return 18
      .text (d) -> d.name
      .on 'click', (d) =>
        @partialStateUpdate 'selected', d.name


  _updateRectangles: () ->
    allRects = @outerSvg.selectAll('.rect')
      .attr 'class', (d) -> "rect #{d.name}"
      .attr 'fill', (d) => d.color
      .attr 'stroke', 'black'
      .attr 'stroke-width', (d) =>
        return 6 if d.name == @state.selected
        return 0
      .on 'click', (d) =>
        @partialStateUpdate 'selected', d.name
