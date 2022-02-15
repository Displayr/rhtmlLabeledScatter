const State = require('./State.js')

describe('VIS-576', function () {
  test('X, Y, label properties preserved after state reset', function () {
    const X = [1, 2, 3]
    const Y = [4, 5, 6]
    const label = ['A', 'B', 'C']
    const viewBox = {
      width: 800,
      height: 600,
      x: 200,
      y: 100,
    }
    let isCallbackFromReset = false
    const stateChangedCallback = obj => {
      if (isCallbackFromReset) {
        expect(obj).toEqual({ X: X, Y: Y, label: label, 'hiddenlabel.pts': [2], 'labelsMaxShown': 2 })
      }
    }

    const state = new State({}, stateChangedCallback, X, Y, label, 2)
    state.pushUserPositionedLabel(2, 600, 400, viewBox)
    state.updateHiddenLabelPt(0, true)
    isCallbackFromReset = true
    state.resetState()
  })
})

describe('VIS-572', function () {
  test('X, Y, label properties preserved after resize', function () {
    const X = [1, 2, 3]
    const Y = [4, 5, 6]
    const label = ['A', 'B', 'C']
    const viewBox = {
      width: 800,
      height: 600,
      x: 200,
      y: 100,
    }
    const newViewBox = {
      width: 1000,
      height: 800,
      x: 200,
      y: 100,
    }
    let isCallbackFromReset = false
    const stateChangedCallback = obj => {
      if (isCallbackFromReset) {
        expect(obj).toEqual({ X: X, Y: Y, label: label, userPositionedLabs: [], vb: newViewBox, 'hiddenlabel.pts': [], 'labelsMaxShown': undefined })
      }
    }

    const state = new State({}, stateChangedCallback, X, Y, label)
    state.pushUserPositionedLabel(2, 600, 400, viewBox)
    isCallbackFromReset = true
    state.resetStateOnResize(newViewBox)
  })
})
