
import _ from 'lodash'
import d3 from 'd3'
import md5 from 'md5'
import autoBind from 'es6-autobind'
import Links from './Links'
import PlotData from './PlotData'
import TrendLine from './TrendLine'
import DragUtils from './utils/DragUtils'
import SvgUtils from './utils/SvgUtils'
import Utils from './utils/Utils'
import TooltipUtils from './utils/TooltipUtils'
import LabelPlacement from './LabelPlacement'
import LegendSettings from './LegendSettings'
import Legend from './Legend'
import DebugMessage from './DebugMessage'
import ViewBox from './ViewBox'
import Title from './Title'
import Subtitle from './Subtitle'
import Footer from './Footer'
import PlotAxisLabels from './PlotAxisLabels'
import PlotAxis from './PlotAxis'
import ResetButton from './ResetButton'

class RectPlot {
  constructor (state,
    width,
    height,
    X,
    Y,
    Z,
    group,
    label,
    labelAlt = [],
    svg,
    fixedRatio,
    title = '',
    titleFontFamily,
    titleFontSize = 16,
    titleFontColor,
    subtitle = '',
    subtitleFontFamily = 'Arial',
    subtitleFontSize = 12,
    subtitleFontColor = 'black',
    footer = '',
    footerFontFamily = 'Arial',
    footerFontSize = 8,
    footerFontColor = 'black',
    xTitle,
    xTitleFontFamily,
    xTitleFontSize,
    xTitleFontColor,
    yTitle,
    yTitleFontFamily,
    yTitleFontSize,
    yTitleFontColor,
    zTitle = '',
    colors,
    transparency,
    grid,
    origin,
    originAlign,
    showLabels = true,
    labelsFontFamily,
    labelsFontSize,
    labelsFontColor,
    labelsLogoScale = [],
    xDecimals = null,
    yDecimals = null,
    zDecimals = null,
    xPrefix = '',
    yPrefix = '',
    zPrefix = '',
    xSuffix = '',
    ySuffix = '',
    zSuffix = '',
    legendShow = true,
    legendBubblesShow = true,
    legendFontFamily,
    legendFontSize,
    legendFontColor,
    legendBubbleFontFamily,
    legendBubbleFontSize,
    legendBubbleFontColor,
    legendBubbleTitleFontFamily,
    legendBubbleTitleFontSize,
    legendBubbleTitleFontColor,
    showXAxis = true,
    showYAxis = true,
    axisFontFamily,
    axisFontColor = 'black',
    axisFontSize = 12,
    pointRadius = 2,
    xBoundsMinimum = null,
    xBoundsMaximum = null,
    yBoundsMinimum = null,
    yBoundsMaximum = null,
    xBoundsUnitsMajor = null,
    yBoundsUnitsMajor = null,
    trendLines = false,
    trendLinesLineThickness = 1,
    trendLinesPointSize = 2,
    plotBorderShow = true,
    plotBorderColor = 'black',
    plotBorderWidth = 1,
    debugMode = false
  ) {
    autoBind(this)
    this.pltUniqueId = md5((new Date()).getTime())
    this.state = state
    this.width = width
    this.height = height
    this.X = X
    this.Y = Y
    this.Z = Z
    this.group = group
    this.label = label
    this.labelAlt = labelAlt
    this.svg = svg
    this.zTitle = zTitle
    this.colors = colors
    this.transparency = transparency
    this.originAlign = originAlign
    this.showLabels = showLabels
    this.xDecimals = xDecimals
    this.yDecimals = yDecimals
    this.zDecimals = zDecimals
    this.xPrefix = xPrefix
    this.yPrefix = yPrefix
    this.zPrefix = zPrefix
    this.xSuffix = xSuffix
    this.ySuffix = ySuffix
    this.zSuffix = zSuffix
    this.pointRadius = pointRadius
    this.xBoundsUnitsMajor = xBoundsUnitsMajor
    this.yBoundsUnitsMajor = yBoundsUnitsMajor
    this.plotBorder = {
      show: plotBorderShow,
      color: plotBorderColor,
      width: parseInt(plotBorderWidth) + 'px'
    }
    this.maxDrawFailureCount = 200

    this.axisSettings = {
      fontFamily: axisFontFamily,
      fontSize: axisFontSize,
      fontColor: axisFontColor,
      showX: showXAxis,
      showY: showYAxis
    }

    this.labelsFont = {
      size: labelsFontSize,
      color: labelsFontColor,
      family: labelsFontFamily,
      logoScale: labelsLogoScale
    }

    this.xTitle = {
      text: xTitle,
      textHeight: xTitleFontSize,
      fontFamily: xTitleFontFamily,
      fontSize: xTitleFontSize,
      fontColor: xTitleFontColor,
      topPadding: 5
    }

    this.legendSettings = new LegendSettings(legendShow, legendBubblesShow,
      legendFontFamily, legendFontSize, legendFontColor,
      legendBubbleFontFamily, legendBubbleFontSize, legendBubbleFontColor,
      legendBubbleTitleFontFamily, legendBubbleTitleFontSize, legendBubbleTitleFontColor, this.zTitle)

    if (this.xTitle.text === '') { this.xTitle.textHeight = 0 }

    this.yTitle = {
      text: yTitle,
      textHeight: yTitleFontSize,
      fontFamily: yTitleFontFamily,
      fontSize: yTitleFontSize,
      fontColor: yTitleFontColor
    }
    if (this.yTitle.text === '') { this.yTitle.textHeight = 0 }

    this.trendLines = {
      show: trendLines,
      lineThickness: trendLinesLineThickness,
      pointSize: trendLinesPointSize
    }

    this.axisLeaderLineLength = 5
    this.axisDimensionText = {
      rowMaxWidth: 0,
      rowMaxHeight: 0,
      colMaxWidth: 0,
      colMaxHeight: 0,
      rightPadding: 0  // Set later, for when axis markers labels protrude (VIS-146)
    }

    this.padding = {
      vertical: 5,
      horizontal: 10
    }

    this.bounds = {
      xmin: xBoundsMinimum,
      xmax: xBoundsMaximum,
      ymin: yBoundsMinimum,
      ymax: yBoundsMaximum
    }

    this.title = new Title(title, titleFontColor, titleFontSize, titleFontFamily, this.axisSettings.fontSize, this.padding.vertical)
    this.subtitle = new Subtitle(subtitle, subtitleFontColor, subtitleFontSize, subtitleFontFamily, this.title.text)
    this.subtitle.setY(this.title.getSubtitleY())
    this.footer = new Footer(footer, footerFontColor, footerFontSize, footerFontFamily, this.height)

    this.grid = !(_.isNull(grid)) ? grid : true
    this.origin = !(_.isNull(origin)) ? origin : true
    this.fixedRatio = !(_.isNull(fixedRatio)) ? fixedRatio : true

    if (_.isNull(this.label)) {
      this.label = _.map(X, () => { return '' })
      this.showLabels = false
    }

    this.debugMode = debugMode

    this.setDim(this.svg, this.width, this.height)
  }

  setDim (svg, width, height) {
    this.svg = svg
    this.width = width
    this.height = height
    const initTitleX = this.width / 2
    this.title.setX(initTitleX)
    this.subtitle.setX(initTitleX)
    this.footer.setX(initTitleX)
    this.legend = new Legend(this.legendSettings, this.xPrefix, this.yPrefix, this.zPrefix, this.xSuffix, this.ySuffix, this.zSuffix)

    this.vb = new ViewBox(width, height, this.padding, this.legend, this.title, this.subtitle, this.footer,
      this.labelsFont, this.axisLeaderLineLength, this.axisDimensionText, this.xTitle, this.yTitle)

    this.legend.setX(this.vb.getLegendX())
    this.title.setX(this.vb.getTitleX())
    this.subtitle.setX(this.vb.getTitleX())
    this.footer.setX(this.vb.getTitleX())

    this.data = new PlotData(this.X,
                         this.Y,
                         this.Z,
                         this.group,
                         this.label,
                         this.labelAlt,
                         this.vb,
                         this.legend,
                         this.colors,
                         this.fixedRatio,
                         this.originAlign,
                         this.pointRadius,
                         this.bounds,
                         this.transparency,
                         this.legendSettings)

    this.drawFailureCount = 0
  }

  draw () {
    this.drawDimensionMarkers()
      .then(this.drawLegend.bind(this))
      .then(this.drawLabsAndPlot.bind(this))
      .then(() => {
        // TODO Po if you remove this then the life expectancy bubble plot will not have the legendLabels in the legend. It will only have the groups
        if (this.data.legendRequiresRedraw) {
          return this.drawLegend()
        }
      })
      .then(() => {
        const debugMsg = new DebugMessage(this.svg, this.vb, this.debugMode)
        debugMsg.draw(this.data.lab)
        console.log(`draw succeeded after ${this.drawFailureCount} failures`)
        this.drawFailureCount = 0
      })
      .catch((err) => {
        this.drawFailureCount++
        if (this.drawFailureCount >= this.maxDrawFailureCount) {
          console.log(`draw failure ${err.message} (fail count: ${this.drawFailureCount}). Exceeded max draw failures of ${this.maxDrawFailureCount}. Terminating`)
          throw err
        }

        if (err && err.retry) {
          console.log(`draw failure ${err.message} (fail count: ${this.drawFailureCount}). Redrawing`)
          return this.draw()
        }

        throw err
      })
  }

  isEqual (otherPlot) {
    // Test if RectPlot is equal to another, does not include all parameters for comparison (only those set in Displayr added now)
    // TODO: Add rest of the data components
    const eqX = _.isEqual(this.X, otherPlot.X)
    const eqY = _.isEqual(this.Y, otherPlot.Y)
    const eqZ = _.isEqual(this.Z, otherPlot.Z)
    const eqGroup = _.isEqual(this.group, otherPlot.group)
    const eqLabel = _.isEqual(this.label, otherPlot.label)
    const eqLabelAlt = _.isEqual(this.labelAlt, otherPlot.labelAlt)
    const eqTitle = _.isEqual(this.title.text, otherPlot.title)
    const eqXTitle = _.isEqual(this.xTitle.text, otherPlot.xTitle)
    const eqYTitle = _.isEqual(this.yTitle.text, otherPlot.yTitle)
    const eqZTitle = _.isEqual(this.zTitle, otherPlot.zTitle)
    const listOfComparisons = [eqX, eqY, eqZ, eqGroup, eqLabel, eqLabelAlt, eqTitle, eqXTitle, eqYTitle, eqZTitle]
    return _.every(listOfComparisons, e => _.isEqual(e, true))
  }

  drawLabsAndPlot () {
    this.data.normalizeData()

    return this.data.getPtsAndLabs('RectPlot.drawLabsAndPlot').then(() => {
      const titlesX = this.vb.x + (this.vb.width / 2)
      this.title.setX(titlesX)
      this.subtitle.setX(titlesX)
      this.footer.setX(titlesX)

      if (!this.state.isLegendPtsSynced(this.data.outsidePlotPtsId)) {
        _.map(this.state.getLegendPts(), pt => {
          if (!_.includes(this.data.outsidePlotPtsId, pt)) {
            this.data.addElemToLegend(pt)
          }
        })

        _.map(this.data.outsidePlotPtsId, pt => {
          if (!_.includes(this.state.getLegendPts(), pt)) {
            this.state.pushLegendPt(pt)
          }
        })
        const error = new Error('drawLabsAndPlot failed : state.isLegendPtsSynced = false')
        error.retry = true
        throw error
      }
    }).then(() => {
      try {
        this.title.drawWith(this.pltUniqueId, this.svg)
        this.subtitle.drawWith(this.pltUniqueId, this.svg)
        this.footer.drawWith(this.pltUniqueId, this.svg)
        this.drawResetButton()
        this.drawAnc()
        this.drawLabs()
        if (this.trendLines.show) { this.drawTrendLines() }
        this.drawDraggedMarkers()
        if (this.plotBorder.show) { this.vb.drawBorderWith(this.svg, this.plotBorder) }
        this.axisLabels = new PlotAxisLabels(this.vb, this.axisLeaderLineLength, this.axisDimensionText, this.xTitle, this.yTitle, this.padding)
        this.axisLabels.drawWith(this.svg)
      } catch (error) {
        console.log(error)
      }
    })
  }

  drawResetButton () {
    const resetCallback = () => {
      this.data.resetLegendPts()
      this.state.resetStateLegendPtsAndPositionedLabs()
      this.draw()
    }
    this.resetButton = new ResetButton(resetCallback)
    this.resetButton.drawWith(this.svg, this.width, this.height, this.title, this.state.hasStateBeenAlteredByUser())
  }

  drawDimensionMarkers () {
    return new Promise((function (resolve, reject) {
      this.axis = new PlotAxis(this.axisSettings, this, this.data, this.vb)

      if (this.grid) {
        this.axis.drawGridOriginWith(this.svg, this.origin)
        this.axis.drawGridLinesWith(this.svg)
      } else if (!this.grid && this.origin) {
        this.axis.drawGridOriginWith(this.svg, this.origin)
      }

      if (this.axisSettings.showX || this.axisSettings.showY) {
        this.axis.drawAxisLeaderWith(this.svg, this.origin)
        const markerLabels = this.svg.selectAll('.dim-marker-label')

        // Figure out the max width of the yaxis dimensional labels
        const initAxisTextRowWidth = this.axisDimensionText.rowMaxWidth
        const initAxisTextColWidth = this.axisDimensionText.colMaxWidth
        const initAxisTextRowHeight = this.axisDimensionText.rowMaxHeight
        const initAxisTextColHeight = this.axisDimensionText.colMaxHeight
        for (let i = 0; i < markerLabels[0].length; i++) {
          const markerLabel = markerLabels[0][i]
          const labelType = d3.select(markerLabel).attr('type')
          const bb = markerLabel.getBBox()
          if ((this.axisDimensionText.rowMaxWidth < bb.width) && (labelType === 'row')) { this.axisDimensionText.rowMaxWidth = bb.width }
          if ((this.axisDimensionText.colMaxWidth < bb.width) && (labelType === 'col')) { this.axisDimensionText.colMaxWidth = bb.width }
          if ((this.axisDimensionText.rowMaxHeight < bb.height) && (labelType === 'row')) { this.axisDimensionText.rowMaxHeight = bb.height }
          if ((this.axisDimensionText.colMaxHeight < bb.height) && (labelType === 'col')) { this.axisDimensionText.colMaxHeight = bb.height }

          if (this.width < (bb.x + bb.width)) {
            this.axisDimensionText.rightPadding = bb.width / 2
          }
        }

        if ((initAxisTextRowWidth !== this.axisDimensionText.rowMaxWidth) ||
          (initAxisTextColWidth !== this.axisDimensionText.colMaxWidth) ||
          (initAxisTextRowHeight !== this.axisDimensionText.rowMaxHeight) ||
          (initAxisTextColHeight !== this.axisDimensionText.colMaxHeight)) {
          this.setDim(this.svg, this.width, this.height)
          this.data.revertMinMax()
          const error = new Error('axis marker out of bound')
          error.retry = true
          return reject(error)
        }
      }

      return resolve()
    }.bind(this)))
  }

  drawLegend () {
    return new Promise(function (resolve, reject) {
      this.data.setLegend()
      if (this.legendSettings.showBubblesInLegend() && Utils.isArrOfNums(this.Z)) {
        this.legend.drawBubblesWith(this.svg, this.axisSettings)
        this.legend.drawBubblesLabelsWith(this.svg)
        this.legend.drawBubblesTitleWith(this.svg)
      }

      const drag = DragUtils.getLegendLabelDragAndDrop(this, this.data)
      this.legend.drawDraggedPtsTextWith(this.svg, drag)

      if (this.legendSettings.showLegend()) {
        this.legend.drawGroupsTextWith(this.svg)
        this.legend.drawGroupsPts(this.svg)
      }

      if (this.legendSettings.isDisplayed(this.Z, this.data.legendPts)) {
        if (this.legend.resizedAfterLegendGroupsDrawn(this.data.vb, this.axisDimensionText)) {
          this.data.revertMinMax()
          const error = new Error('drawLegend Failed')
          error.retry = true
          return reject(error)
        }
      }
      return resolve()
    }.bind(this))
  }

  drawAnc () {
    this.svg.selectAll('.anc').remove()
    const anc = this.svg.selectAll('.anc')
             .data(this.data.pts)
             .enter()
             .append('circle')
             .attr('class', 'anc')
             .attr('id', d => `anc-${d.id}`)
             .attr('cx', d => d.x)
             .attr('cy', d => d.y)
             .attr('fill', d => d.color)
             .attr('fill-opacity', d => d.fillOpacity)
             .attr('r', (d) => {
               if (this.trendLines.show) {
                 return this.trendLines.pointSize
               } else {
                 return d.r
               }
             })
    TooltipUtils.appendTooltips(anc, this.Z, this.xDecimals, this.yDecimals,
      this.zDecimals, this.xPrefix, this.yPrefix, this.zPrefix, this.xSuffix, this.ySuffix, this.zSuffix)
    // Clip paths used to crop bubbles if they expand beyond the plot's borders
    if (Utils.isArrOfNums(this.Z)) {
      this.svg.selectAll('clipPath').remove()
      SvgUtils.clipBubbleIfOutsidePlotArea(this.svg, this.data.pts, this.vb, this.pltUniqueId)
    }
  }

  drawDraggedMarkers () {
    this.svg.selectAll('.marker').remove()
    this.svg.selectAll('.marker')
        .data(this.data.outsidePlotMarkers)
        .enter()
        .append('line')
        .attr('class', 'marker')
        .attr('x1', d => d.x1)
        .attr('y1', d => d.y1)
        .attr('x2', d => d.x2)
        .attr('y2', d => d.y2)
        .attr('stroke-width', d => d.width)
        .attr('stroke', d => d.color)

    this.svg.selectAll('.marker-label').remove()
    this.svg.selectAll('.marker-label')
        .data(this.data.outsidePlotMarkers)
        .enter()
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', d => d.markerTextX)
        .attr('y', d => d.markerTextY)
        .attr('font-family', 'Arial')
        .attr('text-anchor', 'start')
        .attr('font-size', this.legend.getMarkerTextSize())
        .attr('fill', d => d.color)
        .text(d => d.markerLabel)
  }

  resetPlotAfterDragEvent () {
    const plotElems = [
      '.plot-viewbox',
      '.origin',
      '.dim-marker',
      '.dim-marker-leader',
      '.dim-marker-label',
      '.axis-label',
      '.legend-pts',
      '.legend-text',
      '.anc',
      '.lab',
      '.link'
    ]
    for (const elem of Array.from(plotElems)) {
      this.svg.selectAll(elem).remove()
    }
    return this.draw()
  }

  drawLabs () {
    let drag
    if (this.showLabels) {
      if (!this.trendLines.show) {
        drag = DragUtils.getLabelDragAndDrop(this)
        this.state.updateLabelsWithPositionedData(this.data.lab, this.data.vb)

        this.svg.selectAll('.lab-img').remove()
        this.svg.selectAll('.lab-img')
            .data(_.filter(this.data.lab, l => l.url !== ''))
            .enter()
            .append('svg:image')
            .attr('class', 'lab-img')
            .attr('xlink:href', d => d.url)
            .attr('id', d => d.id)
            .attr('x', d => d.x - (d.width / 2))
            .attr('y', d => d.y - d.height)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .call(drag)

        this.svg.selectAll('.lab').remove()
        this.svg.selectAll('.lab')
                 .data(_.filter(this.data.lab, l => l.url === ''))
                 .enter()
                 .append('text')
                 .attr('class', 'lab')
                 .attr('id', d => d.id)
                 .attr('x', d => d.x)
                 .attr('y', d => d.y)
                 .attr('font-family', d => d.fontFamily)
                 .text(d => d.text)
                 .attr('text-anchor', 'middle')
                 .attr('fill', d => d.color)
                 .attr('font-size', d => d.fontSize)
                 .style('cursor', 'pointer')
                 .call(drag)

        LabelPlacement.placeLabels(
          this.svg,
          this.data.vb,
          this.data.pts,
          this.data.lab,
          this.state
        )

        this.drawLinks()
      } else if (this.trendLines.show) {
        this.tl = new TrendLine(this.data.pts, this.data.lab)
        this.state.updateLabelsWithPositionedData(this.data.lab, this.data.vb)

        drag = DragUtils.getLabelDragAndDrop(this, this.trendLines.show)
        this.tl.drawLabelsWith(this.svg, drag)
        LabelPlacement.placeTrendLabels(
          this.svg,
          this.data.vb,
          this.tl.pts,
          this.tl.arrowheadLabels,
          this.state
        )
      }
    }
  }

  drawLinks () {
    const links = new Links(this.data.pts, this.data.lab)
    links.drawWith(this.svg, this.data.plotColors, this.transparency)
  }

  drawTrendLines () {
    this.state.updateLabelsWithPositionedData(this.data.lab, this.data.vb)
    if ((this.tl === undefined) || (this.tl === null)) {
      this.tl = new TrendLine(this.data.pts, this.data.lab)
    }
    this.tl.drawWith(this.svg, this.data.plotColors, this.trendLines)
  }
}

module.exports = RectPlot
