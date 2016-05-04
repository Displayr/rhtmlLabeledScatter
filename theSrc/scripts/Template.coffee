 # TEMPLATE! - update the method signature here
 #  -You will need to update most of this file, as this is where all the specific widget stuff goes
 #  -In order for your class to work with the existing rhtmlTemplate.coffee file your widget class must define the following methods:
 #  --constructor, setConfig, draw, resize* - resize needs to be present but its typically a no op
 #  -In order for your class to work with the Numbers get/set state interface you should extend StatefulHtmlWidget and call these methods when necessary:
 #  --_initializeState, _putState, _updateState, getState, setState, registerStateListener, _updateStateListeners

class Template extends StatefulHtmlWidget

  #NB Coffeescript class syntax note:
  # @ in front of method / variable def: static class method
  # @ within method body : short hand for this / self / instance context
  # e.g @templateIndex is a static variable, @rootElement is an instance variable

  @templateIndex = -1

  constructor: (el, width, height) ->
    Template.templateIndex++

    @rootElement = if _.has(el, 'length') then el[0] else el
    @initialWidth = width
    @initialHeight = height

    @stateListeners = []
    @_initializeState { selected: null }

  setConfig: (@config) ->
    @config['table-id'] = "template-#{Template.templateIndex}" unless @config['table-id']

  draw: () ->

    @_manipulateRootElementSize()
    @_addRootSvgToRootElement()
    @_redraw()

  _redraw: () ->

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
      .attr 'x', (d) => @initialWidth / 4 # note this is the midpoint not the top/bottom (thats why we divide by 4 not 2)
      .attr 'y', (d) => @initialHeight / 4 # same midpoint consideration
      .style 'text-anchor', 'middle'
      #alignment-baseline and dominant-baseline should do same thing but are both may be necessary for browser compatability
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

  _updateRectangles: () ->
    allRects = @outerSvg.selectAll('.rect')
      .attr 'class', (d) -> "rect #{d.name}"
      .attr 'fill', (d) => d.color
      .attr 'stroke', 'black'
      .attr 'stroke-width', (d) =>
        return 6 if d.name == @state.selected
        return 0
      .on 'click', @_onClick

  resize: (width, height) ->
    #NB delberately not implemented - not needed

  _onClick: (d) =>
    @_updateState 'selected', d.name

  _manipulateRootElementSize: () ->

    #root element has width and height in a style tag. Clear that
    $(@rootElement).attr('style', '')

    if @config['resizable']
      $(@rootElement).width('100%').height('100%')
    else
      $(@rootElement).width(@initialWidth).height(@initialHeight)

  _addRootSvgToRootElement: () ->

    anonSvg = $('<svg class="template-outer-svg">')
      .addClass @config['table-id']
      .attr 'id', @config['table-id']
      .attr 'width', '100%'
      .attr 'height', '100%'

    $(@rootElement).append(anonSvg)

    @outerSvg = d3.select(anonSvg[0])

    #NB JQuery insists on lowercasing attributes, so we must use JS directly
    # when setting viewBox and preserveAspectRatio ?!
    document.getElementsByClassName("template-outer-svg")[0]
      .setAttribute 'viewBox', "0 0 #{@initialWidth} #{@initialHeight}"
    if @config['preserveAspectRatio']?
      document.getElementsByClassName("template-outer-svg")[0]
        .setAttribute 'preserveAspectRatio', @config['preserveAspectRatio']

    return null
