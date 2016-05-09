'use strict'

HTMLWidgets.widget
  name: 'rhtmlLabeledScatter'
  type: 'output'
  initialize: (el, width, height) ->
    console.log 'Initialized'
    console.log "Given width #{width}"
    console.log "Given height #{height}"

    return new LabeledScatter(width, height)

  resize: (el, width, height, instance) ->
    console.log 'Resized'
    instance.redraw(width, height, el)
    return instance

  renderValue: (el, params, instance) ->
    console.log 'RenderValue called'

    @data = {}
    instance.draw @data, el

    return instance
