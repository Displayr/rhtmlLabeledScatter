import autoBind from 'es6-autobind'
import _ from 'lodash'
import LegendUtils from './utils/LegendUtils'

class Legend {
  constructor (legendSettings, xPrefix, yPrefix, zPrefix, xSuffix, ySuffix, zSuffix) {
    autoBind(this)
    this.legendSettings = legendSettings
    this.prefix = {
      x: xPrefix,
      y: yPrefix,
      z: zPrefix
    }
    this.suffix = {
      x: xSuffix,
      y: ySuffix,
      z: zSuffix
    }
    this.yPrefix = yPrefix
    this.zPrefix = zPrefix
    this.width = 0
    this.heightOfRow = legendSettings.getFontSize() + 9
    this.padding = {
      right: legendSettings.getFontSize() / 1.6,
      left: legendSettings.getFontSize() / 0.8,
      middle: legendSettings.getFontSize() / 0.53
    }
    this.ptRadius = legendSettings.getFontSize() / 2.67
    this.ptToTextSpace = legendSettings.getFontSize()
    this.vertPtPadding = 5
    this.cols = 1
    this.marker = {
      len: 5,
      width: 1,
      textSize: 10,
      charWidth: 4
    }

    this.x = 0
    this.pts = []
    this.groups = []
  }

  setMaxWidth (w) {
    this.maxWidth = w
  }

  setWidth (w) {
    this.width = w
  }

  setHeight (h) {
    this.height = h
  }
  setCols (c) {
    if (!_.isNaN(c)) {
      this.cols = c
    }
  }

  getSpacingAroundMaxTextWidth () {
    return this.getPaddingLeft() +
      (this.getPtRadius() * 2) +
      this.getPaddingRight() +
      this.getPtToTextSpace()
  }

  getBubbleLeftRightPadding () {
    return this.getPaddingLeft() + this.getPaddingRight()
  }

  getBubbleTitleWidth () {
    return (this.getBubblesTitle() !== null) ? this.getBubblesTitle()[0].width : undefined
  }

  setLegendGroupsAndPts (vb, Zquartiles) {
    const showGroups = this.legendSettings.showLegend()
    const pts = this.pts
    const groups = this.groups
    if ((this.pts.length > 0) && showGroups) {
      const legendItemArray = []

      this.pts = []
      this.groups = []

      _.map(groups, g => legendItemArray.push(g))
      _.map(pts, p => legendItemArray.push(p))

      const itemPositions = this.getLegendItemsPositions(vb, Zquartiles, legendItemArray)

      _.forEach(itemPositions, (item) => {
        (item.cx === undefined) ? this.pts.push(item) : this.groups.push(item)
      })
    } else if ((pts.length > 0) && !showGroups) {
      this.pts = this.getLegendItemsPositions(vb, Zquartiles, pts)
    } else {
      this.groups = this.getLegendItemsPositions(vb, Zquartiles, groups)
    }
  }

  getLegendItemsPositions (vb, Zquartiles, itemsArray) {
    const bubbleLegendTextHeight = 20
    const numItems = itemsArray.length
    this.setHeight(vb.height)

    if ((this.getBubblesTitle() !== null) && this.legendSettings.showBubblesInLegend()) {
      this.height = this.getBubblesTitle()[0].y - bubbleLegendTextHeight - vb.y
    }

    if (Zquartiles != null) {
      const legendUtils = LegendUtils
      legendUtils.setupBubbles(vb, Zquartiles, this)
    }

    const startOfCenteredLegendItems = (((vb.y + (this.height / 2)) -
      ((this.getHeightOfRow() * (numItems / this.getCols())) / 2)) +
      this.getPtRadius())
    const startOfViewBox = vb.y + this.getPtRadius()
    const legendStartY = Math.max(startOfCenteredLegendItems, startOfViewBox)

    let colSpacing = 0
    let numItemsInPrevCols = 0

    let i = 0
    let currentCol = 1
    while (i < numItems) {
      if (this.getCols() > 1) {
        const numElemsInCol = numItems / this.getCols()
        const exceededCurrentCol = (legendStartY + ((i - numItemsInPrevCols) * this.getHeightOfRow())) > (vb.y + this.height)
        const plottedEvenBalanceOfItemsBtwnCols = i >= (numElemsInCol * currentCol)
        if (exceededCurrentCol || plottedEvenBalanceOfItemsBtwnCols) {
          colSpacing = (this.getColSpace() + (this.getPtRadius() * 2) + this.getPtToTextSpace()) * currentCol
          numItemsInPrevCols = i
          currentCol++
        }

        const totalItemsSpacingExceedLegendArea = (legendStartY + ((i - numItemsInPrevCols) * this.getHeightOfRow())) > (vb.y + this.height)
        if (totalItemsSpacingExceedLegendArea) { break }
      }

      const li = itemsArray[i]
      if (li.isDraggedPt) {
        li.x = this.getX() + this.getPaddingLeft() + colSpacing
        li.y = legendStartY + ((i - numItemsInPrevCols) * this.getHeightOfRow()) + this.getVertPtPadding()
      } else {
        li.cx = this.getX() + this.getPaddingLeft() + colSpacing + li.r
        li.cy = legendStartY + ((i - numItemsInPrevCols) * this.getHeightOfRow())
        li.x = li.cx + this.getPtToTextSpace()
        li.y = li.cy + li.r
      }
      i++
    }
    return itemsArray
  }

  addPt (id, movedPt, movedLab) {
    this.pts.push({
      id: id,
      pt: movedPt[0],
      lab: movedLab[0],
      anchor: 'start',
      text: `${movedLab[0].text} (${this.prefix.x}${movedPt[0].labelX}${this.suffix.x}, ${this.prefix.y}${movedPt[0].labelY}${this.suffix.y})`,
      color: movedPt[0].color,
      isDraggedPt: true
    })
  }

  removePt (id) {
    const checkId = e => e.id === id
    return _.remove(this.pts, checkId)
  }

  addGroup (text, color, fillOpacity) {
    this.groups.push({
      text: text,
      color: color,
      r: this.getPtRadius(),
      anchor: 'start',
      fillOpacity: fillOpacity
    })
  }

  getWidth () { return this.width }
  getHeightOfRow () { return this.heightOfRow }
  getMarkerLen () { return this.marker.len }
  getMarkerWidth () { return this.marker.width }
  getMarkerTextSize () { return this.marker.textSize }
  getMarkerCharWidth () { return this.marker.charWidth }
  getPtRadius () { return this.ptRadius }
  getColSpace () { return this.colSpace }
  getPaddingRight () { return this.padding.right }
  getPaddingLeft () { return this.padding.left }
  getPaddingMid () { return this.padding.middle }
  getPtToTextSpace () { return this.ptToTextSpace }
  getVertPtPadding () { return this.vertPtPadding }
  getCols () { return this.cols }
  getX () { return this.x }
  getBubblesMaxWidth () { return this.bubblesMaxWidth }
  getBubbles () { return this.bubbles }
  getBubblesTitle () { return _.isEmpty(this.bubblesTitle) ? null : this.bubblesTitle }
  getNumGroups () { return this.groups.length }
  getNumPts () { return this.pts.length }
  setX (x) { this.x = x }
  setColSpace (cs) { this.colSpace = cs }
  setBubblesMaxWidth (bubblesMaxWidth) { this.bubblesMaxWidth = bubblesMaxWidth }
  setBubbles (bubbles) { this.bubbles = bubbles }
  setBubblesTitle (title) { this.bubblesTitle = title }
}

module.exports = Legend
