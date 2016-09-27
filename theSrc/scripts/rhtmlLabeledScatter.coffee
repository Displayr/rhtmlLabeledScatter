'use strict'

# TEMPLATE! - update the template name below. Rename this file to match your widget name.
#  -In theory you dont ned to change anything else, but you can at your own discretion
HTMLWidgets.widget
  name: 'rhtmlLabeledScatter'
  type: 'output'

  factory: (el, width, height, stateChanged) ->
    console.log 'rhtmlLabeledScatter: factory called'
    instance = new LabeledScatter width, height, stateChanged
    {
      resize: (width, height) ->
        console.log 'rhtmlLabeledScatter: resize called'
        instance.resize el, width, height

      renderValue: (params, state) ->
        console.log 'rhtmlLabeledScatter: renderValue called'
        instance.draw(params, el, state)

      labeledScatter: instance
    }
