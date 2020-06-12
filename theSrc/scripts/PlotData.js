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

class PlotData {
  constructor ({
                 X,
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
                 colors,
                 fixedRatio,
                 originAlign,
                 pointRadius,
                 bounds,
                 transparency,
                 legendSettings,
                 state,
                 svg,
                 labelsFontSize,
                 labelsFontFamily
               }) {
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
    this.colorWheel = colors
    this.fixedAspectRatio = fixedRatio
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
    // this.legendPts = []
    this.outsidePlotCondensedPts = []
    this.legendRequiresRedraw = false
    this.legendSettings = legendSettings
    this.state = state
    this.svg = svg

    if (this.X.length === this.Y.length) {
      this.len = (this.origLen = X.length)
      this.normalizeData()
      if (Utils.isArrOfNums(this.Z)) { this.normalizeZData() }
      this.plotColors = new PlotColors(this)
      this.labelNew = new PlotLabel(this.label, this.labelAlt, this.vb.labelLogoScale, this.svg, labelsFontSize, labelsFontFamily)
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

    // threshold used so pts are not right on border of plot
    let rangeX = this.maxX - this.minX
    let rangeY = this.maxY - this.minY
    const thres = 0.08
    let xThres = thres * rangeX
    let yThres = thres * rangeY
    // If both ranges are 0, then set default unary
    if (xThres === 0 && yThres === 0) {
      xThres = 1
      yThres = 1
    } else if (xThres === 0) { // make the range limited to one axis
      xThres = yThres
    } if (yThres === 0) { // make the range limited to one axis
      yThres = xThres
    }

    // Note: Thresholding increase the space around the points which is why we add to the max and min
    this.maxX += xThres
    this.minX -= xThres
    this.maxY += yThres
    this.minY -= yThres

    // originAlign: compensates to make sure origin lines are on axis
    if (this.originAlign) {
      this.maxX = this.maxX < 0 ? 0 : this.maxX + xThres // so axis can be on origin
      this.minX = this.minX > 0 ? 0 : this.minX - xThres
      this.maxY = this.maxY < 0 ? 0 : this.maxY + yThres
      this.minY = this.minY > 0 ? 0 : this.minY - yThres
    }

    // Fixed aspect ratio computations: not easily simplified as the boundaries cannot be reduced
    if (this.fixedAspectRatio) {
      rangeX = this.maxX - this.minX
      rangeY = this.maxY - this.minY
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
          color: lp.color
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
            markerId: newMarkerId
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
    this.Zquartiles = legendUtils.getZQuartiles(maxZ)
    this.normZ = legendUtils.normalizeZValues(this.Z, maxZ)
  }

  buildPoints (calleeName) {
    console.log(`buildPoints(${calleeName})`)
    return Promise.all(this.labelNew.getLabels()).then((resolvedLabels) => {
      // resolvedLabels is array of { height, width, label, url }
      // console.log(`resolvedLabels for buildPoints callee name ${calleeName}`)
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
            const sidePadPercent = 0.08
            x = (scaleOrdinal(this.X[i]) * this.vb.width * (1 - 2 * sidePadPercent)) + this.vb.x + (this.vb.width * sidePadPercent)
          } else {
            x = (this.normX[i] * this.vb.width) + this.vb.x
          }
          if (this.yDataType === DataTypeEnum.ordinal) {
            const scaleOrdinal = d3.scale.ordinal().domain(this.yLevels).rangePoints([0, 1])
            const sidePadPercent = 0.08
            y = (scaleOrdinal(this.Y[i]) * this.vb.height * (1 - 2 * sidePadPercent)) + this.vb.y + (this.vb.height * sidePadPercent)
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
          const labelX = x
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
          if ((this.vb.labelFontColor != null) && !(this.vb.labelFontColor === '')) { fontColor = this.vb.labelFontColor }
          const group = (this.group != null) ? this.group[i] : ''
          this.pts.push({ x, y, r, label, labelAlt, labelX: this.origX[i].toString(), labelY: this.origY[i].toString(), labelZ, group, color: ptColor, id: i, fillOpacity })

          const includeLabel = (label !== '' || url !== '')
          if (includeLabel) {
            this.lab.push({ x: labelX, y: labelY, color: fontColor, id: i, fontSize, fontFamily: this.vb.labelFontFamily, text: label, width, height, url })
          }
        }
        i++
      }
    })
    .then(() => {
      _(this.pts).each(addMinMaxAreaToCircle)
      _(this.pts).each(a => addTypeToObject(a, 'anchor'))
      _(this.pts).each(a => { a.shortText = a.label.substr(0, 8).padStart(8) })
      _(this.lab).each(addMinMaxAreaToRectangle)
      _(this.lab).each(l => addTypeToObject(l, 'label'))
      _(this.lab).each(l => { l.shortText = l.text.substr(0, 8).padStart(8) })
      const nestUnderField = (array, type) => array.map(item => ({ id: item.id, [type]: item }))

      const pinnedLabelIds = this.state.getPositionedLabIds(this.vb)
      const pinnedById = _.transform(pinnedLabelIds, (result, id) => { result[id] = { pinned: true } }, {})

      const mergedStructure = _.merge(
        _.keyBy(nestUnderField(this.lab, 'label'), 'id'),
        _.keyBy(nestUnderField(this.pts, 'anchor'), 'id'),
        pinnedById
      )
      this.points = Object.values(mergedStructure)
    })
    .then(() => {
      // Remove pts outside plot because user bounds set
      _.forEach(this.outsideBoundsPtsId, (p, i) => {
        if (!_.includes(this.outsidePlotPtsId, p)) {
          this.addElemToLegend(p)
        }
      })
      this.setLegend()
    })
    .catch(err => console.log(err))
  }

  setLegend () {
    this.legend.setLegendGroupsAndPts(this.vb, this.Zquartiles, this.pointRadius)
  }

  isOutsideViewBox (label) {
    const isAllOfLabOutside = (
      (label.maxX < this.vb.x) ||
      (label.minX > (this.vb.x + this.vb.width)) ||
      (label.maxY < this.vb.y) ||
      (label.minY > (this.vb.y + this.vb.height))
    )
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

  addElemToLegend (id) {
    const checkId = e => e.id === id
    const movedPt = _.remove(this.pts, checkId)
    const movedLab = _.remove(this.lab, checkId)
    this.legend.addPt(id, movedPt, movedLab)

    this.outsidePlotPtsId.push(id)
    this.normalizeData()
    this.buildPoints('PlotData.addElemToLegend')
    this.legendRequiresRedraw = true
  }

  removeElemFromLegend (id) {
    const legendPt = this.legend.removePt(id)
    this.pts.push(legendPt.pt)
    this.lab.push(legendPt.lab)

    _.remove(this.outsidePlotPtsId, i => i === id)
    _.remove(this.outsidePlotCondensedPts, i => i.dataId === id)

    this.normalizeData()
    this.buildPoints('PlotData.removeElemFromLegend')
    this.setLegend()
  }

  resetLegendPts () {
    _.forEachRight(this.legend.pts, lp => {
      if (!_.isUndefined(lp)) this.removeElemFromLegend(lp.id)
    })
  }

  getTextLabels () {
    return _.filter(this.lab, l => l.url === '')
  }

  getImgLabels () {
    return _.filter(this.lab, l => l.url !== '')
  }
}

// TODO extract addMinMaxAreaToCircle and addMinMaxAreaToRectangle to util. Currently duplicated in labeler and plotdata
const addMinMaxAreaToCircle = (circle) => {
  circle.minX = circle.x - circle.r
  circle.maxX = circle.x + circle.r
  circle.minY = circle.y - circle.r
  circle.maxY = circle.y + circle.r
  circle.area = Math.PI * Math.pow(circle.r, 2)
  return circle
}

// duplicated in 3 places
// assume x,y is top left
const addMinMaxAreaToRectangle = (rect) => {
  rect.minX = rect.x - rect.width / 2
  rect.maxX = rect.x + rect.width / 2
  rect.minY = rect.y - rect.height
  rect.maxY = rect.y
  rect.area = rect.width * rect.height
  return rect
}

const addTypeToObject = (obj, type) => {
  obj.type = type
  return obj
}

module.exports = PlotData
