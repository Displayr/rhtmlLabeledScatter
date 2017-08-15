import _ from 'lodash'
import autoBind from 'es6-autobind'
import PlotColors from './PlotColors'
import PlotLabel from './PlotLabel'
import LegendUtils from './utils/LegendUtils'
import Utils from './utils/Utils'

// To Refactor:
//   * fixed aspect ratio code can (probably) be simplified : see Pictograph utils/geometryUtils.js
//

class PlotData {
  constructor (X,
    Y,
    Z,
    group,
    label,
    labelAlt,
    viewBoxDim,
    legend,
    colorWheel,
    fixedAspectRatio,
    originAlign,
    pointRadius,
    bounds,
    transparency,
    legendSettings,
    axisDimensionText) {
    autoBind(this)
    this.X = X
    this.Y = Y
    this.Z = Z
    this.group = group
    this.label = label
    this.labelAlt = labelAlt
    this.viewBoxDim = viewBoxDim
    this.legend = legend
    this.colorWheel = colorWheel
    this.fixedAspectRatio = fixedAspectRatio
    this.originAlign = originAlign
    this.pointRadius = pointRadius
    this.bounds = bounds
    this.transparency = transparency
    this.legendSettings = legendSettings
    this.axisDimensionText = axisDimensionText
    this.origX = this.X.slice(0)
    this.origY = this.Y.slice(0)
    this.normX = this.X.slice(0)
    this.normY = this.Y.slice(0)
    if (Utils.isArrOfNums(this.Z) && (this.Z.length === this.X.length)) { this.normZ = this.Z.slice() }
    this.outsidePlotPtsId = []
    this.legendPts = []
    this.outsidePlotCondensedPts = []
    this.legendRequiresRedraw = false

    if (this.X.length === this.Y.length) {
      this.len = (this.origLen = X.length)
      this.normalizeData()
      if (Utils.isArrOfNums(this.Z)) { this.normalizeZData() }
      this.plotColors = new PlotColors(this)
      this.labelNew = new PlotLabel(this.label, this.labelAlt, this.viewBoxDim.labelLogoScale)
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
      const widgetAR = (this.viewBoxDim.width / this.viewBoxDim.height)
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

    for (const lp of Array.from(this.legendPts)) {
      var { id } = lp.pt
      let draggedNormX = (this.X[id] - this.minX) / (this.maxX - this.minX)
      let draggedNormY = (this.Y[id] - this.minY) / (this.maxY - this.minY)
      // TODO KZ the ++ should be immed. after the use of the iter !
      const newMarkerId = this.outsidePlotMarkersIter
      lp.markerId = newMarkerId

      if ((Math.abs(draggedNormX) > 1) || (Math.abs(draggedNormY) > 1) ||
         (draggedNormX < 0) || (draggedNormY < 0)) {
        var markerTextY,
          x1,
          y1
        draggedNormX = draggedNormX > 1 ? 1 : draggedNormX
        draggedNormX = draggedNormX < 0 ? 0 : draggedNormX
        draggedNormY = draggedNormY > 1 ? 1 : draggedNormY
        draggedNormY = draggedNormY < 0 ? 0 : draggedNormY
        const x2 = (draggedNormX * this.viewBoxDim.width) + this.viewBoxDim.x
        const y2 = ((1 - draggedNormY) * this.viewBoxDim.height) + this.viewBoxDim.y

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
    }

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

  getPtsAndLabs (calleeName) {
    console.log(`getPtsAndLabs(${calleeName})`)
    return Promise.all(this.labelNew.getLabels()).then((resolvedLabels) => {
//      console.log("resolvedLabels for getPtsandLabs callee name #{calleeName}")
//      console.log(resolvedLabels)

      this.pts = []
      this.lab = []

      let i = 0
      while (i < this.origLen) {
        if ((!_.includes(this.outsidePlotPtsId, i)) ||
           _.includes((_.map(this.outsidePlotCondensedPts, e => e.dataId)), i)) {
          var ptColor
          const x = (this.normX[i] * this.viewBoxDim.width) + this.viewBoxDim.x
          const y = ((1 - this.normY[i]) * this.viewBoxDim.height) + this.viewBoxDim.y
          let r = this.pointRadius
          if (Utils.isArrOfNums(this.Z)) {
            const legendUtils = LegendUtils
            r = legendUtils.normalizedZtoRadius(this.viewBoxDim, this.normZ[i])
          }
          const fillOpacity = this.plotColors.getFillOpacity(this.transparency)

          let { label } = resolvedLabels[i]
          const labelAlt = ((this.labelAlt !== null ? this.labelAlt[i] : undefined) !== null) ? this.labelAlt[i] : ''
          let { width } = resolvedLabels[i]
          let { height } = resolvedLabels[i]
          let { url } = resolvedLabels[i]

          const labelZ = Utils.isArrOfNums(this.Z) ? this.Z[i].toString() : ''
          let fontSize = this.viewBoxDim.labelFontSize

          // If pt hsa been already condensed
          if (_.includes((_.map(this.outsidePlotCondensedPts, e => e.dataId)), i)) {
            const pt = _.find(this.outsidePlotCondensedPts, e => e.dataId === i)
            label = pt.markerId + 1
            fontSize = this.viewBoxDim.labelSmallFontSize
            url = ''
            width = null
            height = null
          }

          let fontColor = (ptColor = this.plotColors.getColor(i))
          if ((this.viewBoxDim.labelFontColor != null) && !(this.viewBoxDim.labelFontColor === '')) { fontColor = this.viewBoxDim.labelFontColor }
          const group = (this.group != null) ? this.group[i] : ''
          this.pts.push({
            x,
            y,
            r,
            label,
            labelAlt,
            labelX: this.origX[i].toPrecision(3).toString(),
            labelY: this.origY[i].toPrecision(3).toString(),
            labelZ,
            group,
            color: ptColor,
            id: i,
            fillOpacity
          })
          this.lab.push({
            x,
            y,
            color: fontColor,
            id: i,
            fontSize,
            fontFamily: this.viewBoxDim.labelFontFamily,
            text: label,
            width,
            height,
            url
          })
        }
        i++
      }

      // Remove pts outside plot because user bounds set
      return (() => {
        const result = []
        for (const p of Array.from(this.outsideBoundsPtsId)) {
          let item
          if (!_.includes(this.outsidePlotPtsId, p)) { item = this.addElemToLegend(p) }
          result.push(item)
        }
        return result
      })()
    }).catch(err => console.log(err))
  }

  setLegendItemsPositions (itemsArray, numCols) {
    const bubbleLegendTextHeight = 20
    const numItems = itemsArray.length
    this.legendHeight = this.viewBoxDim.height
    if ((this.legend.getBubblesTitle() !== null) && this.legendSettings.showBubblesInLegend()) {
      this.legendHeight = this.legend.getBubblesTitle()[0].y - bubbleLegendTextHeight - this.viewBoxDim.y
    }

    if (this.Zquartiles != null) {
      const legendUtils = LegendUtils
      legendUtils.setupBubbles(this.viewBoxDim, this.Zquartiles, this.legend)
    }

    const startOfCenteredLegendItems = (((this.viewBoxDim.y + (this.legendHeight / 2)) -
                                  ((this.legend.getHeightOfRow() * (numItems / numCols)) / 2)) +
                                  this.legend.getPtRadius())
    const startOfViewBox = this.viewBoxDim.y + this.legend.getPtRadius()
    const legendStartY = Math.max(startOfCenteredLegendItems, startOfViewBox)

    let colSpacing = 0
    let numItemsInPrevCols = 0

    let i = 0
    let currentCol = 1
    return (() => {
      const result = []
      while (i < numItems) {
        if (numCols > 1) {
          const numElemsInCol = numItems / numCols
          const exceededCurrentCol = (legendStartY + ((i - numItemsInPrevCols) * this.legend.getHeightOfRow())) > (this.viewBoxDim.y + this.legendHeight)
          const plottedEvenBalanceOfItemsBtwnCols = i >= (numElemsInCol * currentCol)
          if (exceededCurrentCol || plottedEvenBalanceOfItemsBtwnCols) {
            colSpacing = (this.legend.getColSpace() + (this.legend.getPtRadius() * 2) + this.legend.getPtToTextSpace()) * currentCol
            numItemsInPrevCols = i
            currentCol++
          }

          const totalItemsSpacingExceedLegendArea = (legendStartY + ((i - numItemsInPrevCols) * this.legend.getHeightOfRow())) > (this.viewBoxDim.y + this.legendHeight)
          if (totalItemsSpacingExceedLegendArea) { break }
        }

        const li = itemsArray[i]
        if (li.isDraggedPt) {
          li.x = this.legend.getX() + this.legend.getPaddingLeft() + colSpacing
          li.y = legendStartY + ((i - numItemsInPrevCols) * this.legend.getHeightOfRow()) + this.legend.getVertPtPadding()
        } else {
          li.cx = this.legend.getX() + this.legend.getPaddingLeft() + colSpacing + li.r
          li.cy = legendStartY + ((i - numItemsInPrevCols) * this.legend.getHeightOfRow())
          li.x = li.cx + this.legend.getPtToTextSpace()
          li.y = li.cy + li.r
        }
        result.push(i++)
      }
      return result
    })()
  }

  setupLegendGroupsAndPts () {
    if ((this.legendPts.length > 0) && (this.legendSettings.showLegend())) {
      const legendItemArray = []

      _.map(this.legendGroups, g => legendItemArray.push(g))
      _.map(this.legendPts, p => legendItemArray.push(p))

      return this.setLegendItemsPositions(legendItemArray, this.legend.getCols())
    } else if ((this.legendPts.length > 0) && (!this.legendSettings.showLegend())) {
      return this.setLegendItemsPositions(this.legendPts, this.legend.getCols())
    } else {
      return this.setLegendItemsPositions(this.legendGroups, this.legend.getCols())
    }
  }

  resizedAfterLegendGroupsDrawn () {
    const initWidth = this.viewBoxDim.width

    const totalLegendItems = this.legendSettings.showLegend() ? this.legendGroups.length + this.legendPts.length : this.legendPts.length
    const legendGrpsTextMax = (this.legendGroups.length > 0) && this.legendSettings.showLegend() ? (_.maxBy(this.legendGroups, e => e.width)).width : 0
    const legendPtsTextMax = this.legendPts.length > 0 ? (_.maxBy(this.legendPts, e => e.width)).width : 0

    const maxTextWidth = _.max([legendGrpsTextMax, legendPtsTextMax])

    const spacingAroundMaxTextWidth = this.legend.getPaddingLeft() +
                                (this.legend.getPtRadius() * 2) +
                                this.legend.getPaddingRight() +
                                this.legend.getPtToTextSpace()

    const bubbleLeftRightPadding = this.legend.getPaddingLeft() + this.legend.getPaddingRight()

    this.legend.setCols(Math.ceil(((totalLegendItems) * this.legend.getHeightOfRow()) / this.legendHeight))
    this.legend.setWidth((maxTextWidth * this.legend.getCols()) + spacingAroundMaxTextWidth + (this.legend.getPaddingMid() * (this.legend.getCols() - 1)))

    const bubbleTitleWidth = (this.legend.getBubblesTitle() !== null) ? this.legend.getBubblesTitle()[0].width : undefined
    this.legend.setWidth(_.max([this.legend.getWidth(), bubbleTitleWidth + bubbleLeftRightPadding, this.legend.getBubblesMaxWidth() + bubbleLeftRightPadding]))

    this.legend.setColSpace(maxTextWidth)

    this.viewBoxDim.width = this.viewBoxDim.svgWidth - this.legend.getWidth() - this.viewBoxDim.x - this.axisDimensionText.rowMaxWidth
    this.legend.setX(this.viewBoxDim.x + this.viewBoxDim.width)

    const isNewWidthSignficantlyDifferent = Math.abs(initWidth - this.viewBoxDim.width) > 0.1
    return isNewWidthSignficantlyDifferent
  }

  isOutsideViewBox (lab) {
    const left = lab.x - (lab.width / 2)
    const right = lab.x + (lab.width / 2)
    const top = lab.y - lab.height
    const bot = lab.y

    if ((left < this.viewBoxDim.x) ||
        (right > (this.viewBoxDim.x + this.viewBoxDim.width)) ||
        (top < this.viewBoxDim.y) ||
        (bot > (this.viewBoxDim.y + this.viewBoxDim.height))) {
      return true
    }
    return false
  }

  isLegendPtOutsideViewBox (lab) {
    const left = lab.x
    const right = lab.x + lab.width
    const top = lab.y - lab.height
    const bot = lab.y

    if ((left < this.viewBoxDim.x) ||
        (right > (this.viewBoxDim.x + this.viewBoxDim.width)) ||
        (top < this.viewBoxDim.y) ||
        (bot > (this.viewBoxDim.y + this.viewBoxDim.height))) {
      return true
    }
    return false
  }

  addElemToLegend (id) {
    const checkId = e => e.id === id
    const movedPt = _.remove(this.pts, checkId)
    const movedLab = _.remove(this.lab, checkId)
    this.legendPts.push({
      id: id,
      pt: movedPt[0],
      lab: movedLab[0],
      anchor: 'start',
      text: `${movedLab[0].text} (${movedPt[0].labelX}, ${movedPt[0].labelY})`,
      color: movedPt[0].color,
      isDraggedPt: true
    })
    // console.log("pushed legendPt : #{JSON.stringify(@legendPts[@legendPts.length-1])}")

    this.outsidePlotPtsId.push(id)
    this.normalizeData()
    this.getPtsAndLabs('PlotData.addElemToLegend')
    this.setupLegendGroupsAndPts()
    this.legendRequiresRedraw = true
  }

  removeElemFromLegend (id) {
    const checkId = e => e.id === id
    const legendPt = _.remove(this.legendPts, checkId)
    this.pts.push(legendPt.pt)
    this.lab.push(legendPt.lab)

    _.remove(this.outsidePlotPtsId, i => i === id)
    _.remove(this.outsidePlotCondensedPts, i => i.dataId === id)

    this.normalizeData()
    this.getPtsAndLabs('PlotData.removeElemFromLegend')
    this.setupLegendGroupsAndPts()
  }

  resetLegendPts () {
    _.forEachRight(this.legendPts, lp => {
      if (!_.isUndefined(lp)) this.removeElemFromLegend(lp.id)
    })
  }
}

module.exports = PlotData
