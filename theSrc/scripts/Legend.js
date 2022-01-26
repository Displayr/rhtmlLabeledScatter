import autoBind from 'es6-autobind'
import _ from 'lodash'
import LegendUtils from './utils/LegendUtils'
import SvgUtils from './utils/SvgUtils'
import Utils from './utils/Utils'

class Legend {
  constructor (legendSettings, axisSettings) {
    autoBind(this)
    this.legendSettings = legendSettings
    this.decimals = {
      x: axisSettings.x.decimals,
      y: axisSettings.y.decimals,
      z: axisSettings.z.decimals,
    }
    this.prefix = {
      x: axisSettings.x.prefix,
      y: axisSettings.y.prefix,
      z: axisSettings.z.prefix,
    }
    this.suffix = {
      x: axisSettings.x.suffix,
      y: axisSettings.y.suffix,
      z: axisSettings.z.suffix,
    }
    this.width = 0
    this.maxWidth = 0
    this.heightOfRow = legendSettings.getFontSize() + 9
    this.padding = {
      right: legendSettings.getFontSize() / 1.6,
      left: legendSettings.getFontSize() / 0.8,
      middle: legendSettings.getFontSize() / 0.53,
    }
    this.ptRadius = legendSettings.getFontSize() / 2.67
    this.ptToTextSpace = legendSettings.getFontSize()
    this.vertPtPadding = 5
    this.cols = 1
    this.marker = {
      len: 5,
      width: 1,
      textSize: 10,
      charWidth: 4,
    }

    this.x = 0
    this.pts = []
    this.groups = []
  }

  setMaxWidth (w) {
    this.maxWidth = w
  }

  setWidth (w) {
    this.width = _.min([w, this.maxWidth])
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

  setLegendGroupsAndPts (vb, legendBubbles, pointRadius) {
    const showGroups = this.legendSettings.showLegend()
    const pts = this.pts
    const groups = this.groups
    if ((this.pts.length > 0) && showGroups) {
      const legendItemArray = []

      this.pts = []
      this.groups = []

      _.map(groups, g => legendItemArray.push(g))
      _.map(pts, p => legendItemArray.push(p))

      const itemPositions = this.getLegendItemsPositions(vb, legendBubbles, legendItemArray, pointRadius)

      _.forEach(itemPositions, (item) => {
        (item.cx === undefined) ? this.pts.push(item) : this.groups.push(item)
      })
    } else if ((pts.length > 0) && !showGroups) {
      this.pts = this.getLegendItemsPositions(vb, legendBubbles, pts, pointRadius)
    } else {
      this.groups = this.getLegendItemsPositions(vb, legendBubbles, groups, pointRadius)
    }
  }

  getLegendItemsPositions (vb, legendBubbles, itemsArray, pointRadius) {
    const bubbleLegendTextHeight = 20
    const numItems = itemsArray.length
    this.setHeight(vb.height)

    if ((this.getBubblesTitle() !== null) && this.legendSettings.showBubblesInLegend()) {
      this.height = this.getBubblesTitle()[0].y - bubbleLegendTextHeight - vb.y
    }

    if (legendBubbles != null && this.legendSettings.showBubblesInLegend) {
      const legendUtils = LegendUtils
      legendUtils.setupBubbles(vb, legendBubbles, this, pointRadius)
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
      text: `${movedLab[0].text} (${Utils.getFormattedNum(movedPt[0].labelX, this.decimals.x, this.prefix.x, this.suffix.x)}, ${Utils.getFormattedNum(movedPt[0].labelY, this.decimals.y, this.prefix.y, this.suffix.y)})`,
      color: movedPt[0].color,
      isDraggedPt: true,
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
      fillOpacity: fillOpacity,
    })
  }

  resizedAfterLegendGroupsDrawn (vb, axisDimensionText) {
    this.vb = vb
    const initWidth = vb.width

    const totalLegendItems = this.legendSettings.showLegend() ? this.getNumGroups() + this.getNumPts() : this.getNumPts()
    const legendGrpsTextMax = (this.getNumGroups() > 0) && this.legendSettings.showLegend() ? (_.maxBy(this.groups, e => e.width)).width : 0
    const legendPtsTextMax = this.getNumPts() > 0 ? (_.maxBy(this.pts, e => e.width)).width : 0

    const maxTextWidth = _.max([legendGrpsTextMax, legendPtsTextMax])

    const spacingAroundMaxTextWidth = this.getSpacingAroundMaxTextWidth()
    const bubbleLeftRightPadding = this.getBubbleLeftRightPadding()

    this.setCols(Math.ceil(((totalLegendItems) * this.getHeightOfRow()) / this.height))
    this.setWidth((maxTextWidth * this.getCols()) + spacingAroundMaxTextWidth + (this.getPaddingMid() * (this.getCols() - 1)))

    if (this.legendSettings.showBubblesInLegend()) {
      const bubbleTitleWidth = this.getBubbleTitleWidth()
      this.setWidth(_.max([this.width, bubbleTitleWidth + bubbleLeftRightPadding,
        this.getBubblesMaxWidth() + bubbleLeftRightPadding]))
    } else {
      this.setWidth(this.width)
    }

    this.setColSpace(_.min([maxTextWidth, this.getMaxTextWidth()]))

    vb.setWidth(vb.svgWidth - this.width - vb.x - axisDimensionText.rowMaxWidth)
    this.setX(vb.x + vb.width)

    const isNewWidthSignficantlyDifferent = Math.abs(initWidth - vb.width) > 0.1
    return isNewWidthSignficantlyDifferent
  }

  getMaxTextWidth () {
    return (this.maxWidth - (this.getPaddingLeft() + this.getPaddingRight() + this.getPaddingMid() * (this.getCols() - 1))) / this.getCols()
  }

  getMaxGroupTextWidth () {
    return (this.maxWidth - (this.getPaddingLeft() + this.getPaddingRight() + this.getPtRadius() + this.getPaddingMid() * this.getCols())) / this.getCols()
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

  drawBubblesTitleWith (svg) {
    if (this.legendSettings.hasTitleText()) {
      svg.selectAll('.legend-bubbles-title').remove()
      let legendBubbleTitleFontSize = this.legendSettings.getBubbleTitleFontSize()
      const legendBubbleTitleSvg = svg.selectAll('.legend-bubbles-title')
         .data(this.getBubblesTitle())
         .enter()
         .append('text')
         .attr('class', 'legend-bubbles-title')
         .attr('x', d => d.x)
         .attr('y', d => d.y - (legendBubbleTitleFontSize * 1.5))
         .attr('text-anchor', 'middle')
         .attr('font-weight', 'normal')
         .attr('font-size', this.legendSettings.getBubbleTitleFontSize())
         .attr('font-family', this.legendSettings.getBubbleTitleFontFamily())
         .attr('fill', this.legendSettings.getBubbleTitleFontColor())
         .text(this.legendSettings.getTitle())

      SvgUtils.setSvgBBoxWidthAndHeight(this.getBubblesTitle(), legendBubbleTitleSvg)
    }
  }

  drawBubblesWith (svg, axisSettings) {
    svg.selectAll('.legend-bubbles').remove()
    svg.selectAll('.legend-bubbles')
       .data(this.getBubbles())
       .enter()
       .append('circle')
       .attr('class', 'legend-bubbles')
       .attr('cx', d => d.cx)
       .attr('cy', d => d.cy)
       .attr('r', d => d.r)
       .attr('fill', 'none')
       .attr('stroke', this.legendSettings.getBubbleFontColor())
       .attr('stroke-opacity', 0.5)
  }

  drawBubblesLabelsWith (svg) {
    svg.selectAll('.legend-bubbles-labels').remove()
    svg.selectAll('.legend-bubbles-labels')
       .data(this.getBubbles())
       .enter()
       .append('text')
       .attr('class', 'legend-bubbles-labels')
       .attr('x', d => d.x)
       .attr('y', d => d.y)
       .attr('text-anchor', 'middle')
       .attr('font-size', this.legendSettings.getBubbleFontSize())
       .attr('font-family', this.legendSettings.getBubbleFontFamily())
       .attr('fill', this.legendSettings.getBubbleFontColor())
       .text(d => d.text)
  }

  drawDraggedPtsTextWith (svg, drag) {
    svg.selectAll('.legend-dragged-pts-text').remove()
    const legendPtsSvg = svg.selectAll('.legend-dragged-pts-text')
       .data(this.pts)
       .enter()
       .append('text')
       .attr('class', 'legend-dragged-pts-text')
       .attr('id', d => `legend-${d.id}`)
       .attr('x', d => d.x)
       .attr('y', d => d.y)
       .attr('font-family', this.legendSettings.getFontFamily())
       .attr('font-size', this.legendSettings.getFontSize())
       .attr('text-anchor', d => d.anchor)
       .attr('fill', d => d.color)
       .style('cursor', 'move')
       .text(d => { if (!(_.isNull(d.markerId))) { return Utils.getSuperscript(d.markerId + 1) + d.text } else { return d.text } })
       .call(drag)

    SvgUtils.setSvgBBoxWidthAndHeight(this.pts, svg.selectAll('.legend-dragged-pts-text'))
    _.map(legendPtsSvg[0], p => SvgUtils.svgTextEllipses(p, p.textContent, this.getMaxTextWidth()))
  }

  drawGroupsTextWith (svg) {
    svg.selectAll('.legend-groups-text').remove()
    const legendGroupsSvg = svg.selectAll('.legend-groups-text')
       .data(this.groups)
       .enter()
       .append('text')
       .attr('class', 'legend-groups-text')
       .attr('x', d => d.x)
       .attr('y', d => d.y)
       .attr('font-family', this.legendSettings.getFontFamily())
       .attr('fill', this.legendSettings.getFontColor())
       .attr('font-size', this.legendSettings.getFontSize())
       .text(d => d.text)
       .attr('text-anchor', d => d.anchor)
    SvgUtils.setSvgBBoxWidthAndHeight(this.groups, svg.selectAll('.legend-groups-text'))
    _.map(legendGroupsSvg[0], g => SvgUtils.svgTextEllipses(g, g.textContent, this.getMaxGroupTextWidth()))
  }

  drawGroupsPts (svg) {
    svg.selectAll('.legend-groups-pts').remove()
    svg.selectAll('.legend-groups-pts')
       .data(this.groups)
       .enter()
       .append('circle')
       .attr('class', 'legend-groups-pts')
       .attr('cx', d => d.cx)
       .attr('cy', d => d.cy)
       .attr('r', d => d.r)
       .attr('fill', d => d.color)
       .attr('stroke', d => d.stroke)
       .attr('stroke-opacity', d => d['stroke-opacity'])
       .attr('fill-opacity', d => d.fillOpacity)
  }
}

module.exports = Legend
