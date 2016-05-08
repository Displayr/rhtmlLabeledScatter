
class RhtmlStatefulWidget

  constructor: (el, width, height) ->
    @stateListeners = []

  #updates @state[k] to v, then calls all registered listeners and redraws the widget
  partialStateUpdate: (k,v) ->
    @state[k] = v
    @_updateStateListeners()
    @_redraw()

  getState: () ->
    @state

  #completely replaces @state with newState, then calls all registered listeners and redraws the widget
  #accepts a JS object or a JSON string
  setState: (newState) ->
    if _.isString newState
      try
        @state = JSON.parse newState
      catch err
        throw new Error 'json parse error in setState(#newState): ' + err

    else
      @state = _.clone newState

    @_updateStateListeners()
    @_redraw()

  #register an external listener. The external listener will be notified via invoking the provided callback every time state is updated.
  # the callback function `listener` must be a function that accepts at least one arg: the new state.
  registerStateListener: (listener) ->
    unless _.isArray @stateListeners
      @stateListeners = []

    @stateListeners.push listener

  #sets state without calling all registered listeners. Call this from within child classes, but _should_ not call externally
  _initializeState: (newState) ->
    @state = newState

  #internal function. Do not call externally or in child classes
  _updateStateListeners: () ->
    unless _.isArray @stateListeners
      @stateListeners = []

    _.forEach @stateListeners, (listener) =>
      listener(_.clone @state)
