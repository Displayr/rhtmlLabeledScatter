
import _ from 'lodash';
import d3 from 'd3';
import labeler from './lib/labeler';
import Links from './Links';
import PlotData from './PlotData'; // busted when uglify is enabled
import TrendLine from './TrendLine';
import AxisUtils from './utils/AxisUtils'; // busted when uglify is enabled
import DragUtils from './utils/DragUtils';
import SvgUtils from './utils/SvgUtils';
import Utils from './utils/Utils';
import TooltipUtils from './utils/TooltipUtils';

class RectPlot {
  constructor(state,
    width,
    height,
    X,
    Y,
    Z,
    group,
    label,
    labelAlt,
    svg,
    fixedRatio,
    xTitle,
    yTitle,
    zTitle,
    title,
    colors,
    transparency,
    grid,
    origin,
    originAlign,
    titleFontFamily,
    titleFontSize,
    titleFontColor,
    xTitleFontFamily,
    xTitleFontSize,
    xTitleFontColor,
    yTitleFontFamily,
    yTitleFontSize,
    yTitleFontColor,
    showLabels,
    labelsFontFamily,
    labelsFontSize,
    labelsFontColor,
    labelsLogoScale,
    xDecimals,
    yDecimals,
    zDecimals,
    xPrefix,
    yPrefix,
    zPrefix,
    xSuffix,
    ySuffix,
    zSuffix,
    legendShow,
    legendBubblesShow,
    legendFontFamily,
    legendFontSize,
    legendFontColor,
    showAxis = true,
    axisFontFamily,
    axisFontColor,
    axisFontSize,
    pointRadius,
    xBoundsMinimum,
    xBoundsMaximum,
    yBoundsMinimum,
    yBoundsMaximum,
    xBoundsUnitsMajor,
    yBoundsUnitsMajor,
    trendLines,
    trendLinesLineThickness,
    trendLinesPointSize,
    plotBorderShow = true,
  ) {
    this.setDim = this.setDim.bind(this);
    this.draw = this.draw.bind(this);
    this.drawLabsAndPlot = this.drawLabsAndPlot.bind(this);
    this.drawTitle = this.drawTitle.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.drawDimensionMarkers = this.drawDimensionMarkers.bind(this);
    this.drawAxisLabels = this.drawAxisLabels.bind(this);
    this.drawLegend = this.drawLegend.bind(this);
    this.drawAnc = this.drawAnc.bind(this);
    this.drawDraggedMarkers = this.drawDraggedMarkers.bind(this);
    this.resetPlotAfterDragEvent = this.resetPlotAfterDragEvent.bind(this);
    this.drawLabs = this.drawLabs.bind(this);
    this.drawLinks = this.drawLinks.bind(this);
    this.drawTrendLines = this.drawTrendLines.bind(this);
    this.state = state;
    this.width = width;
    this.height = height;
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.group = group;
    this.label = label;
    if (_.isNull(labelAlt)) { labelAlt = []; }
    this.labelAlt = labelAlt;
    this.svg = svg;
    if (_.isNull(zTitle)) { zTitle = ''; }
    this.zTitle = zTitle;
    this.colors = colors;
    this.transparency = transparency;
    this.originAlign = originAlign;
    if (_.isNull(showLabels)) { showLabels = true; }
    this.showLabels = showLabels;
    if (_.isNull(labelsLogoScale)) { labelsLogoScale = []; }
    if (_.isNull(xDecimals)) { xDecimals = null; }
    this.xDecimals = xDecimals;
    if (_.isNull(yDecimals)) { yDecimals = null; }
    this.yDecimals = yDecimals;
    if (_.isNull(zDecimals)) { zDecimals = null; }
    this.zDecimals = zDecimals;
    if (_.isNull(xPrefix)) { xPrefix = ''; }
    this.xPrefix = xPrefix;
    if (_.isNull(yPrefix)) { yPrefix = ''; }
    this.yPrefix = yPrefix;
    if (_.isNull(zPrefix)) { zPrefix = ''; }
    this.zPrefix = zPrefix;
    if (_.isNull(xSuffix)) { xSuffix = ''; }
    this.xSuffix = xSuffix;
    if (_.isNull(ySuffix)) { ySuffix = ''; }
    this.ySuffix = ySuffix;
    if (_.isNull(zSuffix)) { zSuffix = ''; }
    this.zSuffix = zSuffix;
    this.legendShow = legendShow;
    if (_.isNull(legendBubblesShow)) { legendBubblesShow = true; }
    this.legendBubblesShow = legendBubblesShow;
    this.legendFontFamily = legendFontFamily;
    this.legendFontSize = legendFontSize;
    this.legendFontColor = legendFontColor;
    if (_.isNull(pointRadius)) { pointRadius = 2; }
    this.pointRadius = pointRadius;
    if (_.isNull(xBoundsMinimum)) { xBoundsMinimum = null; }
    if (_.isNull(xBoundsMaximum)) { xBoundsMaximum = null; }
    if (_.isNull(yBoundsMinimum)) { yBoundsMinimum = null; }
    if (_.isNull(yBoundsMaximum)) { yBoundsMaximum = null; }
    if (_.isNull(xBoundsUnitsMajor)) { xBoundsUnitsMajor = null; }
    this.xBoundsUnitsMajor = xBoundsUnitsMajor;
    if (_.isNull(yBoundsUnitsMajor)) { yBoundsUnitsMajor = null; }
    this.yBoundsUnitsMajor = yBoundsUnitsMajor;
    if (_.isNull(trendLines)) { trendLines = false; }
    if (_.isNull(trendLinesLineThickness)) { trendLinesLineThickness = 1; }
    if (_.isNull(trendLinesPointSize)) { trendLinesPointSize = 2; }
    if (_.isNull(plotBorderShow)) { plotBorderShow = true; }
    this.plotBorderShow = plotBorderShow;
    this.maxDrawFailureCount = 200;
    
    this.axisSettings = {
      fontFamily: axisFontFamily,
      fontSize: axisFontSize,
      fontColor: axisFontColor,
      show: showAxis,
    };

    this.labelsFont = {
      size: labelsFontSize,
      color: labelsFontColor,
      family: labelsFontFamily,
      logoScale: labelsLogoScale,
    };

    this.xTitle = {
      text: xTitle,
      textHeight: xTitleFontSize,
      fontFamily: xTitleFontFamily,
      fontSize: xTitleFontSize,
      fontColor: xTitleFontColor,
      topPadding: 5,
    };
    if (this.xTitle.text === '') { this.xTitle.textHeight = 0; }

    this.yTitle = {
      text: yTitle,
      textHeight: yTitleFontSize,
      fontFamily: yTitleFontFamily,
      fontSize: yTitleFontSize,
      fontColor: yTitleFontColor,
    };
    if (this.yTitle.text === '') { this.yTitle.textHeight = 0; }

    this.trendLines = {
      show: trendLines,
      lineThickness: trendLinesLineThickness,
      pointSize: trendLinesPointSize,
    };

    this.axisLeaderLineLength = 5;
    this.axisDimensionText = {
      rowMaxWidth: 0,
      rowMaxHeight: 0,
      colMaxWidth: 0,
      colMaxHeight: 0,
      rightPadding: 0,  // Set later, for when axis markers labels protrude (VIS-146)
    };
    this.verticalPadding = 5;
    this.horizontalPadding = 10;

    this.bounds = {
      xmin: xBoundsMinimum,
      xmax: xBoundsMaximum,
      ymin: yBoundsMinimum,
      ymax: yBoundsMaximum,
    };

    this.title = {
      text: title,
      color: titleFontColor,
      anchor: 'middle',
      fontSize: titleFontSize,
      fontWeight: 'normal',
      fontFamily: titleFontFamily,
    };

    if (this.title.text === '') {
      this.title.textHeight = 0;
      this.title.paddingBot = 0;
    } else {
      this.title.textHeight = titleFontSize;
      this.title.paddingBot = 20;
    }

    this.title.y = this.verticalPadding + this.title.textHeight;

    this.grid = !(_.isNull(grid)) ? grid : true;
    this.origin = !(_.isNull(origin)) ? origin : true;
    this.fixedRatio = !(_.isNull(fixedRatio)) ? fixedRatio : true;

    if (_.isNull(this.label)) {
      this.label = [];
      for (const x of Array.from(this.X)) {
        this.label.push('');
      }
      this.showLabels = false;
    }

    this.setDim(this.svg, this.width, this.height);
  }

  setDim(svg, width, height) {
    this.svg = svg;
    this.title.x = width / 2;
    this.legendDim = {
      width: 0,  // init value
      heightOfRow: this.legendFontSize + 9, // init val
      rightPadding: this.legendFontSize / 1.6,
      leftPadding: this.legendFontSize / 0.8,
      centerPadding: this.legendFontSize / 0.53,
      ptRadius: this.legendFontSize / 2.67,
      ptToTextSpace: this.legendFontSize,
      vertPtPadding: 5,
      cols: 1,
      markerLen: 5,
      markerWidth: 1,
      markerTextSize: 10,
      markerCharWidth: 4,
    };

    this.viewBoxDim = {
      svgWidth: width,
      svgHeight: height,
      width: width - this.legendDim.width - (this.horizontalPadding * 3) - this.axisLeaderLineLength - this.axisDimensionText.rowMaxWidth - this.yTitle.textHeight - this.axisDimensionText.rightPadding,
      height: height - (this.verticalPadding * 2) - this.title.textHeight - this.title.paddingBot - this.axisDimensionText.colMaxHeight - this.xTitle.textHeight - this.axisLeaderLineLength - this.xTitle.topPadding,
      x: (this.horizontalPadding * 2) + this.axisDimensionText.rowMaxWidth + this.axisLeaderLineLength + this.yTitle.textHeight,
      y: this.verticalPadding + this.title.textHeight + this.title.paddingBot,
      labelFontSize: this.labelsFont.size,
      labelSmallFontSize: this.labelsFont.size * 0.75,
      labelFontColor: this.labelsFont.color,
      labelFontFamily: this.labelsFont.family,
      labelLogoScale: this.labelsFont.logoScale,
    };

    this.legendDim.x = this.viewBoxDim.x + this.viewBoxDim.width;
    this.title.x = this.viewBoxDim.x + (this.viewBoxDim.width / 2);

    this.data = new PlotData(this.X,
                         this.Y,
                         this.Z,
                         this.group,
                         this.label,
                         this.labelAlt,
                         this.viewBoxDim,
                         this.legendDim,
                         this.colors,
                         this.fixedRatio,
                         this.originAlign,
                         this.pointRadius,
                         this.bounds,
                         this.transparency,
                         this.legendShow,
                         this.legendBubblesShow,
                         this.axisDimensionText);

    return this.drawFailureCount = 0;
  }

  draw() {
    return this.drawDimensionMarkers()
      .then(this.drawLegend.bind(this))
      .then(this.drawLabsAndPlot.bind(this))
      .then(() => {
        // TODO Po if you remove this then the life expectancy bubble plot will not have the legendLabels in the legend. It will only have the groups
        if (this.data.legendRequiresRedraw) {
          return this.drawLegend();
        }
      })
      .then(() => {
        console.log(`draw succeeded after ${this.drawFailureCount} failures`);
        return this.drawFailureCount = 0;
      })
      .catch((err) => {
        this.drawFailureCount++;
        if (this.drawFailureCount >= this.maxDrawFailureCount) {
          console.log(`draw failure ${err.message} (fail count: ${this.drawFailureCount}). Exceeded max draw failures of ${this.maxDrawFailureCount}. Terminating`);
          throw err;
        }

        if (err && err.retry) {
          console.log(`draw failure ${err.message} (fail count: ${this.drawFailureCount}). Redrawing`);
          return this.draw();
        }

        throw err;
      });
  }

  drawLabsAndPlot() {
    this.data.normalizeData();

    return this.data.getPtsAndLabs('RectPlot.drawLabsAndPlot').then(() => {
      this.title.x = this.viewBoxDim.x + (this.viewBoxDim.width / 2);

      if (!this.state.isLegendPtsSynced(this.data.outsidePlotPtsId)) {
        for (var pt of Array.from(this.state.getLegendPts())) {
          if (!_.includes(this.data.outsidePlotPtsId, pt)) {
            this.data.addElemToLegend(pt);
          }
        }

        for (pt of Array.from(this.data.outsidePlotPtsId)) {
          if (!_.includes(this.state.getLegendPts(), pt)) {
            this.state.pushLegendPt(pt);
          }
        }
        const error = new Error('drawLabsAndPlot failed : state.isLegendPtsSynced = false');
        error.retry = true;
        throw error;
      }
    }).then(() => {
      try {
        this.drawTitle();
        this.drawAnc();
        this.drawLabs();
        if (this.trendLines.show) { this.drawTrendLines(); }
        this.drawDraggedMarkers();
        if (this.plotBorderShow) { this.drawRect(); }
        return this.drawAxisLabels();
      } catch (error) {
        return console.log(error);
      }
    });
  }

  drawTitle() {
    if (this.title.text !== '') {
      this.svg.selectAll('.plot-title').remove();
      return this.svg.append('text')
          .attr('class', 'plot-title')
          .attr('font-family', this.title.fontFamily)
          .attr('x', this.title.x)
          .attr('y', this.title.y)
          .attr('text-anchor', this.title.anchor)
          .attr('fill', this.title.color)
          .attr('font-size', this.title.fontSize)
          .attr('font-weight', this.title.fontWeight)
          .text(this.title.text);
    }
  }

  drawRect() {
    this.svg.selectAll('.plot-viewbox').remove();
    return this.svg.append('rect')
        .attr('class', 'plot-viewbox')
        .attr('x', this.viewBoxDim.x)
        .attr('y', this.viewBoxDim.y)
        .attr('width', this.viewBoxDim.width)
        .attr('height', this.viewBoxDim.height)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', '1px');
  }

  drawDimensionMarkers() {
    return new Promise((function (resolve, reject) {
      // TODO: unnecessary double call ? PlotData.constructor calls PlotData.calculateMinMax ?
      this.data.calculateMinMax();
      const axisArrays = AxisUtils.getAxisDataArrays(this, this.data, this.viewBoxDim);

      // TODO KZ this sequence can be easily consolidated
      if (this.grid) {
        this.svg.selectAll('.origin').remove();
        this.svg.selectAll('.origin')
            .data(axisArrays.gridOrigin)
            .enter()
            .append('line')
            .attr('class', 'origin')
            .attr('x1', function (d) { return d.x1; })
            .attr('y1', function (d) { return d.y1; })
            .attr('x2', function (d) { return d.x2; })
            .attr('y2', function (d) { return d.y2; })
            .attr('stroke-width', 0.2)
            .attr('stroke', 'grey');
        if (this.origin) {
          this.svg.selectAll('.origin')
              .style('stroke-dasharray', ('4, 6'))
              .attr('stroke-width', 1)
              .attr('stroke', 'black');
        }

        this.svg.selectAll('.dim-marker').remove();
        this.svg.selectAll('.dim-marker')
                 .data(axisArrays.gridLines)
                 .enter()
                 .append('line')
                 .attr('class', 'dim-marker')
                 .attr('x1', function (d) { return d.x1; })
                 .attr('y1', function (d) { return d.y1; })
                 .attr('x2', function (d) { return d.x2; })
                 .attr('y2', function (d) { return d.y2; })
                 .attr('stroke-width', 0.2)
                 .attr('stroke', 'grey');
      } else if (!this.grid && this.origin) {
        this.svg.selectAll('.origin').remove();
        this.svg.selectAll('.origin')
            .data(axisArrays.gridOrigin)
            .enter()
            .append('line')
            .attr('class', 'origin')
            .attr('x1', function (d) { return d.x1; })
            .attr('y1', function (d) { return d.y1; })
            .attr('x2', function (d) { return d.x2; })
            .attr('y2', function (d) { return d.y2; })
            .style('stroke-dasharray', ('4, 6'))
            .attr('stroke-width', 1)
            .attr('stroke', 'black');
      }


      if (this.axisSettings.show) {
        this.svg.selectAll('.dim-marker-leader').remove();
        this.svg.selectAll('.dim-marker-leader')
        .data(axisArrays.axisLeader)
        .enter()
        .append('line')
        .attr('class', 'dim-marker-leader')
        .attr('x1', function (d) { return d.x1; })
        .attr('y1', function (d) { return d.y1; })
        .attr('x2', function (d) { return d.x2; })
        .attr('y2', function (d) { return d.y2; })
        .attr('stroke-width', 1)
        .attr('stroke', 'black');
  
        this.svg.selectAll('.dim-marker-label').remove();
        const markerLabels = this.svg.selectAll('.dim-marker-label')
        .data(axisArrays.axisLeaderLabel)
        .enter()
        .append('text')
        .attr('class', 'dim-marker-label')
        .attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y; })
        .attr('font-family', this.axisSettings.fontFamily)
        .attr('fill', this.axisSettings.fontColor)
        .attr('font-size', this.axisSettings.fontSize)
        .text(function (d) { return d.label; })
        .attr('text-anchor', function (d) { return d.anchor; })
        .attr('type', function (d) { return d.type; });
  
        // Figure out the max width of the yaxis dimensional labels
        const initAxisTextRowWidth = this.axisDimensionText.rowMaxWidth;
        const initAxisTextColWidth = this.axisDimensionText.colMaxWidth;
        const initAxisTextRowHeight = this.axisDimensionText.rowMaxHeight;
        const initAxisTextColHeight = this.axisDimensionText.colMaxHeight;
        for (let i = 0; i < markerLabels[0].length; i++) {
          const markerLabel = markerLabels[0][i];
          const labelType = d3.select(markerLabel).attr('type');
          const bb = markerLabel.getBBox();
          if ((this.axisDimensionText.rowMaxWidth < bb.width) && (labelType === 'row')) { this.axisDimensionText.rowMaxWidth = bb.width; }
          if ((this.axisDimensionText.colMaxWidth < bb.width) && (labelType === 'col')) { this.axisDimensionText.colMaxWidth = bb.width; }
          if ((this.axisDimensionText.rowMaxHeight < bb.height) && (labelType === 'row')) { this.axisDimensionText.rowMaxHeight = bb.height; }
          if ((this.axisDimensionText.colMaxHeight < bb.height) && (labelType === 'col')) { this.axisDimensionText.colMaxHeight = bb.height; }
    
          if (this.width < (bb.x + bb.width)) {
            this.axisDimensionText.rightPadding = bb.width / 2;
          }
        }
  
        if ((initAxisTextRowWidth !== this.axisDimensionText.rowMaxWidth) ||
          (initAxisTextColWidth !== this.axisDimensionText.colMaxWidth) ||
          (initAxisTextRowHeight !== this.axisDimensionText.rowMaxHeight) ||
          (initAxisTextColHeight !== this.axisDimensionText.colMaxHeight)) {
          this.setDim(this.svg, this.width, this.height);
          this.data.revertMinMax();
          const error = new Error('axis marker out of bound');
          error.retry = true;
          return reject(error);
        }
      }
      
      return resolve();
    }.bind(this)));
  }


  drawAxisLabels() {
    const axisLabels = [
      { // x axis label
        x: this.viewBoxDim.x + (this.viewBoxDim.width / 2),
        y: this.viewBoxDim.y + this.viewBoxDim.height +
           this.axisLeaderLineLength +
           this.axisDimensionText.colMaxHeight +
           this.xTitle.topPadding +
           this.xTitle.textHeight,
        text: this.xTitle.text,
        anchor: 'middle',
        transform: 'rotate(0)',
        display: this.xTitle === '' ? 'none' : '',
        fontFamily: this.xTitle.fontFamily,
        fontSize: this.xTitle.fontSize,
        fontColor: this.xTitle.fontColor,
      },
      { // y axis label
        x: this.horizontalPadding + this.yTitle.textHeight,
        y: this.viewBoxDim.y + (this.viewBoxDim.height / 2),
        text: this.yTitle.text,
        anchor: 'middle',
        transform: `rotate(270,${this.horizontalPadding + this.yTitle.textHeight}, ${this.viewBoxDim.y + (this.viewBoxDim.height / 2)})`,
        display: this.yTitle === '' ? 'none' : '',
        fontFamily: this.yTitle.fontFamily,
        fontSize: this.yTitle.fontSize,
        fontColor: this.yTitle.fontColor,
      },
    ];

    this.svg.selectAll('.axis-label').remove();
    return this.svg.selectAll('.axis-label')
             .data(axisLabels)
             .enter()
             .append('text')
             .attr('class', 'axis-label')
             .attr('x', d => d.x)
             .attr('y', d => d.y)
             .attr('font-family', d => d.fontFamily)
             .attr('font-size', d => d.fontSize)
             .attr('fill', d => d.fontColor)
             .attr('text-anchor', d => d.anchor)
             .attr('transform', d => d.transform)
             .text(d => d.text)
             .style('font-weight', 'normal')
             .style('display', d => d.display);
  }

  drawLegend() {
    return new Promise((function (resolve, reject) {
      let legendFontSize;
      this.data.setupLegendGroupsAndPts();

      if (this.legendBubblesShow && Utils.isArrOfNums(this.Z)) {
        this.svg.selectAll('.legend-bubbles').remove();
        this.svg.selectAll('.legend-bubbles')
            .data(this.data.legendBubbles)
            .enter()
            .append('circle')
            .attr('class', 'legend-bubbles')
            .attr('cx', function (d) { return d.cx; })
            .attr('cy', function (d) { return d.cy; })
            .attr('r', function (d) { return d.r; })
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.5);

        this.svg.selectAll('.legend-bubbles-labels').remove();
        this.svg.selectAll('.legend-bubbles-labels')
            .data(this.data.legendBubbles)
            .enter()
            .append('text')
            .attr('class', 'legend-bubbles-labels')
            .attr('x', function (d) { return d.x; })
            .attr('y', function (d) { return d.y; })
            .attr('text-anchor', 'middle')
            .attr('font-size', this.legendFontSize)
            .attr('font-family', this.legendFontFamily)
            .attr('fill', this.legendFontColor)
            .text(function (d) { return d.text; });

        if (this.zTitle !== '') {
          ({ legendFontSize } = this);
          this.svg.selectAll('.legend-bubbles-title').remove();
          const legendBubbleTitleSvg = this.svg.selectAll('.legend-bubbles-title')
              .data(this.data.legendBubblesTitle)
              .enter()
              .append('text')
              .attr('class', 'legend-bubbles-title')
              .attr('x', function (d) { return d.x; })
              .attr('y', function (d) { return d.y - (legendFontSize * 1.5); })
              .attr('text-anchor', 'middle')
              .attr('font-family', this.legendFontFamily)
              .attr('font-weight', 'normal')
              .attr('fill', this.legendFontColor)
              .text(this.zTitle);

          SvgUtils.setSvgBBoxWidthAndHeight(this.data.legendBubblesTitle, legendBubbleTitleSvg);
        }
      }

      const drag = DragUtils.getLegendLabelDragAndDrop(this, this.data);
      this.svg.selectAll('.legend-dragged-pts-text').remove();
      this.svg.selectAll('.legend-dragged-pts-text')
          .data(this.data.legendPts)
          .enter()
          .append('text')
          .attr('class', 'legend-dragged-pts-text')
          .attr('id', function (d) { return `legend-${d.id}`; })
          .attr('x', function (d) { return d.x; })
          .attr('y', function (d) { return d.y; })
          .attr('font-family', this.legendFontFamily)
          .attr('font-size', this.legendFontSize)
          .attr('text-anchor', function (d) { return d.anchor; })
          .attr('fill', function (d) { return d.color; })
          .text(function (d) { if (!(_.isNull(d.markerId))) { return Utils.getSuperscript(d.markerId + 1) + d.text; } else { return d.text; } })
          .call(drag);

      SvgUtils.setSvgBBoxWidthAndHeight(this.data.legendPts, this.svg.selectAll('.legend-dragged-pts-text'));

      if (this.legendShow) {
        this.svg.selectAll('.legend-groups-text').remove();
        this.svg.selectAll('.legend-groups-text')
            .data(this.data.legendGroups)
            .enter()
            .append('text')
            .attr('class', 'legend-groups-text')
            .attr('x', function (d) { return d.x; })
            .attr('y', function (d) { return d.y; })
            .attr('font-family', this.legendFontFamily)
            .attr('fill', this.legendFontColor)
            .attr('font-size', this.legendFontSize)
            .text(function (d) { return d.text; })
            .attr('text-anchor', function (d) { return d.anchor; });

        this.svg.selectAll('.legend-groups-pts').remove();
        this.svg.selectAll('.legend-groups-pts')
                 .data(this.data.legendGroups)
                 .enter()
                 .append('circle')
                 .attr('class', 'legend-groups-pts')
                 .attr('cx', function (d) { return d.cx; })
                 .attr('cy', function (d) { return d.cy; })
                 .attr('r', function (d) { return d.r; })
                 .attr('fill', function (d) { return d.color; })
                 .attr('stroke', function (d) { return d.stroke; })
                 .attr('stroke-opacity', function (d) { return d['stroke-opacity']; })
                 .attr('fill-opacity', function (d) { return d.fillOpacity; });

        // Height and width are not provided
        SvgUtils.setSvgBBoxWidthAndHeight(this.data.legendGroups, this.svg.selectAll('.legend-groups-text'));
      }

      if (this.legendShow || (this.legendBubblesShow && Utils.isArrOfNums(this.Z)) || !(_.isNull(this.data.legendPts))) {
        if (this.data.resizedAfterLegendGroupsDrawn(this.legendShow)) {
          this.data.revertMinMax();
          const error = new Error('drawLegend Failed');
          error.retry = true;
          return reject(error);
        }
      }
      return resolve();
    }.bind(this)));
  }

  drawAnc() {
    this.svg.selectAll('.anc').remove();
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
             .attr('clip-path', d => `url(#cp-${d.id})`)
             .attr('r', (d) => {
               if (this.trendLines.show) {
                 return this.trendLines.pointSize;
               } else {
                 return d.r;
               }
             });
    TooltipUtils.appendTooltips(anc, this.Z, this.xDecimals, this.yDecimals,
      this.zDecimals, this.xPrefix, this.yPrefix, this.zPrefix, this.xSuffix, this.ySuffix, this.zSuffix);
    // Clip paths used to crop bubbles if they expand beyond the plot's borders
    if (Utils.isArrOfNums(this.Z)) {
      this.svg.selectAll('clipPath').remove();
      SvgUtils.clipBubbleIfOutsidePlotArea(this.svg, this.data.pts, this.viewBoxDim);
    }
  }

  drawDraggedMarkers() {
    this.svg.selectAll('.marker').remove();
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
        .attr('stroke', d => d.color);

    this.svg.selectAll('.marker-label').remove();
    return this.svg.selectAll('.marker-label')
        .data(this.data.outsidePlotMarkers)
        .enter()
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', d => d.markerTextX)
        .attr('y', d => d.markerTextY)
        .attr('font-family', 'Arial')
        .attr('text-anchor', 'start')
        .attr('font-size', this.data.legendDim.markerTextSize)
        .attr('fill', d => d.color)
        .text(d => d.markerLabel);
  }

  resetPlotAfterDragEvent() {
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
      '.link',
    ];
    for (const elem of Array.from(plotElems)) {
      this.svg.selectAll(elem).remove();
    }
    return this.draw();
  }

  drawLabs() {
    let drag,
      labels_img_svg,
      labels_svg;
    if (this.showLabels && !this.trendLines.show) {
      drag = DragUtils.getLabelDragAndDrop(this);
      this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);

      this.svg.selectAll('.lab-img').remove();
      this.svg.selectAll('.lab-img')
          .data(this.data.lab)
          .enter()
          .append('svg:image')
          .attr('class', 'lab-img')
          .attr('xlink:href', d => d.url)
          .attr('id', function (d) { if (d.url !== '') { return d.id; } })
          .attr('x', d => d.x - (d.width / 2))
          .attr('y', d => d.y - d.height)
          .attr('width', d => d.width)
          .attr('height', d => d.height)
          .call(drag);

      this.svg.selectAll('.lab').remove();
      this.svg.selectAll('.lab')
               .data(this.data.lab)
               .enter()
               .append('text')
               .attr('class', 'lab')
               .attr('id', function (d) { if (d.url === '') { return d.id; } })
               .attr('x', d => d.x)
               .attr('y', d => d.y)
               .attr('font-family', d => d.fontFamily)
               .text(function (d) { if (d.url === '') { return d.text; } })
               .attr('text-anchor', 'middle')
               .attr('fill', d => d.color)
               .attr('font-size', d => d.fontSize)
               .call(drag);

      labels_svg = this.svg.selectAll('.lab');
      labels_img_svg = this.svg.selectAll('.lab-img');

      SvgUtils.setSvgBBoxWidthAndHeight(this.data.lab, labels_svg);
      console.log('rhtmlLabeledScatter: Running label placement algorithm...');
      labeler()
        .svg(this.svg)
        .w1(this.viewBoxDim.x)
        .w2(this.viewBoxDim.x + this.viewBoxDim.width)
        .h1(this.viewBoxDim.y)
        .h2(this.viewBoxDim.y + this.viewBoxDim.height)
        .anchor(this.data.pts)
        .label(this.data.lab)
        .pinned(this.state.getUserPositionedLabIds())
        .start(500);

      labels_svg.transition()
                .duration(800)
                .attr('x', d => d.x)
                .attr('y', d => d.y);

      labels_img_svg.transition()
                    .duration(800)
                    .attr('x', d => d.x - (d.width / 2))
                    .attr('y', d => d.y - d.height);

      return this.drawLinks();
    } else if (this.showLabels && this.trendLines.show) {
      this.tl = new TrendLine(this.data.pts, this.data.lab);
      this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);

      drag = DragUtils.getLabelDragAndDrop(this, this.trendLines.show);

      this.svg.selectAll('.lab-img').remove();
      this.svg.selectAll('.lab-img')
        .data(this.tl.arrowheadLabels)
        .enter()
        .append('svg:image')
        .attr('class', 'lab-img')
        .attr('xlink:href', d => d.url)
        .attr('id', function (d) { if (d.url !== '') { return d.id; } })
        .attr('x', d => d.x - (d.width / 2))
        .attr('y', d => d.y - d.height)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .call(drag);


      this.svg.selectAll('.lab').remove();
      this.svg.selectAll('.lab')
        .data(this.tl.arrowheadLabels)
        .enter()
        .append('text')
        .attr('class', 'lab')
        .attr('id', function (d) { if (d.url === '') { return d.id; } })
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('font-family', d => d.fontFamily)
        .text(function (d) { if (d.url === '') { return d.text; } })
        .attr('text-anchor', 'middle')
        .attr('fill', d => d.color)
        .attr('font-size', d => d.fontSize)
        .call(drag);

      labels_svg = this.svg.selectAll('.lab');
      labels_img_svg = this.svg.selectAll('.lab-img');
      SvgUtils.setSvgBBoxWidthAndHeight(this.tl.arrowheadLabels, labels_svg);

      labeler()
         .svg(this.svg)
         .w1(this.viewBoxDim.x)
         .w2(this.viewBoxDim.x + this.viewBoxDim.width)
         .h1(this.viewBoxDim.y)
         .h2(this.viewBoxDim.y + this.viewBoxDim.height)
         .anchor(this.tl.arrowheadPts)
         .label(this.tl.arrowheadLabels)
         .pinned(this.state.getUserPositionedLabIds())
         .start(500);

      labels_svg.transition()
        .duration(800)
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      return labels_img_svg.transition()
        .duration(800)
        .attr('x', d => d.x - (d.width / 2))
        .attr('y', d => d.y - d.height);
    }
  }

  drawLinks() {
    const links = new Links(this.data.pts, this.data.lab);
    this.svg.selectAll('.link').remove();
    return this.svg.selectAll('.link')
             .data(links.getLinkData())
             .enter()
             .append('line')
             .attr('class', 'link')
             .attr('x1', d => d.x1)
             .attr('y1', d => d.y1)
             .attr('x2', d => d.x2)
             .attr('y2', d => d.y2)
             .attr('stroke-width', d => d.width)
             .attr('stroke', d => d.color)
             .style('stroke-opacity', this.data.plotColors.getFillOpacity(this.transparency));
  }

  drawTrendLines() {
    this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);
    if ((this.tl === undefined) || (this.tl === null)) {
      this.tl = new TrendLine(this.data.pts, this.data.lab);
    }

    return _.map(this.tl.getUniqueGroups(), (group) => {
      // Arrowhead marker
      this.svg.selectAll(`#triangle-${group}`).remove();
      this.svg.append('svg:defs').append('svg:marker')
          .attr('id', `triangle-${group}`)
          .attr('refX', 6)
          .attr('refY', 6)
          .attr('markerWidth', 30)
          .attr('markerHeight', 30)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 12 6 0 12 3 6')
          .style('fill', this.data.plotColors.getColorFromGroup(group));

      this.svg.selectAll(`.trendline-${group}`).remove();
      return this.svg.selectAll(`.trendline-${group}`)
        .data(this.tl.getLineArray(group))
        .enter()
        .append('line')
        .attr('class', `trendline-${group}`)
        .attr('x1', d => d[0])
        .attr('y1', d => d[1])
        .attr('x2', d => d[2])
        .attr('y2', d => d[3])
        .attr('stroke', this.data.plotColors.getColorFromGroup(group))
        .attr('stroke-width', this.trendLines.lineThickness)
        .attr('marker-end', (d, i) => {
          // Draw arrowhead on last element in trendline
          if (i === ((this.tl.getLineArray(group)).length - 1)) {
            return `url(#triangle-${group})`;
          }
        });
    });
  }
}

module.exports = RectPlot;
