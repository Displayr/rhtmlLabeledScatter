import _ from 'lodash'

// This class interacts with Displayr's state mechanism
// Careful with alterations here as very old state types need to be defended against

class State {
  constructor (stateObj, stateChangedCallback, X, Y, label, labelsMaxShown) {
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
      this.saveToState({ 'X': X, 'Y': Y, 'label': label, 'labelsMaxShown': labelsMaxShown })
    } else {
        // If X, Y or labels have changed whole saved state is discarded
        // but changing labelsMaxShown will only change the labels shown
        const storedLabelsMaxShown = this.isStoredInState('labelsMaxShown') ? this.getStored('labelsMaxShown') : null
        if (storedLabelsMaxShown !== labelsMaxShown) {
            delete this.stateObj['labelsMaxShown']
            delete this.stateObj['hiddenlabel.pts']
            this.saveToState({ 'labelsMaxShown': labelsMaxShown })
        }
    }

    this.numPoints = X.length
    this.labelsMaxShown = labelsMaxShown
    this.hiddenLabelPts = this.retrieveHiddenLabelPts()
    this.saveToState({ 'hiddenlabel.pts': this.hiddenLabelPts })
    this.legendPts = this.retrieveLegendPts()
    this.userPositionedLabs = this.isStoredInState('userPositionedLabs') ? this.getStored('userPositionedLabs') : []
    // this.algoPositionedLabs = this.isStoredInState('algoPositionedLabs') ? this.getStored('algoPositionedLabs') : []
    this.vb = this.isStoredInState('vb') ? this.getStored('vb') : {}
  }

  retrieveLegendPts () {
    // Older version of state key was 'legendPts', newer renamed to 'legend.pts'
    // Note: older state name will automatically be updated upon reset
    if (this.isStoredInState('legendPts')) {
      return _.uniq(this.getStored('legendPts'))
    } else {
      return (this.isStoredInState('legend.pts') ? _.uniq(this.getStored('legend.pts')) : [])
    }
  }

  initialHiddenLabelPts () {
    var tmp = []
    if (!(this.labelsMaxShown === null || this.labelsMaxShown < 0)) {
      for (var i = this.labelsMaxShown; i < this.numPoints; i++) tmp.push(i)
    }
    return (tmp)
  }

  retrieveHiddenLabelPts () {
    if (this.isStoredInState('hiddenlabel.pts')) {
      return (_.uniq(this.getStored('hiddenlabel.pts')))
    } else if (this.labelsMaxShown === null || this.labelsMaxShown < 0) {
      return []
    } else {
      return (this.initialHiddenLabelPts())
    }
  }

  isStoredInState (key) {
    return _.has(this.stateObj, key)
  }

  getStored (key) {
    if (this.isStoredInState(key)) { return this.stateObj[key] }
    throw new Error(`key '${key} not in state`)
  }

  saveToState (saveObj) {
    if (_.isFunction(this.stateChangedCallback)) {
      _.map(saveObj, (val, key) => (this.stateObj[key] = val))
      this.stateChangedCallback(this.stateObj)
    }
  }

  resetState () {
    if (_.isFunction(this.stateChangedCallback)) {
      delete this.stateObj['userPositionedLabs']
      delete this.stateObj['vb']
      delete this.stateObj['legend.pts']
      this.stateObj['hiddenlabel.pts'] = this.initialHiddenLabelPts()
      this.stateChangedCallback(this.stateObj)
    }
  }

  updateHiddenLabelPt (id, hide) {
    if (hide) {
        this.hiddenLabelPts.push(id)
    } else {
        _.pull(this.hiddenLabelPts, id)
    }
    this.saveToState({ 'hiddenlabel.pts': this.hiddenLabelPts })
  }

  pushLegendPt (id) {
    this.legendPts.push(id)
    _.remove(this.userPositionedLabs, e => e.id === id)
    // this.algoPositionedLabs = []
    this.saveToState({ 'legend.pts': this.legendPts,
      'userPositionedLabs': this.userPositionedLabs })
      // 'algoPositionedLabs': this.algoPositionedLabs})
  }

  pullLegendPt (id) {
    _.pull(this.legendPts, id)
    // this.algoPositionedLabs = []
    this.saveToState({ 'legend.pts': this.legendPts }) // , 'algoPositionedLabs': this.algoPositionedLabs})
  }

  resetStateOnResize (vb) {
    this.userPositionedLabs = []
    this.updateViewBox(vb)
    this.stateObj.vb = this.vb
    this.stateObj.userPositionedLabs = []
    this.saveToState(this.stateObj)
  }

  resetStateLegendPtsAndPositionedLabs () {
    this.legendPts = []
    this.userPositionedLabs = []
    this.hiddenLabelPts = this.initialHiddenLabelPts()
    // this.algoPositionedLabs = []
    this.vb = {}
    this.resetState()
  }

  getLegendPts () {
    return this.legendPts
  }

  hasStateBeenAlteredByUser () {
    if (this.legendPts.length > 0) return true
    if (this.userPositionedLabs.length > 0) return true
    if (!_.isEqual(this.hiddenLabelPts, this.initialHiddenLabelPts())) return true
    return false
  }

  isLegendPtsSynced (currLegendPts) {
    // KZ TODO this equality check looks insufficient
    return (this.legendPts.length === 0) || (this.legendPts.length === currLegendPts.length)
  }

  updateViewBoxAndSave (vb) {
    this.updateViewBox(vb)
    this.saveToState({ 'vb': this.vb })
  }

  updateViewBox (vb) {
    this.vb = {
      width: vb.width,
      height: vb.height,
      x: vb.x,
      y: vb.y,
    }
  }

  pushUserPositionedLabel (id, labx, laby, vb) {
    // _.remove(this.algoPositionedLabs, e => e.id === id)
    _.remove(this.userPositionedLabs, e => e.id === id)

    this.userPositionedLabs.push({
      id,
      x: (labx - vb.x) / vb.width,
      y: (laby - vb.y) / vb.height,
    })
    this.updateViewBox(vb)
    this.saveToState({ 'vb': this.vb, 'userPositionedLabs': this.userPositionedLabs })
  }

  updateLabelsWithPositionedData (labels, vb) {
    const combinedLabs = this.userPositionedLabs // .concat(this.algoPositionedLabs)
    if (!_.isEmpty(combinedLabs)) {
      _(labels).each((label) => {
        const matchingLabel = _.find(combinedLabs, e => e.id === label.id)
        if (matchingLabel != null) {
          label.x = (matchingLabel.x * vb.width) + vb.x
          label.y = (matchingLabel.y * vb.height) + vb.y
        }
      })
    }
  }

  getUserPositionedLabIds () {
    return _.map(this.userPositionedLabs, e => e.id)
  }

  getAllPositionedLabsIds () {
    const combinedLabs = this.userPositionedLabs // .concat(this.algoPositionedLabs)
    return _.map(combinedLabs, e => e.id)
  }

  getPositionedLabIds (currentvb) {
    if (_.isEmpty(this.vb)) {
      // console.log(this.getUserPositionedLabIds())
      // Since vb is null, that means it is the first run of the algorithm
      return this.getUserPositionedLabIds()
    } else {
      // Compare size of viewbox with prev and run algo if different
      if (currentvb.height === this.vb.height &&
          currentvb.width === this.vb.width &&
          currentvb.x === this.vb.x &&
          currentvb.y === this.vb.y) {
        return this.getAllPositionedLabsIds()
      } else {
        this.updateViewBoxAndSave(currentvb)
        return this.getUserPositionedLabIds()
      }
    }
  }

  // saveAlgoPositionedLabs (labels, vb) {
  //   _.map(labels, lab => {
  //     if (_.every(this.userPositionedLabs, userlab => userlab.id !== lab.id)) {
  //       this.pushAlgoPositionedLabel(lab.id, lab.x, lab.y, vb)
  //     }
  //   })
  //   this.updateViewBox(vb)
  //   this.saveToState({'vb': this.vb, 'algoPositionedLabs': this.algoPositionedLabs})
  // }

  // pushAlgoPositionedLabel (id, labx, laby, vb) {
  //   _.remove(this.algoPositionedLabs, e => e.id === id)
  //
  //   this.algoPositionedLabs.push({
  //     id,
  //     x: (labx - vb.x) / vb.width,
  //     y: (laby - vb.y) / vb.height
  //   })
  // }
}

module.exports = State
