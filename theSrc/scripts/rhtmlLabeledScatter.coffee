'use strict'

# TEMPLATE! - update the template name below. Rename this file to match your widget name.
#  -In theory you dont ned to change anything else, but you can at your own discretion
HTMLWidgets.widget
  name: 'rhtmlLabeledScatter'
  type: 'output'

  initialize: (el, width, height) ->
    console.log 'initialize called'
    return new LabeledScatter width, height

  resize: (el, width, height, instance) ->
    console.log 'resize called'
    instance.resize el, width, height
    return instance

  renderValue: (el, params, instance) ->
    console.log 'renderValue called'
    instance.draw(params, el)
