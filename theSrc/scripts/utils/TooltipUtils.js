import _ from 'lodash'
import d3 from 'd3'
import $ from 'jquery'
const Utils = require('./Utils.js')

class TooltipUtils {
  static appendTooltips (anchors,
                         Z,
                         axisSettings, tooltipText) {
    let labelTxt,
      xlabel,
      ylabel,
      groupLabel

    let customTooltipTextGiven = _.isNull(tooltipText) ? false : (tooltipText.length === anchors.size())

    if (Utils.isArrOfNums(Z)) {
      anchors.append('title')
      .text((d, i) => {
        if (customTooltipTextGiven) {
          return tooltipText[i]
        } else {
          xlabel = Utils.getFormattedNum(d.labelX, axisSettings.x.decimals, axisSettings.x.prefix, axisSettings.x.suffix)
          ylabel = Utils.getFormattedNum(d.labelY, axisSettings.y.decimals, axisSettings.y.prefix, axisSettings.y.suffix)
          const zlabel = Utils.getFormattedNum(d.labelZ, axisSettings.z.decimals, axisSettings.z.prefix, axisSettings.z.suffix)
          labelTxt = d.label === '' ? d.labelAlt : d.label
          groupLabel = _.isUndefined(d.group) ? '' : `,  ${d.group}`
          return `${labelTxt}${groupLabel}\n${zlabel}\n(${xlabel}, ${ylabel})`
        }
      })
    } else {
      anchors.append('title')
      .text((d, i) => {
        if (customTooltipTextGiven) {
          return tooltipText[i]
        } else {
          xlabel = Utils.getFormattedNum(d.labelX, axisSettings.x.decimals, axisSettings.x.prefix, axisSettings.x.suffix)
          ylabel = Utils.getFormattedNum(d.labelY, axisSettings.y.decimals, axisSettings.y.prefix, axisSettings.y.suffix)
          labelTxt = d.label === '' ? d.labelAlt : d.label
          groupLabel = _.isUndefined(d.group) ? '' : `,  ${d.group}`
          return `${labelTxt}${groupLabel}\n(${xlabel}, ${ylabel})`
        }
      })
    }
  }

  static addSimpleTooltip (object, tooltipText) {
    d3.selectAll($(object)).append('title').text(tooltipText)
  }
}

module.exports = TooltipUtils
