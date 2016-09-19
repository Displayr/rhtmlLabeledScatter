# This class assigns colors to the plot data
# If group array is supplied, it will couple the array with the color wheel
# If no group array is supplied, colors are rotated through the color wheel

class PlotColors
  constructor: (@plotData) ->
    group = @plotData.group
    @plotData.legendGroups = []

    @groupToColorMap = {}

    if group?
      i = 0
      while i < group.length
        unless (_.some @plotData.legendGroups, (e) -> e.text is group[i])
          newColor = @getNewColor(@plotData.cIndex)
          @plotData.cIndex++

          @plotData.legendGroups.push {
            text:   group[i]
            color:  newColor
            r:       @plotData.legendDim.ptRadius
            anchor: 'start'
          }
          @groupToColorMap[group[i]] = newColor
        i++

  getColorFromGroup: (group) ->
    @groupToColorMap[group]

  getNewColor: (index) ->
    @plotData.colorWheel[ index % @plotData.colorWheel.length ]

  getColor: (i) ->
     if @plotData.group? and @plotData.group instanceof Array
       @getColorFromGroup(@plotData.group[i])
     else
       @getNewColor(0) # takes the first color in the color wheel since all pts in same grp
