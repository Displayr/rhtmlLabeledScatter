'use strict'

# TEMPLATE! - update the template name below. Rename this file to match your widget name.
#  -Update the yaml file to reference the new name of this file.
#  -In theory you dont ned to change anything else, but do so at your own discretion
HTMLWidgets.widget
  name: 'rhtmlTemplate'
  type: 'output'

  resize: (el, width, height, instance) ->
    instance.resize width, height

  initialize: (el, width, height) ->
    console.log "width: #{width}"
    console.log "height: #{height}"
    return new Template el, width, height

  renderValue: (el, config, instance) ->

    try
      if _.isString config
        config = JSON.parse config

    catch err
      readableError = new Error "Template error : Cannot parse 'settingsJsonString': #{err}"
      console.error readableError
      errorHandler = new DisplayError el, readableError
      errorHandler.draw()

      throw new Error err

    #@TODO for now ignore the width height that come through from config and use the ones passed to constructor
    delete config['width']
    delete config['height']
    console.log "config: #{JSON.stringify(config)}"

    try
      instance.setConfig config
      instance.draw()

    catch err
      console.error err.stack
      errorHandler = new DisplayError el, err
      errorHandler.draw()
      throw new Error err
