const State = require('./State.js')

describe('VIS-576', function () {
	test('X, Y, label properties preserved after state reset', function () {
		// This is the state object associated with a widget, not to be confused with the instance "state" of the class State
		const state_obj = {

		}
		const X = [1, 2, 3]
		const Y = [4, 5, 6]
		const label = ['A', 'B', 'C']
		const view_box = {
			width: 800,
			height: 600,
			x: 200,
			y: 100,
	    }
	    let is_reset = false;
		const state_changed_callback = obj => {
			if (is_reset) {
				expect(obj).toEqual({X: X, Y: Y, label: label })
			}
		}

		const state = new State(state_obj, state_changed_callback, X, Y, label)
		
		state.pushUserPositionedLabel(2, 600, 400, view_box)
		is_reset = true
		state.resetState()
	})
})