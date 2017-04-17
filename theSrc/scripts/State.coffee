# This class interacts with Displayr's state mechanism
# Careful with alterations here as very old state types need to be defended against

class State
  constructor: (@stateObj, @stateChangedCallback, X, Y, label) ->
    if !(_.isObject(@stateObj))
      @stateObj = {}

    # Check if given data has been reset compared with received state
    storedX = if @isStoredInState('X') then @getStored('X') else []
    storedY = if @isStoredInState('Y') then @getStored('Y') else []
    storedLabel = if @isStoredInState('label') then @getStored('label') else []
    unless _.isEqual(storedX, X) and
           _.isEqual(storedY, Y) and
           _.isEqual(storedLabel, label)
      @stateObj = {}
      @saveToState('X', X)
      @saveToState('Y', Y)
      @saveToState('label', label)

    @legendPts = if @isStoredInState('legendPts') then _.uniq(@getStored('legendPts')) else []
    @userPositionedLabs = if @isStoredInState('userPositionedLabs') then @getStored('userPositionedLabs') else []

  isStoredInState: (key) =>
    _.has(@stateObj, key)

  getStored: (key) =>
    @stateObj[key] if @isStoredInState(key)

  saveToState: (key, val) =>
    if _.isFunction(@stateChangedCallback)
      @stateObj[key] = val
      @stateChangedCallback(@stateObj)

  pushLegendPt: (id) =>
    @legendPts.push id
    _.remove @userPositionedLabs, (e) -> e.id == id
    @saveToState('legendPts', @legendPts)
    @saveToState('userPositionedLabs', @userPositionedLabs)

  pullLegendPt: (id) =>
    _.pull @legendPts, id
    @saveToState('legendPts', @legendPts)

  getLegendPts: =>
    @legendPts

  isLegendPtsSynced: (currLegendPts) =>
    @legendPts.length == 0 or @legendPts.length == currLegendPts.length

  pushUserPositionedLabel: (id, labx, laby, viewBoxDim) =>
    _.remove(@userPositionedLabs, (e) -> e.id == id)

    @userPositionedLabs.push
      id: id
      x: (labx - viewBoxDim.x) / viewBoxDim.width
      y: (laby - viewBoxDim.y) / viewBoxDim.height
    @saveToState('userPositionedLabs', @userPositionedLabs)

  updateLabelsWithUserPositionedData: (lab, viewBoxDim) =>
    unless _.isEmpty @userPositionedLabs
      for l, i in lab
        posLab = _.find(@userPositionedLabs, (e) -> e.id == lab[i].id)
        if posLab?
          newX = (posLab.x * viewBoxDim.width) + viewBoxDim.x
          newY = (posLab.y * viewBoxDim.height) + viewBoxDim.y
          l.x = newX
          l.y = newY

  getUserPositionedLabIds: () =>
    _.map @userPositionedLabs, (e) -> e.id
