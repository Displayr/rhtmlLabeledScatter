'use strict'

class LabeledScatter

  @plot = null
  @data = null

  constructor: (@width, @height) ->

  resize: (el, width, height) ->
    console.log 'resize'
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
    return @

  draw: (data, el) ->
    svg = d3.select(el)
            .append('svg')
            .attr('width', @width)
            .attr('height', @height)
            .attr('class', 'plot-container')

    if data.X? and data.Y?
      @data = data

    else # For debuggning in browser
      @data = testData

    @plot = new RectPlot(@width,
                        @height,
                        @data.X,
                        @data.Y,
                        @data.group,
                        @data.label,
                        svg,
                        @data.fixedAspectRatio,
                        @data.xTitle,
                        @data.yTitle,
                        @data.colors,
                        @data.grid,
                        @data.origin,
                        @data.title,
                        @data.titleFontFamily,
                        @data.yTitleFontFamily,
                        @data.xTitleFontFamily)
    @plot.draw()
    return @
