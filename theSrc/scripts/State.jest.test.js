const State = require('./State.js')

describe('VIS-576', function () {
  test('X, Y, label properties preserved after state reset', function () {
    // This is the state object associated with a widget, not to be confused with the instance "state" of the class State
    const stateObj = {}
    const X = [1, 2, 3]
    const Y = [4, 5, 6]
    const label = ['A', 'B', 'C']
    const viewBox = {
      width: 800,
      height: 600,
      x: 200,
      y: 100,
    }
    let isReset = false
    const stateChangedCallback = obj => {
      if (isReset) {
        expect(obj).toEqual({ X: X, Y: Y, label: label })
      }
    }

    const state = new State(stateObj, stateChangedCallback, X, Y, label)
    state.pushUserPositionedLabel(2, 600, 400, viewBox)
    isReset = true
    state.resetState()
  })
})
