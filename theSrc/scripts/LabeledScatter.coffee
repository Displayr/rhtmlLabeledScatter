'use strict'

class LabeledScatter

  @plot = null
  @data = null

  getResizeDelayPromise: () =>
    unless @resizeDelayPromise?
      @resizeDelayPromise = new Promise () =>
        setTimeout(() =>
          console.log 'rhtmlLabeledScatter: resize timeout'

          resizeParams = @resizeStack.pop()
          el = resizeParams[0]
          width = resizeParams[1]
          height = resizeParams[2]
          @resizeStack = []

          @width = width
          @height = height
          d3.select('.plot-container').remove()
          svg = d3.select(el)
                  .append('svg')
                  .attr('width', @width)
                  .attr('height', @height)
                  .attr('class', 'plot-container')
          @plot.setDim(svg, @width, @height)
          @plot.draw()
          @resizeDelayPromise = null
        , 500)

    @resizeDelayPromise

  constructor: (@width, @height, @stateChangedCallback) ->
    @resizeStack = []
    @resizeDelayPromise = null

  resize: (el, width, height) =>
    @resizeStack.push([el, width, height])
    @getResizeDelayPromise()

  draw: (data, el, state) ->
    svg = d3.select(el)
            .append('svg')
            .attr('width', @width)
            .attr('height', @height)
            .attr('class', 'plot-container')

    if data.X? and data.Y?
      @data = data

    console.log 'rhtmlLabeledScatter: received state'
    console.log state

    # Error checking
    DisplayError.get().checkIfArrayOfNums(@data.X, el, 'Given X value is not an array of numbers')
    DisplayError.get().checkIfArrayOfNums(@data.Y, el, 'Given Y value is not an array of numbers')

    stateObj = new State(state, @stateChangedCallback, @data.X, @data.Y, @data.label)

    @plot = new RectPlot(stateObj,
                        @width,
                        @height,
                        @data.X,
                        @data.Y,
                        @data.Z,
                        @data.group,
                        @data.label,
                        @data.labelAlt,
                        svg,
                        @data.fixedAspectRatio,
                        @data.xTitle,
                        @data.yTitle,
                        @data.zTitle,
                        @data.title,
                        @data.colors,
                        @data.transparency,
                        @data.grid,
                        @data.origin,
                        @data.originAlign,
                        @data.titleFontFamily,
                        @data.titleFontSize,
                        @data.titleFontColor,
                        @data.xTitleFontFamily,
                        @data.xTitleFontSize,
                        @data.xTitleFontColor,
                        @data.yTitleFontFamily,
                        @data.yTitleFontSize,
                        @data.yTitleFontColor,
                        @data.showLabels,
                        @data.labelsFontFamily,
                        @data.labelsFontSize,
                        @data.labelsFontColor,
                        @data.labelsLogoScale,
                        @data.xDecimals,
                        @data.yDecimals,
                        @data.zDecimals,
                        @data.xPrefix,
                        @data.yPrefix,
                        @data.zPrefix,
                        @data.xSuffix,
                        @data.ySuffix,
                        @data.zSuffix,
                        @data.legendShow,
                        @data.legendBubblesShow,
                        @data.legendFontFamily,
                        @data.legendFontSize,
                        @data.legendFontColor,
                        @data.axisFontFamily,
                        @data.axisFontColor,
                        @data.axisFontSize,
                        @data.pointRadius,
                        @data.xBoundsMinimum,
                        @data.xBoundsMaximum,
                        @data.yBoundsMinimum,
                        @data.yBoundsMaximum,
                        @data.xBoundsUnitsMajor,
                        @data.yBoundsUnitsMajor,
                        @data.trendLines,
                        @data.trendLinesLineThickness,
                        @data.trendLinesPointSize,
                        @data.plotBorderShow
    )
    @plot.draw()
    return @
