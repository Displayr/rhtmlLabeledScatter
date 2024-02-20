import $ from 'jquery'
import d3 from 'd3'
import _ from 'lodash'
import { buildConfig } from './buildConfig'
import DisplayError from './DisplayError'
import Plotly from 'plotly.js-dist-min'
import RectPlot from './RectPlot'
import State from './State'
import 'babel-polyfill'

import InsufficientHeightError from './exceptions/InsufficientHeightError'
import InsufficientWidthError from './exceptions/InsufficientWidthError'

class LabeledScatter {
  constructor (element, width, height, stateChangedCallback) {
    this.rootElement = _.has(element, 'length') ? element[0] : element
    this.width = width
    this.height = height
    this.stateChangedCallback = stateChangedCallback
    this.resizeStack = []
    this.resizeDelayPromise = null
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

    this.stateObj = new State(userState, this.stateChangedCallback, this.data.X, this.data.Y, this.data.label, this.data.labelsMaxShown)
  }

  async draw () {
    $(this.rootElement).find('*').remove()
    const container = d3.select(this.rootElement)
      .append('div')
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
    try {
      const plot_data = [];
      plot_data.push({
        x: this.data.X,
        y: this.data.Y,
        text: this.data.label,
        type: 'scatter',
        mode: 'markers',
        cliponaxis: 'false'
      })
      const plot_layout = { title: 'Title', showLegend: true,
        xaxis: { color: '#0000FF'},
        yaxis: { color: '#0000FF'}}
      const plot_config = { displayModeBar: false, editable: true}

    const plotlyChart = await Plotly.react(this.rootElement, plot_data, plot_layout, plot_config)
    this.drawScatterLabelLayer(plotlyChart._fullLayout, config)
    plotlyChart.on('plotly_afterplot', () => {
      this.drawScatterLabelLayer(plotlyChart._fullLayout, config)
    })

} catch (err) {
if (
  err.type === InsufficientHeightError.type ||
  err.type === InsufficientWidthError.type
    ) {
      console.log(`caught expected error '${err.type}' and aborted rendering`)
        DisplayError.displayEmptyErrorContainer(this.rootElement)
      } else {
        throw err
      }
    }
  }

  drawScatterLabelLayer(plotly_chart_layout, config) {
    d3.select('.scatterlabellayer').remove()
    const plot_area = d3.select(this.rootElement).select('.draglayer')
    const plot_bbox = plot_area.node().getBBox()
    const svg = plot_area
        .append('svg')
        .attr('class', 'scatterlabellayer')
        .style('position', 'absolute')
        .attr('x', plot_bbox.x)
        .attr('y', plot_bbox.y)
        .attr('width', plot_bbox.width)
        .attr('height', plot_bbox.height)
    config.yAxisFontColor = '#FF0000'
    config.xAxisFontColor = '#FF0000'
    config.axisFontColor = '#FF0000'
    config.labelsFontColor = '#FF0000'
    config.plotBorderColor = '#FF0000'
    config.showXAxis = false
    config.showYAxis = false
    config.title = ''
    config.xTitle = ''
    config.yTitle = ''
    config.subtitle = ''
    config.footer = ''
    config.colors[0] = '#FF0000'
    config.yBoundsMinimum = plotly_chart_layout.yaxis.range[0]
    config.yBoundsMaximum = plotly_chart_layout.yaxis.range[1]
    config.xBoundsMinimum = plotly_chart_layout.xaxis.range[0]
    config.xBoundsMaximum = plotly_chart_layout.xaxis.range[1]
    config.width = plot_bbox.width
    config.height = plot_bbox.height
    this.plot = new RectPlot({ config, stateObj: this.stateObj, svg })
    this.plot.draw()

  }

  resize (el, width, height) {
    // NB this is where you should sanitise user input. Not in scope for this repo
    this.resizeStack.push([el, width, height])
    return this.getResizeDelayPromise()
  }

  getResizeDelayPromise () {
    if (_.isNull(this.resizeDelayPromise)) {
      this.resizeDelayPromise = new Promise(() => {
        return setTimeout(() => {
          console.log('rhtmlLabeledScatter: resize timeout')

          const resizeParams = this.resizeStack.pop()
          const el = resizeParams[0]
          const width = resizeParams[1]
          const height = resizeParams[2]
          this.resizeStack = []

          this.width = width
          this.height = height

          if (typeof this.plot === 'undefined') {
            this.draw()
          } else {
            d3.select('.plot-container').remove()
            const svg = d3.select(el)
                    .append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .attr('class', 'plot-container rhtmlwidget-outer-svg')

            this.plot.resized(svg, this.width, this.height)
              .catch(err => {
                if (
                  err.type === InsufficientHeightError.type ||
                  err.type === InsufficientWidthError.type
                ) {
                  console.log(`caught expected error '${err.type}' and aborted rendering`)
                  DisplayError.displayEmptyErrorContainer(this.rootElement)
                } else {
                  throw err
                }
              })
          }

          // TODO this should be in a then/catch/finally attached to this.plot.resized but not going to attempt that now
          this.resizeDelayPromise = null
        }, 500)
      })
    }

    return this.resizeDelayPromise
  }
}

module.exports = LabeledScatter
