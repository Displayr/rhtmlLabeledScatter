'use strict'

HTMLWidgets.widget
  name: 'rhtmlTemplate'
  type: 'output'

  resize: (el, width, height, instance) ->
    instance.resize width, height

  initialize: (el, width, height) ->
    return new Template el, width, height

  renderValue: (el, params, instance) ->

    config = null
    try
      if _.isString params.settingsJsonString
        config = JSON.parse params.settingsJsonString
      else
        config = params.settingsJsonString

      #@TODO: update docs so that percentage is not a top level param any more
      if params.percentage?
        config.percentage = params.percentage

    catch err
      readableError = new Error "Template error : Cannot parse 'settingsJsonString': #{err}"
      console.error readableError
      errorHandler = new DisplayError el, readableError
      errorHandler.draw()

      throw new Error err

    try
      instance.setConfig config
      instance.draw()

    catch err
      console.error err.stack
      errorHandler = new DisplayError el, err
      errorHandler.draw()
      throw new Error err
