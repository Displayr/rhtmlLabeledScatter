import _ from 'lodash'
import autoBind from 'es6-autobind'
import PlotColors from './PlotColors'
import PlotLabel from './PlotLabel'
import LegendUtils from './utils/LegendUtils'
import Utils from './utils/Utils'
import DataTypeEnum from './utils/DataTypeEnum'
import d3 from 'd3'

// To Refactor:
//   * fixed aspect ratio code can (probably) be simplified : see Pictograph utils/geometryUtils.js
//

const labelTopPadding = 3 // TODO needs to be configurable, and is duplicated !
const extraPaddingProportion = 0.08
const extraBubblePaddingProportion = 0.05

class PlotData {
  constructor (X,
    Y,
    Z,
    xDataType,
    yDataType,
    xLevels,
    yLevels,
    group,
    label,
    labelAlt,
    vb,
    legend,
    colorWheel,
    fixedAspectRatio,
    originAlign,
    pointRadius,
    bounds,
    transparency,
    legendSettings
  ) {
    autoBind(this)
    if (xDataType === DataTypeEnum.date) {
      this.X = _.map(X, d => d.getTime())
    } else {
      this.X = X
      this.xLevels = xLevels
    }
    if (yDataType === DataTypeEnum.date) {
      this.Y = _.map(Y, d => d.getTime())
    } else {
      this.Y = Y
      this.yLevels = yLevels
    }
    this.Z = Z
    this.xDataType = xDataType
    this.yDataType = yDataType
    this.group = group
    this.label = label
    this.labelAlt = labelAlt
    this.vb = vb
    this.legend = legend
    this.colorWheel = colorWheel
    this.fixedAspectRatio = fixedAspectRatio
    this.originAlign = originAlign
    this.pointRadius = pointRadius
    this.bounds = bounds
    this.transparency = transparency
    this.origX = this.X.slice(0)
    this.origY = this.Y.slice(0)
    this.normX = this.X.slice(0)
    this.normY = this.Y.slice(0)
    if (Utils.isArrOfNums(this.Z) && (this.Z.length === this.X.length)) { this.normZ = this.Z.slice() }
    this.outsidePlotPtsId = []
    this.hiddenLabelsId = []
    // this.legendPts = []
    this.outsidePlotCondensedPts = []
    this.legendRequiresRedraw = false
    this.legendSettings = legendSettings

    if (this.X.length === this.Y.length) {
      this.len = (this.origLen = X.length)
      if (Utils.isArrOfNums(this.Z)) { this.normalizeZData() }
      this.normalizeData()
      this.plotColors = new PlotColors(this)
      this.labelNew = new PlotLabel(this.label, this.labelAlt, this.vb.labelLogoScale)
    } else {
      throw new Error('Inputs X and Y lengths do not match!')
    }
  }

  revertMinMax () {
    this.minX = this.minXold
    this.maxX = this.maxXold
    this.minY = this.minYold
    this.maxY = this.maxYold
  }

  calculateMinMax () {
    this.minXold = this.minX
    this.maxXold = this.maxX
    this.minYold = this.minY
    this.maxYold = this.maxY

    const ptsOut = this.outsidePlotPtsId
    const notMovedX = _.filter(this.origX, (val, key) => !(_.includes(ptsOut, key)))
    const notMovedY = _.filter(this.origY, (val, key) => !(_.includes(ptsOut, key)))

    this.minX = _.min(notMovedX)
    this.maxX = _.max(notMovedX)
    this.minY = _.min(notMovedY)
    this.maxY = _.max(notMovedY)

    // originAlign: compensates to make sure origin lines are on axis
    if (this.originAlign) {
      if (this.minX > 0) {
        this.minX = 0
        this.minXAlignedToOrigin = true
      }
      if (this.maxX < 0) {
        this.maxX = 0
        this.maxXAlignedToOrigin = true
      }
      if (this.minY > 0) {
        this.minY = 0
        this.minYAlignedToOrigin = true
      }
      if (this.maxY < 0) {
        this.maxY = 0
        this.maxYAlignedToOrigin = true
      }
    }

    this.addPaddingToBounds()

    // Fixed aspect ratio computations: not easily simplified as the boundaries cannot be reduced
    if (this.fixedAspectRatio) {
      const rangeX = this.maxX - this.minX
      const rangeY = this.maxY - this.minY
      const rangeAR = Math.abs(rangeX / rangeY)
      const widgetAR = (this.vb.width / this.vb.height)
      const rangeToWidgetARRatio = widgetAR / rangeAR

      if (widgetAR >= 1) {
        if (rangeX > rangeY) {
          if (rangeToWidgetARRatio > 1) {
            this.maxX += (((widgetAR * rangeY) - rangeX) / 2)
            this.minX -= (((widgetAR * rangeY) - rangeX) / 2)
          } else {
            this.maxY += (((1 / widgetAR) * rangeX) - rangeY) / 2
            this.minY -= (((1 / widgetAR) * rangeX) - rangeY) / 2
          }
        } else if (rangeX < rangeY) {
          this.maxX += ((widgetAR * rangeY) - rangeX) / 2
          this.minX -= ((widgetAR * rangeY) - rangeX) / 2
        }
      } else if (rangeX < rangeY) {
        if (rangeToWidgetARRatio < 1) {
          this.maxY += (((1 / widgetAR) * rangeX) - rangeY) / 2
          this.minY -= (((1 / widgetAR) * rangeX) - rangeY) / 2
        } else {
          this.maxX += ((widgetAR * rangeY) - rangeX) / 2
          this.minX -= ((widgetAR * rangeY) - rangeX) / 2
        }
      } else if (rangeX > rangeY) {
        this.maxY += (((1 / widgetAR) * rangeX) - rangeY) / 2
        this.minY -= (((1 / widgetAR) * rangeX) - rangeY) / 2
      }
    }

    // TODO KZ this should be done first to skip the wasted computation (unless there are side effect in the above) ??
    // If user has sent x and y boundaries, these hold higher priority
    if (Utils.isNum(this.bounds.xmax)) { this.maxX = this.bounds.xmax }
    if (Utils.isNum(this.bounds.xmin)) { this.minX = this.bounds.xmin }
    if (Utils.isNum(this.bounds.ymax)) { this.maxY = this.bounds.ymax }
    if (Utils.isNum(this.bounds.ymin)) { this.minY = this.bounds.ymin }
  }

  normalizeData () {
    // TODO KZ remove this side effect. Plus Data.calcMinMax is called over and over in the code. Why ??
    let i
    this.calculateMinMax()
    this.calculateOrdinalPaddingProportions()

    // create list of movedOffPts that need markers
    this.outsidePlotMarkers = []
    this.outsidePlotMarkersIter = 0

    _.forEach(this.legend.pts, (lp, i) => {
      const id = lp.id
      let draggedNormX = (this.X[id] - this.minX) / (this.maxX - this.minX)
      let draggedNormY = (this.Y[id] - this.minY) / (this.maxY - this.minY)
      // TODO KZ the ++ should be immed. after the use of the iter !
      const newMarkerId = this.outsidePlotMarkersIter
      lp.markerId = newMarkerId

      if ((Math.abs(draggedNormX) > 1) || (Math.abs(draggedNormY) > 1) ||
         (draggedNormX < 0) || (draggedNormY < 0)) {
        let markerTextY,
          x1,
          y1
        draggedNormX = draggedNormX > 1 ? 1 : draggedNormX
        draggedNormX = draggedNormX < 0 ? 0 : draggedNormX
        draggedNormY = draggedNormY > 1 ? 1 : draggedNormY
        draggedNormY = draggedNormY < 0 ? 0 : draggedNormY
        const x2 = (draggedNormX * this.vb.width) + this.vb.x
        const y2 = ((1 - draggedNormY) * this.vb.height) + this.vb.y

        let markerTextX = (markerTextY = 0)
        const numDigitsInId = Math.ceil(Math.log(newMarkerId + 1.1) / Math.LN10)
        if (draggedNormX === 1) { // right bound
          x1 = x2 + this.legend.getMarkerLen()
          y1 = y2
          markerTextX = x1
          markerTextY = y1 + (this.legend.getMarkerTextSize() / 2)
        } else if (draggedNormX === 0) { // left bound
          x1 = x2 - this.legend.getMarkerLen()
          y1 = y2
          markerTextX = x1 - (this.legend.getMarkerCharWidth() * (numDigitsInId + 1))
          markerTextY = y1 + (this.legend.getMarkerTextSize() / 2)
        } else if (draggedNormY === 1) { // top bound
          x1 = x2
          y1 = y2 + (-draggedNormY * this.legend.getMarkerLen())
          markerTextX = x1 - (this.legend.getMarkerCharWidth() * (numDigitsInId))
          markerTextY = y1
        } else if (draggedNormY === 0) { // bot bound
          x1 = x2
          y1 = y2 + this.legend.getMarkerLen()
          markerTextX = x1 - (this.legend.getMarkerCharWidth() * (numDigitsInId))
          markerTextY = y1 + this.legend.getMarkerTextSize()
        }

        // New markerLabel starts at index = 1 since it is user facing
        this.outsidePlotMarkers.push({
          markerLabel: newMarkerId + 1,
          ptId: id,
          x1,
          y1,
          x2,
          y2,
          markerTextX,
          markerTextY,
          width: this.legend.getMarkerWidth(),
          color: lp.color,
        })

        // if the points were condensed, remove point
        this.outsidePlotCondensedPts = _.filter(this.outsidePlotCondensedPts, e => e.dataId !== id)
        this.len = this.origLen - this.outsidePlotMarkers.length
      } else { // no marker required, but still inside plot window
        console.log('rhtmlLabeledScatter: Condensed point added')
        const condensedPtsDataIdArray = _.map(this.outsidePlotCondensedPts, e => e.dataId)
        if (!_.includes(condensedPtsDataIdArray, id)) {
          this.outsidePlotCondensedPts.push({
            dataId: id,
            markerId: newMarkerId,
          })
        }
      }
      this.outsidePlotMarkersIter++
    })

    // Remove pts that are outside plot if user bounds were set
    this.outsideBoundsPtsId = []
    if (_.some(this.bounds, b => Utils.isNum(b))) {
      i = 0
      while (i < this.origLen) {
        if (!_.includes(this.outsideBoundsPtsId, i)) {
          if ((this.X[i] < this.minX) || (this.X[i] > this.maxX) ||
             (this.Y[i] < this.minY) || (this.Y[i] > this.maxY)) {
            this.outsideBoundsPtsId.push(i)
          }
        }
        i++
      }
    }

    i = 0
    return (() => {
      const result = []
      while (i < this.origLen) {
        this.normX[i] = this.minX === this.maxX ? this.minX : (this.X[i] - this.minX) / (this.maxX - this.minX)
        // copy/paste bug using x when calculating Y. WTF is this even doing ?
        this.normY[i] = this.minY === this.maxY ? this.minX : (this.Y[i] - this.minY) / (this.maxY - this.minY)
        result.push(i++)
      }
      return result
    })()
  }

  normalizeZData () {
    const legendUtils = LegendUtils

    const maxZ = _.max(this.Z)
    if (this.legendSettings.showBubblesInLegend) {
      this.legendBubbles = legendUtils.getLegendBubbles(maxZ, this.legendSettings.zPrefix, this.legendSettings.zSuffix)
      this.normZ = legendUtils.normalizeZValues(this.Z, this.legendBubbles.maxSize)
    } else {
      this.normZ = legendUtils.normalizeZValues(this.Z, maxZ)
    }
  }

  getPtsAndLabs (calleeName) {
    console.log(`getPtsAndLabs(${calleeName})`)
    return Promise.all(this.labelNew.getLabels()).then((resolvedLabels) => {
      // resolvedLabels is array of { height, width, label, url }
      // console.log(`resolvedLabels for getPtsandLabs callee name ${calleeName}`)
      // console.log(resolvedLabels)

      this.pts = []
      this.lab = []

      let i = 0
      while (i < this.origLen) {
        // TODO this assumes the IDs are the indexes
        if ((!_.includes(this.outsidePlotPtsId, i)) || _.includes((_.map(this.outsidePlotCondensedPts, 'dataId')), i)) {
          let ptColor
          let x = 0
          let y = 0
          if (this.xDataType === DataTypeEnum.ordinal) {
            const scaleOrdinal = d3.scale.ordinal().domain(this.xLevels).rangePoints([0, 1])
            const nonPaddingProportion = 1 - this.ordinalMinXPaddingProportion - this.ordinalMaxXPaddingProportion
            x = scaleOrdinal(this.X[i]) * this.vb.width * nonPaddingProportion + this.vb.x + this.vb.width * this.ordinalMinXPaddingProportion
          } else {
            x = (this.normX[i] * this.vb.width) + this.vb.x
          }
          if (this.yDataType === DataTypeEnum.ordinal) {
            const scaleOrdinal = d3.scale.ordinal().domain(this.yLevels).rangePoints([0, 1])
            const nonPaddingProportion = 1 - this.ordinalMinYPaddingProportion - this.ordinalMaxYPaddingProportion
            y = scaleOrdinal(this.Y[i]) * this.vb.height * nonPaddingProportion + this.vb.y + this.vb.height * this.ordinalMinYPaddingProportion
          } else {
            y = ((1 - this.normY[i]) * this.vb.height) + this.vb.y
          }
          let r = this.pointRadius
          if (Utils.isArrOfNums(this.Z)) {
            const legendUtils = LegendUtils
            r = legendUtils.normalizedZtoRadius(this.pointRadius, this.normZ[i])
          }
          const fillOpacity = this.plotColors.getFillOpacity(this.transparency)

          let { label, width, height, url } = resolvedLabels[i]
          const labelAlt = ((this.labelAlt !== null ? this.labelAlt[i] : undefined) !== null) ? this.labelAlt[i] : ''
          const labelY = y - r - labelTopPadding

          const labelZ = Utils.isArrOfNums(this.Z) ? this.Z[i].toString() : ''
          let fontSize = this.vb.labelFontSize

          // If pt has been already condensed
          if (_.includes((_.map(this.outsidePlotCondensedPts, e => e.dataId)), i)) {
            const pt = _.find(this.outsidePlotCondensedPts, e => e.dataId === i)
            label = pt.markerId + 1
            fontSize = this.vb.labelSmallFontSize
            url = ''
            width = null
            height = null
          }

          let fontColor = (ptColor = this.plotColors.getColor(i))
          let fontOpacity = _.includes(this.hiddenLabelsId, i) ? 0.0 : 1.0
          if ((this.vb.labelFontColor != null) && !(this.vb.labelFontColor === '')) { fontColor = this.vb.labelFontColor }
          const group = (this.group != null) ? this.group[i] : ''
          this.pts.push({ x, y, r, label, labelAlt, labelX: this.origX[i].toString(), labelY: this.origY[i].toString(), labelZ, group, color: ptColor, id: i, fillOpacity, hideLabel: fontOpacity === 0.0 })
          this.lab.push({ x, y: labelY, color: fontColor, opacity: fontOpacity, id: i, fontSize, fontFamily: this.vb.labelFontFamily, text: label, width, height, url })
        }
        i++
      }

      // Remove pts outside plot because user bounds set
      return (() => {
        _.forEach(this.outsideBoundsPtsId, (p, i) => {
          if (!_.includes(this.outsidePlotPtsId, p)) {
            this.addElemToLegend(p)
          }
        })
        this.setLegend()
      })()
    }).catch(err => console.log(err))
  }

  setLegend () {
    this.legend.setLegendGroupsAndPts(this.vb, this.legendBubbles, this.pointRadius)
  }

  isOutsideViewBox (lab) {
    const left = lab.x - (lab.width / 2)
    const right = lab.x + (lab.width / 2)
    const top = lab.y - lab.height
    const bot = lab.y

    // const isAnyPartOfLabOutside = ((left < this.vb.x) ||
    //                               (right > (this.vb.x + this.vb.width)) ||
    //                               (top < this.vb.y) ||
    //                               (bot > (this.vb.y + this.vb.height)))
    const isAllOfLabOutside = ((right < this.vb.x) ||
                               (left > (this.vb.x + this.vb.width)) ||
                               (bot < this.vb.y) ||
                               (top > (this.vb.y + this.vb.height)))
    return isAllOfLabOutside
  }

  isLegendPtOutsideViewBox (lab) {
    const left = lab.x
    const right = lab.x + lab.width
    const top = lab.y - lab.height
    const bot = lab.y

    return ((left < this.vb.x) ||
        (right > (this.vb.x + this.vb.width)) ||
        (top < this.vb.y) ||
        (bot > (this.vb.y + this.vb.height)))
  }

  toggleLabelShow (id) {
    const hidden = _.includes(this.hiddenLabelsId, id)
    const index = this.lab.findIndex(p => p.id === Number(id))
    if (hidden) {
        _.pull(this.hiddenLabelsId, id)
        this.pts[index].hideLabel = false
        this.lab[index].opacity = 1.0
    } else {
        this.hiddenLabelsId.push(id)
        this.pts[index].hideLabel = true
        this.lab[index].opacity = 0.0
    }
    return (this.pts[index].hideLabel)
  }

  addElemToLegend (id) {
    const checkId = e => e.id === id
    const movedPt = _.remove(this.pts, checkId)
    const movedLab = _.remove(this.lab, checkId)
    this.legend.addPt(id, movedPt, movedLab)

    this.outsidePlotPtsId.push(id)
    this.normalizeData()
    this.getPtsAndLabs('PlotData.addElemToLegend')
    this.legendRequiresRedraw = true
  }

  removeLegendPtFromData (id) {
   const legendPt = this.legend.removePt(id)
    this.pts.push(legendPt.pt)
    this.lab.push(legendPt.lab)

    _.remove(this.outsidePlotPtsId, i => i === id)
    _.remove(this.outsidePlotCondensedPts, i => i.dataId === id)
  }

  removeElemFromLegend (id) {
    this.removeLegendPtFromData(id)
    this.normalizeData()
    this.getPtsAndLabs('PlotData.removeElemFromLegend')
    this.setLegend()
  }

  syncHiddenLabels (labels) {
    this.hiddenLabelsId = []
    _.map(labels, ii => this.toggleLabelShow(ii))
  }

  resetPtsAndLabs (initialLabs) {
    _.forEachRight(this.legend.pts, lp => {
      if (!_.isUndefined(lp)) this.removeLegendPtFromData(lp.id)
    })

    this.hiddenLabelsId = initialLabs
    this.normalizeData()
    this.getPtsAndLabs('PlotData.resetPtsAndLabs')
    this.setLegend()
  }

  getTextLabels () {
    return _.filter(this.lab, l => l.url === '')
  }

  getImgLabels () {
    return _.filter(this.lab, l => l.url !== '')
  }

  // For non-ordinal coordinates, augment the min and max bounds with some padding.
  // The padding includes marker and bubble radii as well as some extra space.
  addPaddingToBounds () {
    const rangeX = this.maxX - this.minX
    const rangeY = this.maxY - this.minY

    const r = this.pointRadius
    if (Utils.isArrOfNums(this.Z)) {
      let bubblePaddingMinX = 0
      let bubblePaddingMaxX = 0
      let bubblePaddingMinY = 0
      let bubblePaddingMaxY = 0

      for (let i = 0; i < this.origLen; i++) {
        if (!_.includes(this.outsideBoundsPtsId, i)) {
          const bubbleRadius = LegendUtils.normalizedZtoRadius(r, this.normZ[i])
          const bubblePaddingMinXCandidate = bubbleRadius * rangeX / this.vb.width - (this.origX[i] - this.minX)
          if (bubblePaddingMinXCandidate > bubblePaddingMinX) {
            bubblePaddingMinX = bubblePaddingMinXCandidate
          }
          const bubblePaddingMaxXCandidate = bubbleRadius * rangeX / this.vb.width - (this.maxX - this.origX[i])
          if (bubblePaddingMaxXCandidate > bubblePaddingMaxX) {
            bubblePaddingMaxX = bubblePaddingMaxXCandidate
          }
          const bubblePaddingMinYCandidate = bubbleRadius * rangeY / this.vb.height - (this.origY[i] - this.minY)
          if (bubblePaddingMinYCandidate > bubblePaddingMinY) {
            bubblePaddingMinY = bubblePaddingMinYCandidate
          }
          const bubblePaddingMaxYCandidate = bubbleRadius * rangeY / this.vb.height - (this.maxY - this.origY[i])
          if (bubblePaddingMaxYCandidate > bubblePaddingMaxY) {
            bubblePaddingMaxY = bubblePaddingMaxYCandidate
          }
        }
      }
      let paddingMinX = extraBubblePaddingProportion * (rangeX + bubblePaddingMinX + bubblePaddingMaxX) + bubblePaddingMinX
      let paddingMaxX = extraBubblePaddingProportion * (rangeX + bubblePaddingMinX + bubblePaddingMaxX) + bubblePaddingMaxX
      let paddingMinY = extraBubblePaddingProportion * (rangeY + bubblePaddingMinY + bubblePaddingMaxY) + bubblePaddingMinY
      let paddingMaxY = extraBubblePaddingProportion * (rangeY + bubblePaddingMinY + bubblePaddingMaxY) + bubblePaddingMaxY

      if (rangeX === 0 && rangeY === 0) {
        paddingMinX = 1
        paddingMaxX = 1
        paddingMinY = 1
        paddingMaxY = 1
      } else if (rangeX === 0) {
        paddingMinX = paddingMinY
        paddingMaxX = paddingMaxY
      } else if (rangeY === 0) {
        paddingMinY = paddingMinX
        paddingMaxY = paddingMaxX
      }

      if (!this.minXAlignedToOrigin) {
        this.minX -= paddingMinX
      }
      if (!this.maxXAlignedToOrigin) {
        this.maxX += paddingMaxX
      }
      if (!this.minYAlignedToOrigin) {
        this.minY -= paddingMinY
      }
      if (!this.maxYAlignedToOrigin) {
        this.maxY += paddingMaxY
      }
    } else {
      const pointpaddingX = r * (this.maxX - this.minX) / this.vb.width
      const pointpaddingY = r * (this.maxY - this.minY) / this.vb.height
      let paddingX = extraPaddingProportion * (rangeX + 2 * pointpaddingX) + pointpaddingX
      let paddingY = extraPaddingProportion * (rangeY + 2 * pointpaddingY) + pointpaddingY
      if (rangeX === 0 && rangeY === 0) {
        paddingX = 1
        paddingY = 1
      } else if (rangeX === 0) {
        paddingX = paddingY
      } if (rangeY === 0) {
        paddingY = paddingX
      }

      if (!this.minXAlignedToOrigin) {
        this.minX -= paddingX
      }
      if (!this.maxXAlignedToOrigin) {
        this.maxX += paddingX
      }
      if (!this.minYAlignedToOrigin) {
        this.minY -= paddingY
      }
      if (!this.maxYAlignedToOrigin) {
        this.maxY += paddingY
      }
    }
  }

  // For ordinal coordinates, determine extra padding for min and max bounds
  // as a proportion of the original range. The padding includes marker and
  // bubble radii as well as some extra space.
  calculateOrdinalPaddingProportions () {
    const r = this.pointRadius

    if (this.xDataType === DataTypeEnum.ordinal) {
      if (Utils.isArrOfNums(this.Z)) {
        const nLevels = this.xLevels.length
        let bubbleRadiusMinX = 0
        let bubbleRadiusMaxX = 0

        for (let i = 0; i < this.origLen; i++) {
          if (!_.includes(this.outsideBoundsPtsId, i)) {
            const bubbleRadius = LegendUtils.normalizedZtoRadius(r, this.normZ[i])
            const idx = this.xLevels.indexOf(this.origX[i])
            const bubbleRadiusMinXCandidate = bubbleRadius - idx * this.vb.width / nLevels
            if (bubbleRadiusMinXCandidate > bubbleRadiusMinX) {
              bubbleRadiusMinX = bubbleRadiusMinXCandidate
            }
            const bubbleRadiusMaxXCandidate = bubbleRadius - (nLevels - idx - 1) * this.vb.width / nLevels
            if (bubbleRadiusMaxXCandidate > bubbleRadiusMaxX) {
              bubbleRadiusMaxX = bubbleRadiusMaxXCandidate
            }
          }
        }
        this.ordinalMinXPaddingProportion = bubbleRadiusMinX / this.vb.width + extraBubblePaddingProportion
        this.ordinalMaxXPaddingProportion = bubbleRadiusMaxX / this.vb.width + extraBubblePaddingProportion
      } else {
        this.ordinalMinXPaddingProportion = r / this.vb.width + extraPaddingProportion
        this.ordinalMaxXPaddingProportion = r / this.vb.width + extraPaddingProportion
      }
      this.ordinalMinXPaddingProportion = Math.min(this.ordinalMinXPaddingProportion, 0.5)
      this.ordinalMaxXPaddingProportion = Math.min(this.ordinalMaxXPaddingProportion, 0.5)
    }

    if (this.yDataType === DataTypeEnum.ordinal) {
      if (Utils.isArrOfNums(this.Z)) {
        const nLevels = this.yLevels.length
        let bubbleRadiusMinY = 0
        let bubbleRadiusMaxY = 0

        for (let i = 0; i < this.origLen; i++) {
          if (!_.includes(this.outsideBoundsPtsId, i)) {
            const bubbleRadius = LegendUtils.normalizedZtoRadius(r, this.normZ[i])
            const idx = this.yLevels.indexOf(this.origY[i])
            const bubbleRadiusMinYCandidate = bubbleRadius - idx * this.vb.height / nLevels
            if (bubbleRadiusMinYCandidate > bubbleRadiusMinY) {
              bubbleRadiusMinY = bubbleRadiusMinYCandidate
            }
            const bubbleRadiusMaxYCandidate = bubbleRadius - (nLevels - idx - 1) * this.vb.height / nLevels
            if (bubbleRadiusMaxYCandidate > bubbleRadiusMaxY) {
              bubbleRadiusMaxY = bubbleRadiusMaxYCandidate
            }
          }
        }
        this.ordinalMinYPaddingProportion = bubbleRadiusMinY / this.vb.height + extraBubblePaddingProportion
        this.ordinalMaxYPaddingProportion = bubbleRadiusMaxY / this.vb.height + extraBubblePaddingProportion
      } else {
        this.ordinalMinYPaddingProportion = r / this.vb.height + extraPaddingProportion
        this.ordinalMaxYPaddingProportion = r / this.vb.height + extraPaddingProportion
      }
      this.ordinalMinYPaddingProportion = Math.min(this.ordinalMinYPaddingProportion, 0.5)
      this.ordinalMaxYPaddingProportion = Math.min(this.ordinalMaxYPaddingProportion, 0.5)
    }
  }
}

module.exports = PlotData
