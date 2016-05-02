
class Template

  #NB Coffeescript class syntax note:
  # @ in front of method / variable def: static class method
  # @ within method body : short hand for this / self / instance context
  # e.g @pictograph is a static variable, @rootElement is an instance variable

  @templateIndex = -1

  constructor: (el, width, height) ->
    Template.pictographIndex++

    @rootElement = if _.has(el, 'length') then el[0] else el
    @initialWidth = width
    @initialHeight = height

  setConfig: (@config) ->

  draw: () ->

    @_manipulateRootElementSize()
    @_addRootSvgToRootElement()

  resize: (width, height) ->
    #NB delberately not implemented - not needed

  _manipulateRootElementSize: () ->

    #root element has width and height in a style tag. Clear that
    $(@rootElement).attr('style', '')

    if @config['resizable']
      $(@rootElement).width('100%').height('100%')
    else
      $(@rootElement).width(@initialWidth).height(@initialHeight)

  _addRootSvgToRootElement: () ->

    anonSvg = $('<svg class="pictograph-outer-svg">')
      .addClass @config['table-id']
      .attr 'id', @config['table-id']
      .attr 'width', '100%'
      .attr 'height', '100%'

    $(@rootElement).append(anonSvg)

    @outerSvg = d3.select(anonSvg[0])

    #NB JQuery insists on lowercasing attributes, so we must use JS directly
    # when setting viewBox and preserveAspectRatio ?!
    document.getElementsByClassName("pictograph-outer-svg")[0]
      .setAttribute 'viewBox', "0 0 #{@initialWidth} #{@initialHeight}"
    if @config['preserveAspectRatio']?
      document.getElementsByClassName("pictograph-outer-svg")[0]
        .setAttribute 'preserveAspectRatio', @config['preserveAspectRatio']

    return null
