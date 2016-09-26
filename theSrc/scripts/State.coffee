# This class interacts with Displayr's state mechanism
# Careful with alterations here as very old state types need to be defended against

class State
  constructor: (@stateObj, @stateChangedCallback) ->
    if !(_.isObject(@stateObj))
      @stateObj = {}

    @legendPts = if @isStoredInState('legendPts') then @getStored('legendPts') else []
    @userPositionedLabs = if @isStoredInState('userPositionedLabs') then @getStored('userPositionedLabs') else []

  isStoredInState: (key) =>
    _.has(@stateObj, key)

  getStored: (key) =>
    @stateObj[key] if @isStoredInState(key)

  saveToState: (key, val) =>
    if _.isFunction(@stateChangedCallback)
      @stateObj.key = val
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

  updateLabelsWithUserPositionedData: (pts, lab, viewBoxDim) =>
    unless _.isEmpty @userPositionedLabs

      for l, i in lab
        posLab = _.find(@userPositionedLabs, (e) -> e.id == l.id)
        if posLab?
          newX = (posLab.x * viewBoxDim.width) + viewBoxDim.x
          newY = (posLab.y * viewBoxDim.height) + viewBoxDim.y

          l.x = newX
          l.y = newY

  getUserPositionedLabIds: () =>
    _.map @userPositionedLabs, (e) -> e.id
