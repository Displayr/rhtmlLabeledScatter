'use strict'

# TEMPLATE! - update the template name below. Rename this file to match your widget name.
#  -In theory you dont ned to change anything else, but you can at your own discretion
HTMLWidgets.widget
  name: 'rhtmlLabeledScatter'
  type: 'output'

  resize: (el, width, height, instance) ->
    #@TODO check if instance has resize before calling it
    instance.resize width, height

  initialize: (el, width, height) ->
    #TEMPLATE! - update the class name below to the name of your main class
    return new LabeledScatter el, width, height

  renderValue: (el, config, instance) ->
    try
      if _.isString config
        config = JSON.parse config

    catch err
      readableError = new Error "LabeledScatter error : Cannot parse 'settingsJsonString': #{err}"
      console.error readableError
      errorHandler = new DisplayError el, readableError
      errorHandler.draw()

      throw new Error err

    #@TODO for now ignore the width height that come through from config and use the ones passed to constructor
    delete config['width']
    delete config['height']

    try
      instance.setConfig config
      instance.draw()

    catch err
      console.error err.stack
      errorHandler = new DisplayError el, err
      errorHandler.draw()
      throw new Error err

    instance.draw()
