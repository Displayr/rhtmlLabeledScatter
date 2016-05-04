
class StatefulHtmlWidget

  constructor: () ->

  _initializeState: (newState) ->
    @state = newState

  _redraw: () ->
    throw new Error 'Must override _redraw'

  _putState: (newState) ->
    @state = newState
    @_updateStateListeners()
    @_redraw()

  _updateState: (k,v) ->
    @state[k] = v
    @_updateStateListeners()
    @_redraw()

  getState: () ->
    @state

  setState: (newState) ->
    if _.isString newState
      try
        @state = JSON.parse newState
      catch err
        throw new Error 'json parse error in setState(#newState): ' + err

    else
      @state = newState

    @_updateStateListeners()
    @_redraw()

  registerStateListener: (listener) ->
    unless _.isArray @stateListeners
      @stateListeners = []

    @stateListeners.push listener

  _updateStateListeners: () ->
    unless _.isArray @stateListeners
      @stateListeners = []

    _.forEach @stateListeners, (listener) =>
      listener(@state)
