import $ from 'jquery'
import d3 from 'd3'
import _ from 'lodash'
import { buildConfig } from './buildConfig'
import DisplayError from './DisplayError'
import RectPlot from './RectPlot'
import State from './State'
import 'babel-polyfill'

class LabeledScatter {
  getResizeDelayPromise () {
    if (_.isNull(this.resizeDelayPromise)) {
      this.resizeDelayPromise = new Promise((function () {
        return setTimeout(() => {
          console.log('rhtmlLabeledScatter: resize timeout')

          const resizeParams = this.resizeStack.pop()
          const el = resizeParams[0]
          const width = resizeParams[1]
          const height = resizeParams[2]
          this.resizeStack = []

          this.width = width
          this.height = height
          d3.select('.plot-container').remove()
          const svg = d3.select(el)
                  .append('svg')
                  .attr('width', this.width)
                  .attr('height', this.height)
                  .attr('class', 'plot-container rhtmlwidget-outer-svg')
          this.plot.resized(svg, this.width, this.height)
          this.resizeDelayPromise = null
        }
        , 500)
      }.bind(this)))
    }

    return this.resizeDelayPromise
  }

  constructor (element, width, height, stateChangedCallback) {
    this.rootElement = _.has(element, 'length') ? element[0] : element
    this.width = width
    this.height = height
    this.stateChangedCallback = stateChangedCallback
    this.resizeStack = []
    this.resizeDelayPromise = null
  }

  resize (el, width, height) {
    // NB this is where you should sanitise user input. Not in scope for this repo
    this.resizeStack.push([el, width, height])
    return this.getResizeDelayPromise()
  }

  setConfig (data) {
    // NB this is where you should sanitise user input. Not in scope for this repo
    // Reset widget if previous data present but not equal in params - see VIS-278
    if (!(_.isUndefined(this.data)) && !(_.isUndefined(this.plot)) && !(this.plot.isEqual(data))) {
      delete this.plot
    }
    if (!(_.isNull(data.X)) && !(_.isNull(data.Y))) {
      this.data = data
    }
  }

  setUserState (userStateInput) {
    // NB this is where you should sanitise user input. Not in scope for this repo
    let userState = null
    try {
      userState = (_.isString(userStateInput)) ? JSON.parse(userStateInput) : userStateInput
    } catch (error) {
      console.log(error)
      // NB it is (currently) ok to initialise with userState = null, so allow it as we deliberately choose to let this widget fail open (i.e. ignore state and continue rendering)
    }

    this.stateObj = new State(userState, this.stateChangedCallback, this.data.X, this.data.Y, this.data.label)
  }

  draw () {
    $(this.rootElement).find('*').remove()

    const svg = d3.select(this.rootElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'plot-container rhtmlwidget-outer-svg')

    // Error checking
    DisplayError.isAxisValid(this.data.X, this.rootElement, 'Given X values is neither array of nums, dates, or strings!')
    DisplayError.isAxisValid(this.data.Y, this.rootElement, 'Given Y values is neither array of nums, dates, or strings!')
    DisplayError.isEqualLength(this.data.X, this.data.Y, this.rootElement, 'Given X and Y arrays not equal length!')
    if (!_.isEmpty(this.data.Z)) {
      DisplayError.checkIfArrayOfPositiveNums(this.data.Z, this.rootElement, 'Given Z value is not array of positive numbers')
      DisplayError.isEqualLength(this.data.X, this.data.Z, this.rootElement, 'Given Z array not equal length to X and Y!')
    }

    const config = buildConfig(this.data, this.width, this.height)
    this.plot = new RectPlot({ config, stateObj: this.stateObj, svg })
    this.plot.doAsyncThings()
      .then(() => this.plot.draw())
      .catch(error => {
        console.log(`ERROR in plot init/draw calls:`)
        console.log(error)
        DisplayError.displayErrorMessage(this.rootElement, 'Internal error. See console logs for details')
      })
  }
}

module.exports = LabeledScatter
