import _ from 'lodash'

// This class interacts with Displayr's state mechanism
// Careful with alterations here as very old state types need to be defended against

class State {
  constructor (stateObj, stateChangedCallback, X, Y, label) {
    this.stateObj = stateObj
    this.stateChangedCallback = stateChangedCallback
    if (!(_.isObject(this.stateObj))) {
      this.stateObj = {}
    }

    // NB If the plot data (i.e., X, Y, labels) has changed we reset all user state
    const storedX = this.isStoredInState('X') ? this.getStored('X') : []
    const storedY = this.isStoredInState('Y') ? this.getStored('Y') : []
    const storedLabel = this.isStoredInState('label') ? this.getStored('label') : []
    if (!_.isEqual(storedX, X) ||
           !_.isEqual(storedY, Y) ||
           !_.isEqual(storedLabel, label)) {
      this.stateObj = {}
      this.saveToState('X', X)
      this.saveToState('Y', Y)
      this.saveToState('label', label)
    }

    this.legendPts = this.isStoredInState('legendPts') ? _.uniq(this.getStored('legendPts')) : []
    this.userPositionedLabs = this.isStoredInState('userPositionedLabs') ? this.getStored('userPositionedLabs') : []
    this.algoPositionedLabs = this.isStoredInState('algoPositionedLabs') ? this.getStored('algoPositionedLabs') : []
  }

  isStoredInState (key) {
    return _.has(this.stateObj, key)
  }

  getStored (key) {
    if (this.isStoredInState(key)) { return this.stateObj[key] }
    throw new Error(`key '${key} not in state`)
  }

  saveToState (key, val) {
    if (_.isFunction(this.stateChangedCallback)) {
      this.stateObj[key] = val
      this.stateChangedCallback(this.stateObj)
    }
  }

  pushLegendPt (id) {
    this.legendPts.push(id)
    _.remove(this.userPositionedLabs, e => e.id === id)
    this.saveToState('legendPts', this.legendPts)
    this.saveToState('userPositionedLabs', this.userPositionedLabs)
  }

  pullLegendPt (id) {
    _.pull(this.legendPts, id)
    this.saveToState('legendPts', this.legendPts)
  }

  resetStateLegendPtsAndPositionedLabs () {
    this.legendPts = []
    this.userPositionedLabs = []
    this.algoPositionedLabs = []
    this.saveToState('legendPts', [])
    this.saveToState('userPositionedLabs', [])
    this.saveToState('algoPositionedLabs', [])
  }

  getLegendPts () {
    return this.legendPts
  }

  hasStateBeenAlteredByUser () {
    if (this.legendPts.length > 0) return true
    if (this.userPositionedLabs.length > 0) return true
    return false
  }

  isLegendPtsSynced (currLegendPts) {
    // KZ TODO this equality check looks insufficient
    return (this.legendPts.length === 0) || (this.legendPts.length === currLegendPts.length)
  }

  pushUserPositionedLabel (id, labx, laby, viewBoxDim) {
    _.remove(this.userPositionedLabs, e => e.id === id)

    this.userPositionedLabs.push({
      id,
      x: (labx - viewBoxDim.x) / viewBoxDim.width,
      y: (laby - viewBoxDim.y) / viewBoxDim.height
    })
    this.saveToState('userPositionedLabs', this.userPositionedLabs)
  }

  pushAlgoPositionedLabel (id, labx, laby, viewBoxDim) {
    _.remove(this.algoPositionedLabs, e => e.id === id)

    this.algoPositionedLabs.push({
      id,
      x: (labx - viewBoxDim.x) / viewBoxDim.width,
      y: (laby - viewBoxDim.y) / viewBoxDim.height
    })
  }

  updateLabelsWithUserPositionedData (labels, viewBoxDim) {
    if (!_.isEmpty(this.userPositionedLabs)) {
      _(labels).each((label) => {
        const matchingLabel = _.find(this.userPositionedLabs, e => e.id === label.id)
        if (matchingLabel != null) {
          label.x = (matchingLabel.x * viewBoxDim.width) + viewBoxDim.x
          label.y = (matchingLabel.y * viewBoxDim.height) + viewBoxDim.y
        }
      })
    }
  }

  getUserPositionedLabIds () {
    return _.map(this.userPositionedLabs, e => e.id)
  }

  getAllPositionedLabsIs () {
    const combinedLabs = this.userPositionedLabs.concat(this.algoPositionedLabs)
    return _.map(combinedLabs, e => e.id)
  }

  getPositionedLabIds (currentViewboxdim) {
    if (_.isEmpty(this.viewBoxDim)) {
      // Since viewBoxDim is null, that means it is the first run of the algorithm
      return this.getUserPositionedLabIds()
    } else {
      // Compare size of viewbox with prev and run algo if different
      if (currentViewboxdim.height === this.viewBoxDim.height &&
          currentViewboxdim.width === this.viewBoxDim.width &&
          currentViewboxdim.x === this.viewBoxDim.x &&
          currentViewboxdim.y === this.viewBoxDim.y) {
        return this.getAllPositionedLabsIs()
      } else {
        this.viewBoxDim = currentViewboxdim
        return this.getUserPositionedLabIds()
      }
    }
  }

  saveAlgoPositionedLabs (labels, viewBoxDim) {
    if (!_.isEmpty(this.viewBoxDim) && (viewBoxDim.height !== this.viewBoxDim.height &&
                                     viewBoxDim.width !== this.viewBoxDim.width &&
                                     viewBoxDim.x !== this.viewBoxDim.x &&
                                     viewBoxDim.y !== this.viewBoxDim.y)) {
      _.map(labels, lab => {
        if (!_.some(this.userPositionedLabs, userlab => userlab.id === lab.id)) {
          this.pushAlgoPositionedLabel(lab.id, lab.x, lab.y, viewBoxDim)
        }
      })
      this.saveToState('algoPositionedLabs', this.algoPositionedLabs)
      this.viewBoxDim = viewBoxDim
    }
  }
}

module.exports = State
