import _ from 'lodash'
import Utils from './utils/Utils'

/* To Refactor:
 *   * the constructor of PlotColors has a side effect that creates the legendGroup used by PlotData etc
 *
 */

// This class assigns colors to the plot data
// If group array is supplied, it will couple the array with the color wheel
// If no group array is supplied, colors are rotated through the color wheel
class PlotColors {
  constructor (plotData) {
    this.plotData = plotData
    this.legend = plotData.legend

    this.groupToColorMap = {}

    const uniqueGroups = _.uniq(this.plotData.group || [])
    _.forEach(uniqueGroups, (groupName, i) => {
      const newColor = this.getNewColor(i)
      this.legend.addGroup(groupName, newColor, this.getFillOpacity(this.plotData.transparency))
      this.groupToColorMap[groupName] = newColor
    })
  }

  getColorFromGroup (group) {
    return this.groupToColorMap[group]
  }

  getNewColor (index) {
    return this.plotData.colorWheel[index % this.plotData.colorWheel.length]
  }

  getColor (i) {
    if (Utils.isArr(this.plotData.group)) {
      return this.getColorFromGroup(this.plotData.group[i])
    } else {
      return this.getNewColor(0) // takes the first color in the color wheel since all pts in same grp
    }
  }

  getFillOpacity (transparency) {
    if (Utils.isNum(transparency)) {
      return transparency
    } else if (Utils.isArr(this.plotData.Z)) {
      return 0.3 // If data has a Z dimension, then default to 0.3 (semi-transparent)
    } else {
      return 1 // If data has no Z dimension, then default to 1 (opaque)
    }
  }
}

module.exports = PlotColors
