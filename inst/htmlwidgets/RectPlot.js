(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RectPlot = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// KZ TODO replace global statements with imports once ES6 complete
/* global PlotData */
/* global AxisUtils */
/* global d3 */
/* global Utils */
/* global SvgUtils */
/* global DragUtils */
/* global TrendLine */
/* global Links */

var RectPlot = function () {
  function RectPlot(state, width, height, X, Y, Z, group, label, labelAlt, svg, fixedRatio, xTitle, yTitle, zTitle, title, colors, transparency, grid, origin, originAlign, titleFontFamily, titleFontSize, titleFontColor, xTitleFontFamily, xTitleFontSize, xTitleFontColor, yTitleFontFamily, yTitleFontSize, yTitleFontColor, showLabels, labelsFontFamily, labelsFontSize, labelsFontColor, labelsLogoScale, xDecimals, yDecimals, zDecimals, xPrefix, yPrefix, zPrefix, xSuffix, ySuffix, zSuffix, legendShow, legendBubblesShow, legendFontFamily, legendFontSize, legendFontColor, axisFontFamily, axisFontColor, axisFontSize, pointRadius, xBoundsMinimum, xBoundsMaximum, yBoundsMinimum, yBoundsMaximum, xBoundsUnitsMajor, yBoundsUnitsMajor, trendLines, trendLinesLineThickness, trendLinesPointSize, plotBorderShow) {
    _classCallCheck(this, RectPlot);

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
    if (labelAlt == null) {
      labelAlt = [];
    }
    this.labelAlt = labelAlt;
    this.svg = svg;
    if (zTitle == null) {
      zTitle = '';
    }
    this.zTitle = zTitle;
    this.colors = colors;
    this.transparency = transparency;
    this.originAlign = originAlign;
    if (showLabels == null) {
      showLabels = true;
    }
    this.showLabels = showLabels;
    if (labelsLogoScale == null) {
      labelsLogoScale = [];
    }
    if (xDecimals == null) {
      xDecimals = null;
    }
    this.xDecimals = xDecimals;
    if (yDecimals == null) {
      yDecimals = null;
    }
    this.yDecimals = yDecimals;
    if (zDecimals == null) {
      zDecimals = null;
    }
    this.zDecimals = zDecimals;
    if (xPrefix == null) {
      xPrefix = '';
    }
    this.xPrefix = xPrefix;
    if (yPrefix == null) {
      yPrefix = '';
    }
    this.yPrefix = yPrefix;
    if (zPrefix == null) {
      zPrefix = '';
    }
    this.zPrefix = zPrefix;
    if (xSuffix == null) {
      xSuffix = '';
    }
    this.xSuffix = xSuffix;
    if (ySuffix == null) {
      ySuffix = '';
    }
    this.ySuffix = ySuffix;
    if (zSuffix == null) {
      zSuffix = '';
    }
    this.zSuffix = zSuffix;
    this.legendShow = legendShow;
    if (legendBubblesShow == null) {
      legendBubblesShow = true;
    }
    this.legendBubblesShow = legendBubblesShow;
    this.legendFontFamily = legendFontFamily;
    this.legendFontSize = legendFontSize;
    this.legendFontColor = legendFontColor;
    this.axisFontFamily = axisFontFamily;
    this.axisFontColor = axisFontColor;
    this.axisFontSize = axisFontSize;
    if (pointRadius == null) {
      pointRadius = 2;
    }
    this.pointRadius = pointRadius;
    if (xBoundsMinimum == null) {
      xBoundsMinimum = null;
    }
    if (xBoundsMaximum == null) {
      xBoundsMaximum = null;
    }
    if (yBoundsMinimum == null) {
      yBoundsMinimum = null;
    }
    if (yBoundsMaximum == null) {
      yBoundsMaximum = null;
    }
    if (xBoundsUnitsMajor == null) {
      xBoundsUnitsMajor = null;
    }
    this.xBoundsUnitsMajor = xBoundsUnitsMajor;
    if (yBoundsUnitsMajor == null) {
      yBoundsUnitsMajor = null;
    }
    this.yBoundsUnitsMajor = yBoundsUnitsMajor;
    if (trendLines == null) {
      trendLines = false;
    }
    if (trendLinesLineThickness == null) {
      trendLinesLineThickness = 1;
    }
    if (trendLinesPointSize == null) {
      trendLinesPointSize = 2;
    }
    if (plotBorderShow == null) {
      plotBorderShow = true;
    }
    this.plotBorderShow = plotBorderShow;
    this.maxDrawFailureCount = 200;

    this.labelsFont = {
      size: labelsFontSize,
      color: labelsFontColor,
      family: labelsFontFamily,
      logoScale: labelsLogoScale
    };

    this.xTitle = {
      text: xTitle,
      textHeight: xTitleFontSize,
      fontFamily: xTitleFontFamily,
      fontSize: xTitleFontSize,
      fontColor: xTitleFontColor,
      topPadding: 5
    };
    if (this.xTitle.text === '') {
      this.xTitle.textHeight = 0;
    }

    this.yTitle = {
      text: yTitle,
      textHeight: yTitleFontSize,
      fontFamily: yTitleFontFamily,
      fontSize: yTitleFontSize,
      fontColor: yTitleFontColor
    };
    if (this.yTitle.text === '') {
      this.yTitle.textHeight = 0;
    }

    this.trendLines = {
      show: trendLines,
      lineThickness: trendLinesLineThickness,
      pointSize: trendLinesPointSize
    };

    this.axisLeaderLineLength = 5;
    this.axisDimensionText = {
      rowMaxWidth: 0,
      rowMaxHeight: 0,
      colMaxWidth: 0,
      colMaxHeight: 0,
      rightPadding: 0 };
    this.verticalPadding = 5;
    this.horizontalPadding = 10;

    this.bounds = {
      xmin: xBoundsMinimum,
      xmax: xBoundsMaximum,
      ymin: yBoundsMinimum,
      ymax: yBoundsMaximum
    };

    this.title = {
      text: title,
      color: titleFontColor,
      anchor: 'middle',
      fontSize: titleFontSize,
      fontWeight: 'normal',
      fontFamily: titleFontFamily
    };

    if (this.title.text === '') {
      this.title.textHeight = 0;
      this.title.paddingBot = 0;
    } else {
      this.title.textHeight = titleFontSize;
      this.title.paddingBot = 20;
    }

    this.title.y = this.verticalPadding + this.title.textHeight;

    this.grid = grid != null ? grid : true;
    this.origin = origin != null ? origin : true;
    this.fixedRatio = fixedRatio != null ? fixedRatio : true;

    if (this.label == null) {
      this.label = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(this.X)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var x = _step.value;

          this.label.push('');
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.showLabels = false;
    }

    this.setDim(this.svg, this.width, this.height);
  }

  RectPlot.prototype.setDim = function setDim(svg, width, height) {
    this.svg = svg;
    this.title.x = width / 2;
    this.legendDim = {
      width: 0, // init value
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
      markerCharWidth: 4
    };

    this.viewBoxDim = {
      svgWidth: width,
      svgHeight: height,
      width: width - this.legendDim.width - this.horizontalPadding * 3 - this.axisLeaderLineLength - this.axisDimensionText.rowMaxWidth - this.yTitle.textHeight - this.axisDimensionText.rightPadding,
      height: height - this.verticalPadding * 2 - this.title.textHeight - this.title.paddingBot - this.axisDimensionText.colMaxHeight - this.xTitle.textHeight - this.axisLeaderLineLength - this.xTitle.topPadding,
      x: this.horizontalPadding * 2 + this.axisDimensionText.rowMaxWidth + this.axisLeaderLineLength + this.yTitle.textHeight,
      y: this.verticalPadding + this.title.textHeight + this.title.paddingBot,
      labelFontSize: this.labelsFont.size,
      labelSmallFontSize: this.labelsFont.size * 0.75,
      labelFontColor: this.labelsFont.color,
      labelFontFamily: this.labelsFont.family,
      labelLogoScale: this.labelsFont.logoScale
    };

    this.legendDim.x = this.viewBoxDim.x + this.viewBoxDim.width;
    this.title.x = this.viewBoxDim.x + this.viewBoxDim.width / 2;

    this.data = new PlotData(this.X, this.Y, this.Z, this.group, this.label, this.labelAlt, this.viewBoxDim, this.legendDim, this.colors, this.fixedRatio, this.originAlign, this.pointRadius, this.bounds, this.transparency, this.legendShow, this.legendBubblesShow, this.axisDimensionText);

    return this.drawFailureCount = 0;
  };

  RectPlot.prototype.draw = function draw() {
    var _this = this;

    return this.drawDimensionMarkers().then(this.drawLegend.bind(this)).then(this.drawLabsAndPlot.bind(this)).then(function () {
      // TODO Po if you remove this then the life expectancy bubble plot will not have the legendLabels in the legend. It will only have the groups
      if (_this.data.legendRequiresRedraw) {
        return _this.drawLegend();
      }
    }).then(function () {
      console.log('draw succeeded after ' + _this.drawFailureCount + ' failures');
      return _this.drawFailureCount = 0;
    }).catch(function (err) {
      _this.drawFailureCount++;
      if (_this.drawFailureCount >= _this.maxDrawFailureCount) {
        console.log('draw failure ' + err.message + ' (fail count: ' + _this.drawFailureCount + '). Exceeded max draw failures of ' + _this.maxDrawFailureCount + '. Terminating');
        throw err;
      }

      if (err && err.retry) {
        console.log('draw failure ' + err.message + ' (fail count: ' + _this.drawFailureCount + '). Redrawing');
        return _this.draw();
      }

      throw err;
    });
  };

  RectPlot.prototype.drawLabsAndPlot = function drawLabsAndPlot() {
    var _this2 = this;

    this.data.normalizeData();

    return this.data.getPtsAndLabs('RectPlot.drawLabsAndPlot').then(function () {
      _this2.title.x = _this2.viewBoxDim.x + _this2.viewBoxDim.width / 2;

      if (!_this2.state.isLegendPtsSynced(_this2.data.outsidePlotPtsId)) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Array.from(_this2.state.getLegendPts())[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var pt = _step2.value;

            if (!(_.indexOf(_this2.data.outsidePlotPtsId, pt) !== -1)) {
              _this2.data.addElemToLegend(pt);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = Array.from(_this2.data.outsidePlotPtsId)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            pt = _step3.value;

            if (!(_.indexOf(_this2.state.getLegendPts(), pt) !== -1)) {
              _this2.state.pushLegendPt(pt);
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        var error = new Error('drawLabsAndPlot failed : state.isLegendPtsSynced = false');
        error.retry = true;
        throw error;
      }
    }).then(function () {
      try {
        _this2.drawTitle();
        _this2.drawAnc();
        _this2.drawLabs();
        if (_this2.trendLines.show) {
          _this2.drawTrendLines();
        }
        _this2.drawDraggedMarkers();
        if (_this2.plotBorderShow) {
          _this2.drawRect();
        }
        return _this2.drawAxisLabels();
      } catch (error) {
        return console.log(error);
      }
    });
  };

  RectPlot.prototype.drawTitle = function drawTitle() {
    if (this.title.text !== '') {
      this.svg.selectAll('.plot-title').remove();
      return this.svg.append('text').attr('class', 'plot-title').attr('font-family', this.title.fontFamily).attr('x', this.title.x).attr('y', this.title.y).attr('text-anchor', this.title.anchor).attr('fill', this.title.color).attr('font-size', this.title.fontSize).attr('font-weight', this.title.fontWeight).text(this.title.text);
    }
  };

  RectPlot.prototype.drawRect = function drawRect() {
    this.svg.selectAll('.plot-viewbox').remove();
    return this.svg.append('rect').attr('class', 'plot-viewbox').attr('x', this.viewBoxDim.x).attr('y', this.viewBoxDim.y).attr('width', this.viewBoxDim.width).attr('height', this.viewBoxDim.height).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', '1px');
  };

  RectPlot.prototype.drawDimensionMarkers = function drawDimensionMarkers() {
    return new Promise(function (resolve, reject) {
      // TODO: unnecessary double call ? PlotData.constructor calls PlotData.calculateMinMax ?
      this.data.calculateMinMax();
      var axisArrays = AxisUtils.getAxisDataArrays(this, this.data, this.viewBoxDim);

      // TODO KZ this sequence can be easily consolidated
      if (this.grid) {
        this.svg.selectAll('.origin').remove();
        this.svg.selectAll('.origin').data(axisArrays.gridOrigin).enter().append('line').attr('class', 'origin').attr('x1', function (d) {
          return d.x1;
        }).attr('y1', function (d) {
          return d.y1;
        }).attr('x2', function (d) {
          return d.x2;
        }).attr('y2', function (d) {
          return d.y2;
        }).attr('stroke-width', 0.2).attr('stroke', 'grey');
        if (this.origin) {
          this.svg.selectAll('.origin').style('stroke-dasharray', '4, 6').attr('stroke-width', 1).attr('stroke', 'black');
        }

        this.svg.selectAll('.dim-marker').remove();
        this.svg.selectAll('.dim-marker').data(axisArrays.gridLines).enter().append('line').attr('class', 'dim-marker').attr('x1', function (d) {
          return d.x1;
        }).attr('y1', function (d) {
          return d.y1;
        }).attr('x2', function (d) {
          return d.x2;
        }).attr('y2', function (d) {
          return d.y2;
        }).attr('stroke-width', 0.2).attr('stroke', 'grey');
      } else if (!this.grid && this.origin) {
        this.svg.selectAll('.origin').remove();
        this.svg.selectAll('.origin').data(axisArrays.gridOrigin).enter().append('line').attr('class', 'origin').attr('x1', function (d) {
          return d.x1;
        }).attr('y1', function (d) {
          return d.y1;
        }).attr('x2', function (d) {
          return d.x2;
        }).attr('y2', function (d) {
          return d.y2;
        }).style('stroke-dasharray', '4, 6').attr('stroke-width', 1).attr('stroke', 'black');
      }

      this.svg.selectAll('.dim-marker-leader').remove();
      this.svg.selectAll('.dim-marker-leader').data(axisArrays.axisLeader).enter().append('line').attr('class', 'dim-marker-leader').attr('x1', function (d) {
        return d.x1;
      }).attr('y1', function (d) {
        return d.y1;
      }).attr('x2', function (d) {
        return d.x2;
      }).attr('y2', function (d) {
        return d.y2;
      }).attr('stroke-width', 1).attr('stroke', 'black');

      this.svg.selectAll('.dim-marker-label').remove();
      var markerLabels = this.svg.selectAll('.dim-marker-label').data(axisArrays.axisLeaderLabel).enter().append('text').attr('class', 'dim-marker-label').attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('font-family', this.axisFontFamily).attr('fill', this.axisFontColor).attr('font-size', this.axisFontSize).text(function (d) {
        return d.label;
      }).attr('text-anchor', function (d) {
        return d.anchor;
      }).attr('type', function (d) {
        return d.type;
      });

      // Figure out the max width of the yaxis dimensional labels
      var initAxisTextRowWidth = this.axisDimensionText.rowMaxWidth;
      var initAxisTextColWidth = this.axisDimensionText.colMaxWidth;
      var initAxisTextRowHeight = this.axisDimensionText.rowMaxHeight;
      var initAxisTextColHeight = this.axisDimensionText.colMaxHeight;
      for (var i = 0; i < markerLabels[0].length; i++) {
        var markerLabel = markerLabels[0][i];
        var labelType = d3.select(markerLabel).attr('type');
        var bb = markerLabel.getBBox();
        if (this.axisDimensionText.rowMaxWidth < bb.width && labelType === 'row') {
          this.axisDimensionText.rowMaxWidth = bb.width;
        }
        if (this.axisDimensionText.colMaxWidth < bb.width && labelType === 'col') {
          this.axisDimensionText.colMaxWidth = bb.width;
        }
        if (this.axisDimensionText.rowMaxHeight < bb.height && labelType === 'row') {
          this.axisDimensionText.rowMaxHeight = bb.height;
        }
        if (this.axisDimensionText.colMaxHeight < bb.height && labelType === 'col') {
          this.axisDimensionText.colMaxHeight = bb.height;
        }

        if (this.width < bb.x + bb.width) {
          this.axisDimensionText.rightPadding = bb.width / 2;
        }
      }

      if (initAxisTextRowWidth !== this.axisDimensionText.rowMaxWidth || initAxisTextColWidth !== this.axisDimensionText.colMaxWidth || initAxisTextRowHeight !== this.axisDimensionText.rowMaxHeight || initAxisTextColHeight !== this.axisDimensionText.colMaxHeight) {
        this.setDim(this.svg, this.width, this.height);
        this.data.revertMinMax();
        var error = new Error('axis marker out of bound');
        error.retry = true;
        return reject(error);
      }
      return resolve();
    }.bind(this));
  };

  RectPlot.prototype.drawAxisLabels = function drawAxisLabels() {
    var axisLabels = [{ // x axis label
      x: this.viewBoxDim.x + this.viewBoxDim.width / 2,
      y: this.viewBoxDim.y + this.viewBoxDim.height + this.axisLeaderLineLength + this.axisDimensionText.colMaxHeight + this.xTitle.topPadding + this.xTitle.textHeight,
      text: this.xTitle.text,
      anchor: 'middle',
      transform: 'rotate(0)',
      display: this.xTitle === '' ? 'none' : '',
      fontFamily: this.xTitle.fontFamily,
      fontSize: this.xTitle.fontSize,
      fontColor: this.xTitle.fontColor
    }, { // y axis label
      x: this.horizontalPadding + this.yTitle.textHeight,
      y: this.viewBoxDim.y + this.viewBoxDim.height / 2,
      text: this.yTitle.text,
      anchor: 'middle',
      transform: 'rotate(270,' + (this.horizontalPadding + this.yTitle.textHeight) + ', ' + (this.viewBoxDim.y + this.viewBoxDim.height / 2) + ')',
      display: this.yTitle === '' ? 'none' : '',
      fontFamily: this.yTitle.fontFamily,
      fontSize: this.yTitle.fontSize,
      fontColor: this.yTitle.fontColor
    }];

    this.svg.selectAll('.axis-label').remove();
    return this.svg.selectAll('.axis-label').data(axisLabels).enter().append('text').attr('class', 'axis-label').attr('x', function (d) {
      return d.x;
    }).attr('y', function (d) {
      return d.y;
    }).attr('font-family', function (d) {
      return d.fontFamily;
    }).attr('font-size', function (d) {
      return d.fontSize;
    }).attr('fill', function (d) {
      return d.fontColor;
    }).attr('text-anchor', function (d) {
      return d.anchor;
    }).attr('transform', function (d) {
      return d.transform;
    }).text(function (d) {
      return d.text;
    }).style('font-weight', 'normal').style('display', function (d) {
      return d.display;
    });
  };

  RectPlot.prototype.drawLegend = function drawLegend() {
    return new Promise(function (resolve, reject) {
      var legendFontSize = void 0;
      this.data.setupLegendGroupsAndPts();

      if (this.legendBubblesShow && Utils.isArrOfNums(this.Z)) {
        this.svg.selectAll('.legend-bubbles').remove();
        this.svg.selectAll('.legend-bubbles').data(this.data.legendBubbles).enter().append('circle').attr('class', 'legend-bubbles').attr('cx', function (d) {
          return d.cx;
        }).attr('cy', function (d) {
          return d.cy;
        }).attr('r', function (d) {
          return d.r;
        }).attr('fill', 'none').attr('stroke', 'black').attr('stroke-opacity', 0.5);

        this.svg.selectAll('.legend-bubbles-labels').remove();
        this.svg.selectAll('.legend-bubbles-labels').data(this.data.legendBubbles).enter().append('text').attr('class', 'legend-bubbles-labels').attr('x', function (d) {
          return d.x;
        }).attr('y', function (d) {
          return d.y;
        }).attr('text-anchor', 'middle').attr('font-size', this.legendFontSize).attr('font-family', this.legendFontFamily).attr('fill', this.legendFontColor).text(function (d) {
          return d.text;
        });

        if (this.zTitle !== '') {
          legendFontSize = this.legendFontSize;

          this.svg.selectAll('.legend-bubbles-title').remove();
          var legendBubbleTitleSvg = this.svg.selectAll('.legend-bubbles-title').data(this.data.legendBubblesTitle).enter().append('text').attr('class', 'legend-bubbles-title').attr('x', function (d) {
            return d.x;
          }).attr('y', function (d) {
            return d.y - legendFontSize * 1.5;
          }).attr('text-anchor', 'middle').attr('font-family', this.legendFontFamily).attr('font-weight', 'normal').attr('fill', this.legendFontColor).text(this.zTitle);

          SvgUtils.setSvgBBoxWidthAndHeight(this.data.legendBubblesTitle, legendBubbleTitleSvg);
        }
      }

      var drag = DragUtils.getLegendLabelDragAndDrop(this, this.data);
      this.svg.selectAll('.legend-dragged-pts-text').remove();
      this.svg.selectAll('.legend-dragged-pts-text').data(this.data.legendPts).enter().append('text').attr('class', 'legend-dragged-pts-text').attr('id', function (d) {
        return 'legend-' + d.id;
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('font-family', this.legendFontFamily).attr('font-size', this.legendFontSize).attr('text-anchor', function (d) {
        return d.anchor;
      }).attr('fill', function (d) {
        return d.color;
      }).text(function (d) {
        if (d.markerId != null) {
          return Utils.getSuperscript(d.markerId + 1) + d.text;
        } else {
          return d.text;
        }
      }).call(drag);

      SvgUtils.setSvgBBoxWidthAndHeight(this.data.legendPts, this.svg.selectAll('.legend-dragged-pts-text'));

      if (this.legendShow) {
        this.svg.selectAll('.legend-groups-text').remove();
        this.svg.selectAll('.legend-groups-text').data(this.data.legendGroups).enter().append('text').attr('class', 'legend-groups-text').attr('x', function (d) {
          return d.x;
        }).attr('y', function (d) {
          return d.y;
        }).attr('font-family', this.legendFontFamily).attr('fill', this.legendFontColor).attr('font-size', this.legendFontSize).text(function (d) {
          return d.text;
        }).attr('text-anchor', function (d) {
          return d.anchor;
        });

        this.svg.selectAll('.legend-groups-pts').remove();
        this.svg.selectAll('.legend-groups-pts').data(this.data.legendGroups).enter().append('circle').attr('class', 'legend-groups-pts').attr('cx', function (d) {
          return d.cx;
        }).attr('cy', function (d) {
          return d.cy;
        }).attr('r', function (d) {
          return d.r;
        }).attr('fill', function (d) {
          return d.color;
        }).attr('stroke', function (d) {
          return d.stroke;
        }).attr('stroke-opacity', function (d) {
          return d['stroke-opacity'];
        }).attr('fill-opacity', function (d) {
          return d.fillOpacity;
        });

        // Height and width are not provided
        SvgUtils.setSvgBBoxWidthAndHeight(this.data.legendGroups, this.svg.selectAll('.legend-groups-text'));
      }

      if (this.legendShow || this.legendBubblesShow && Utils.isArrOfNums(this.Z) || this.data.legendPts != null) {
        if (this.data.resizedAfterLegendGroupsDrawn(this.legendShow)) {
          this.data.revertMinMax();
          var error = new Error('drawLegend Failed');
          error.retry = true;
          return reject(error);
        }
      }
      return resolve();
    }.bind(this));
  };

  RectPlot.prototype.drawAnc = function drawAnc() {
    var _this3 = this;

    var labelTxt = void 0,
        xlabel = void 0,
        ylabel = void 0;
    this.svg.selectAll('.anc').remove();
    var anc = this.svg.selectAll('.anc').data(this.data.pts).enter().append('circle').attr('class', 'anc').attr('id', function (d) {
      return 'anc-' + d.id;
    }).attr('cx', function (d) {
      return d.x;
    }).attr('cy', function (d) {
      return d.y;
    }).attr('fill', function (d) {
      return d.color;
    }).attr('fill-opacity', function (d) {
      return d.fillOpacity;
    }).attr('r', function (d) {
      if (_this3.trendLines.show) {
        return _this3.trendLines.pointSize;
      } else {
        return d.r;
      }
    });
    if (Utils.isArrOfNums(this.Z)) {
      return anc.append('title').text(function (d) {
        xlabel = Utils.getFormattedNum(d.labelX, _this3.xDecimals, _this3.xPrefix, _this3.xSuffix);
        ylabel = Utils.getFormattedNum(d.labelY, _this3.yDecimals, _this3.yPrefix, _this3.ySuffix);
        var zlabel = Utils.getFormattedNum(d.labelZ, _this3.zDecimals, _this3.zPrefix, _this3.zSuffix);
        labelTxt = d.label === '' ? d.labelAlt : d.label;
        return labelTxt + ', ' + d.group + '\n' + zlabel + '\n(' + xlabel + ', ' + ylabel + ')';
      });
    } else {
      return anc.append('title').text(function (d) {
        xlabel = Utils.getFormattedNum(d.labelX, _this3.xDecimals, _this3.xPrefix, _this3.xSuffix);
        ylabel = Utils.getFormattedNum(d.labelY, _this3.yDecimals, _this3.yPrefix, _this3.ySuffix);
        labelTxt = d.label === '' ? d.labelAlt : d.label;
        return labelTxt + ', ' + d.group + '\n(' + xlabel + ', ' + ylabel + ')';
      });
    }
  };

  RectPlot.prototype.drawDraggedMarkers = function drawDraggedMarkers() {
    this.svg.selectAll('.marker').remove();
    this.svg.selectAll('.marker').data(this.data.outsidePlotMarkers).enter().append('line').attr('class', 'marker').attr('x1', function (d) {
      return d.x1;
    }).attr('y1', function (d) {
      return d.y1;
    }).attr('x2', function (d) {
      return d.x2;
    }).attr('y2', function (d) {
      return d.y2;
    }).attr('stroke-width', function (d) {
      return d.width;
    }).attr('stroke', function (d) {
      return d.color;
    });

    this.svg.selectAll('.marker-label').remove();
    return this.svg.selectAll('.marker-label').data(this.data.outsidePlotMarkers).enter().append('text').attr('class', 'marker-label').attr('x', function (d) {
      return d.markerTextX;
    }).attr('y', function (d) {
      return d.markerTextY;
    }).attr('font-family', 'Arial').attr('text-anchor', 'start').attr('font-size', this.data.legendDim.markerTextSize).attr('fill', function (d) {
      return d.color;
    }).text(function (d) {
      return d.markerLabel;
    });
  };

  RectPlot.prototype.resetPlotAfterDragEvent = function resetPlotAfterDragEvent() {
    var plotElems = ['.plot-viewbox', '.origin', '.dim-marker', '.dim-marker-leader', '.dim-marker-label', '.axis-label', '.legend-pts', '.legend-text', '.anc', '.lab', '.link'];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = Array.from(plotElems)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var elem = _step4.value;

        this.svg.selectAll(elem).remove();
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return this.draw();
  };

  RectPlot.prototype.drawLabs = function drawLabs() {
    var drag = void 0,
        labeler = void 0,
        labels_img_svg = void 0,
        labels_svg = void 0;
    if (this.showLabels && !this.trendLines.show) {
      drag = DragUtils.getLabelDragAndDrop(this);
      this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);

      this.svg.selectAll('.lab-img').remove();
      this.svg.selectAll('.lab-img').data(this.data.lab).enter().append('svg:image').attr('class', 'lab-img').attr('xlink:href', function (d) {
        return d.url;
      }).attr('id', function (d) {
        if (d.url !== '') {
          return d.id;
        }
      }).attr('x', function (d) {
        return d.x - d.width / 2;
      }).attr('y', function (d) {
        return d.y - d.height;
      }).attr('width', function (d) {
        return d.width;
      }).attr('height', function (d) {
        return d.height;
      }).call(drag);

      this.svg.selectAll('.lab').remove();
      this.svg.selectAll('.lab').data(this.data.lab).enter().append('text').attr('class', 'lab').attr('id', function (d) {
        if (d.url === '') {
          return d.id;
        }
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('font-family', function (d) {
        return d.fontFamily;
      }).text(function (d) {
        if (d.url === '') {
          return d.text;
        }
      }).attr('text-anchor', 'middle').attr('fill', function (d) {
        return d.color;
      }).attr('font-size', function (d) {
        return d.fontSize;
      }).call(drag);

      labels_svg = this.svg.selectAll('.lab');
      labels_img_svg = this.svg.selectAll('.lab-img');

      SvgUtils.setSvgBBoxWidthAndHeight(this.data.lab, labels_svg);
      console.log('rhtmlLabeledScatter: Running label placement algorithm...');
      labeler = d3.labeler().svg(this.svg).w1(this.viewBoxDim.x).w2(this.viewBoxDim.x + this.viewBoxDim.width).h1(this.viewBoxDim.y).h2(this.viewBoxDim.y + this.viewBoxDim.height).anchor(this.data.pts).label(this.data.lab).pinned(this.state.getUserPositionedLabIds()).start(500);

      labels_svg.transition().duration(800).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      });

      labels_img_svg.transition().duration(800).attr('x', function (d) {
        return d.x - d.width / 2;
      }).attr('y', function (d) {
        return d.y - d.height;
      });

      return this.drawLinks();
    } else if (this.showLabels && this.trendLines.show) {
      this.tl = new TrendLine(this.data.pts, this.data.lab);
      this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);

      drag = DragUtils.getLabelDragAndDrop(this, this.trendLines.show);

      this.svg.selectAll('.lab-img').remove();
      this.svg.selectAll('.lab-img').data(this.tl.arrowheadLabels).enter().append('svg:image').attr('class', 'lab-img').attr('xlink:href', function (d) {
        return d.url;
      }).attr('id', function (d) {
        if (d.url !== '') {
          return d.id;
        }
      }).attr('x', function (d) {
        return d.x - d.width / 2;
      }).attr('y', function (d) {
        return d.y - d.height;
      }).attr('width', function (d) {
        return d.width;
      }).attr('height', function (d) {
        return d.height;
      }).call(drag);

      this.svg.selectAll('.lab').remove();
      this.svg.selectAll('.lab').data(this.tl.arrowheadLabels).enter().append('text').attr('class', 'lab').attr('id', function (d) {
        if (d.url === '') {
          return d.id;
        }
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('font-family', function (d) {
        return d.fontFamily;
      }).text(function (d) {
        if (d.url === '') {
          return d.text;
        }
      }).attr('text-anchor', 'middle').attr('fill', function (d) {
        return d.color;
      }).attr('font-size', function (d) {
        return d.fontSize;
      }).call(drag);

      labels_svg = this.svg.selectAll('.lab');
      labels_img_svg = this.svg.selectAll('.lab-img');
      SvgUtils.setSvgBBoxWidthAndHeight(this.tl.arrowheadLabels, labels_svg);

      labeler = d3.labeler().svg(this.svg).w1(this.viewBoxDim.x).w2(this.viewBoxDim.x + this.viewBoxDim.width).h1(this.viewBoxDim.y).h2(this.viewBoxDim.y + this.viewBoxDim.height).anchor(this.tl.arrowheadPts).label(this.tl.arrowheadLabels).pinned(this.state.getUserPositionedLabIds()).start(500);

      labels_svg.transition().duration(800).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      });

      return labels_img_svg.transition().duration(800).attr('x', function (d) {
        return d.x - d.width / 2;
      }).attr('y', function (d) {
        return d.y - d.height;
      });
    }
  };

  RectPlot.prototype.drawLinks = function drawLinks() {
    var links = new Links(this.data.pts, this.data.lab);
    this.svg.selectAll('.link').remove();
    return this.svg.selectAll('.link').data(links.getLinkData()).enter().append('line').attr('class', 'link').attr('x1', function (d) {
      return d.x1;
    }).attr('y1', function (d) {
      return d.y1;
    }).attr('x2', function (d) {
      return d.x2;
    }).attr('y2', function (d) {
      return d.y2;
    }).attr('stroke-width', function (d) {
      return d.width;
    }).attr('stroke', function (d) {
      return d.color;
    }).style('stroke-opacity', this.data.plotColors.getFillOpacity(this.transparency));
  };

  RectPlot.prototype.drawTrendLines = function drawTrendLines() {
    var _this4 = this;

    this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);
    if (this.tl === undefined || this.tl === null) {
      this.tl = new TrendLine(this.data.pts, this.data.lab);
    }

    return _.map(this.tl.getUniqueGroups(), function (group) {
      // Arrowhead marker
      _this4.svg.selectAll('#triangle-' + group).remove();
      _this4.svg.append('svg:defs').append('svg:marker').attr('id', 'triangle-' + group).attr('refX', 6).attr('refY', 6).attr('markerWidth', 30).attr('markerHeight', 30).attr('orient', 'auto').append('path').attr('d', 'M 0 0 12 6 0 12 3 6').style('fill', _this4.data.plotColors.getColorFromGroup(group));

      _this4.svg.selectAll('.trendline-' + group).remove();
      return _this4.svg.selectAll('.trendline-' + group).data(_this4.tl.getLineArray(group)).enter().append('line').attr('class', 'trendline-' + group).attr('x1', function (d) {
        return d[0];
      }).attr('y1', function (d) {
        return d[1];
      }).attr('x2', function (d) {
        return d[2];
      }).attr('y2', function (d) {
        return d[3];
      }).attr('stroke', _this4.data.plotColors.getColorFromGroup(group)).attr('stroke-width', _this4.trendLines.lineThickness).attr('marker-end', function (d, i) {
        // Draw arrowhead on last element in trendline
        if (i === _this4.tl.getLineArray(group).length - 1) {
          return 'url(#triangle-' + group + ')';
        }
      });
    });
  };

  return RectPlot;
}();

module.exports = RectPlot;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9SZWN0UGxvdC5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQUVNLFE7QUFDSixvQkFBWSxLQUFaLEVBQ0UsS0FERixFQUVFLE1BRkYsRUFHRSxDQUhGLEVBSUUsQ0FKRixFQUtFLENBTEYsRUFNRSxLQU5GLEVBT0UsS0FQRixFQVFFLFFBUkYsRUFTRSxHQVRGLEVBVUUsVUFWRixFQVdFLE1BWEYsRUFZRSxNQVpGLEVBYUUsTUFiRixFQWNFLEtBZEYsRUFlRSxNQWZGLEVBZ0JFLFlBaEJGLEVBaUJFLElBakJGLEVBa0JFLE1BbEJGLEVBbUJFLFdBbkJGLEVBb0JFLGVBcEJGLEVBcUJFLGFBckJGLEVBc0JFLGNBdEJGLEVBdUJFLGdCQXZCRixFQXdCRSxjQXhCRixFQXlCRSxlQXpCRixFQTBCRSxnQkExQkYsRUEyQkUsY0EzQkYsRUE0QkUsZUE1QkYsRUE2QkUsVUE3QkYsRUE4QkUsZ0JBOUJGLEVBK0JFLGNBL0JGLEVBZ0NFLGVBaENGLEVBaUNFLGVBakNGLEVBa0NFLFNBbENGLEVBbUNFLFNBbkNGLEVBb0NFLFNBcENGLEVBcUNFLE9BckNGLEVBc0NFLE9BdENGLEVBdUNFLE9BdkNGLEVBd0NFLE9BeENGLEVBeUNFLE9BekNGLEVBMENFLE9BMUNGLEVBMkNFLFVBM0NGLEVBNENFLGlCQTVDRixFQTZDRSxnQkE3Q0YsRUE4Q0UsY0E5Q0YsRUErQ0UsZUEvQ0YsRUFnREUsY0FoREYsRUFpREUsYUFqREYsRUFrREUsWUFsREYsRUFtREUsV0FuREYsRUFvREUsY0FwREYsRUFxREUsY0FyREYsRUFzREUsY0F0REYsRUF1REUsY0F2REYsRUF3REUsaUJBeERGLEVBeURFLGlCQXpERixFQTBERSxVQTFERixFQTJERSx1QkEzREYsRUE0REUsbUJBNURGLEVB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Q0osSUFESSxDQUNDLE9BQUssRUFBTCxDQUFRLFlBQVIsQ0FBcUIsS0FBckIsQ0FERCxFQUVKLEtBRkksR0FHSixNQUhJLENBR0csTUFISCxFQUlKLElBSkksQ0FJQyxPQUpELGlCQUl1QixLQUp2QixFQUtKLElBTEksQ0FLQyxJQUxELEVBS087QUFBQSxlQUFLLEVBQUUsQ0FBRixDQUFMO0FBQUEsT0FMUCxFQU1KLElBTkksQ0FNQyxJQU5ELEVBTU87QUFBQSxlQUFLLEVBQUUsQ0FBRixDQUFMO0FBQUEsT0FOUCxFQU9KLElBUEksQ0FPQyxJQVBELEVBT087QUFBQSxlQUFLLEVBQUUsQ0FBRixDQUFMO0FBQUEsT0FQUCxFQVFKLElBUkksQ0FRQyxJQVJELEVBUU87QUFBQSxlQUFLLEVBQUUsQ0FBRixDQUFMO0FBQUEsT0FSUCxFQVNKLElBVEksQ0FTQyxRQVRELEVBU1csT0FBSyxJQUFMLENBQVUsVUFBVixDQUFxQixpQkFBckIsQ0FBdUMsS0FBdkMsQ0FUWCxFQVVKLElBVkksQ0FVQyxjQVZELEVBVWlCLE9BQUssVUFBTCxDQUFnQixhQVZqQyxFQVdKLElBWEksQ0FXQyxZQVhELEVBV2UsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQzVCO0FBQ0EsWUFBSSxNQUFRLE9BQUssRUFBTCxDQUFRLFlBQVIsQ0FBcUIsS0FBckIsQ0FBRCxDQUE4QixNQUE5QixHQUF1QyxDQUFsRCxFQUFzRDtBQUNwRCxvQ0FBd0IsS0FBeEI7QUFDRDtBQUNGLE9BaEJJLENBQVA7QUFpQkQsS0FoQ00sQ0FBUDtBQWlDRCxHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixRQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8vIEtaIFRPRE8gcmVwbGFjZSBnbG9iYWwgc3RhdGVtZW50cyB3aXRoIGltcG9ydHMgb25jZSBFUzYgY29tcGxldGVcbi8qIGdsb2JhbCBQbG90RGF0YSAqL1xuLyogZ2xvYmFsIEF4aXNVdGlscyAqL1xuLyogZ2xvYmFsIGQzICovXG4vKiBnbG9iYWwgVXRpbHMgKi9cbi8qIGdsb2JhbCBTdmdVdGlscyAqL1xuLyogZ2xvYmFsIERyYWdVdGlscyAqL1xuLyogZ2xvYmFsIFRyZW5kTGluZSAqL1xuLyogZ2xvYmFsIExpbmtzICovXG5cbmNsYXNzIFJlY3RQbG90IHtcbiAgY29uc3RydWN0b3Ioc3RhdGUsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIFgsXG4gICAgWSxcbiAgICBaLFxuICAgIGdyb3VwLFxuICAgIGxhYmVsLFxuICAgIGxhYmVsQWx0LFxuICAgIHN2ZyxcbiAgICBmaXhlZFJhdGlvLFxuICAgIHhUaXRsZSxcbiAgICB5VGl0bGUsXG4gICAgelRpdGxlLFxuICAgIHRpdGxlLFxuICAgIGNvbG9ycyxcbiAgICB0cmFuc3BhcmVuY3ksXG4gICAgZ3JpZCxcbiAgICBvcmlnaW4sXG4gICAgb3JpZ2luQWxpZ24sXG4gICAgdGl0bGVGb250RmFtaWx5LFxuICAgIHRpdGxlRm9udFNpemUsXG4gICAgdGl0bGVGb250Q29sb3IsXG4gICAgeFRpdGxlRm9udEZhbWlseSxcbiAgICB4VGl0bGVGb250U2l6ZSxcbiAgICB4VGl0bGVGb250Q29sb3IsXG4gICAgeVRpdGxlRm9udEZhbWlseSxcbiAgICB5VGl0bGVGb250U2l6ZSxcbiAgICB5VGl0bGVGb250Q29sb3IsXG4gICAgc2hvd0xhYmVscyxcbiAgICBsYWJlbHNGb250RmFtaWx5LFxuICAgIGxhYmVsc0ZvbnRTaXplLFxuICAgIGxhYmVsc0ZvbnRDb2xvcixcbiAgICBsYWJlbHNMb2dvU2NhbGUsXG4gICAgeERlY2ltYWxzLFxuICAgIHlEZWNpbWFscyxcbiAgICB6RGVjaW1hbHMsXG4gICAgeFByZWZpeCxcbiAgICB5UHJlZml4LFxuICAgIHpQcmVmaXgsXG4gICAgeFN1ZmZpeCxcbiAgICB5U3VmZml4LFxuICAgIHpTdWZmaXgsXG4gICAgbGVnZW5kU2hvdyxcbiAgICBsZWdlbmRCdWJibGVzU2hvdyxcbiAgICBsZWdlbmRGb250RmFtaWx5LFxuICAgIGxlZ2VuZEZvbnRTaXplLFxuICAgIGxlZ2VuZEZvbnRDb2xvcixcbiAgICBheGlzRm9udEZhbWlseSxcbiAgICBheGlzRm9udENvbG9yLFxuICAgIGF4aXNGb250U2l6ZSxcbiAgICBwb2ludFJhZGl1cyxcbiAgICB4Qm91bmRzTWluaW11bSxcbiAgICB4Qm91bmRzTWF4aW11bSxcbiAgICB5Qm91bmRzTWluaW11bSxcbiAgICB5Qm91bmRzTWF4aW11bSxcbiAgICB4Qm91bmRzVW5pdHNNYWpvcixcbiAgICB5Qm91bmRzVW5pdHNNYWpvcixcbiAgICB0cmVuZExpbmVzLFxuICAgIHRyZW5kTGluZXNMaW5lVGhpY2tuZXNzLFxuICAgIHRyZW5kTGluZXNQb2ludFNpemUsXG4gICAgcGxvdEJvcmRlclNob3csXG4gICkge1xuICAgIHRoaXMuc2V0RGltID0gdGhpcy5zZXREaW0uYmluZCh0aGlzKTtcbiAgICB0aGlzLmRyYXcgPSB0aGlzLmRyYXcuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRyYXdMYWJzQW5kUGxvdCA9IHRoaXMuZHJhd0xhYnNBbmRQbG90LmJpbmQodGhpcyk7XG4gICAgdGhpcy5kcmF3VGl0bGUgPSB0aGlzLmRyYXdUaXRsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd1JlY3QgPSB0aGlzLmRyYXdSZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5kcmF3RGltZW5zaW9uTWFya2VycyA9IHRoaXMuZHJhd0RpbWVuc2lvbk1hcmtlcnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRyYXdBeGlzTGFiZWxzID0gdGhpcy5kcmF3QXhpc0xhYmVscy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd0xlZ2VuZCA9IHRoaXMuZHJhd0xlZ2VuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd0FuYyA9IHRoaXMuZHJhd0FuYy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd0RyYWdnZWRNYXJrZXJzID0gdGhpcy5kcmF3RHJhZ2dlZE1hcmtlcnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc2V0UGxvdEFmdGVyRHJhZ0V2ZW50ID0gdGhpcy5yZXNldFBsb3RBZnRlckRyYWdFdmVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd0xhYnMgPSB0aGlzLmRyYXdMYWJzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kcmF3TGlua3MgPSB0aGlzLmRyYXdMaW5rcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZHJhd1RyZW5kTGluZXMgPSB0aGlzLmRyYXdUcmVuZExpbmVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLlggPSBYO1xuICAgIHRoaXMuWSA9IFk7XG4gICAgdGhpcy5aID0gWjtcbiAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgIGlmIChsYWJlbEFsdCA9PSBudWxsKSB7IGxhYmVsQWx0ID0gW107IH1cbiAgICB0aGlzLmxhYmVsQWx0ID0gbGFiZWxBbHQ7XG4gICAgdGhpcy5zdmcgPSBzdmc7XG4gICAgaWYgKHpUaXRsZSA9PSBudWxsKSB7IHpUaXRsZSA9ICcnOyB9XG4gICAgdGhpcy56VGl0bGUgPSB6VGl0bGU7XG4gICAgdGhpcy5jb2xvcnMgPSBjb2xvcnM7XG4gICAgdGhpcy50cmFuc3BhcmVuY3kgPSB0cmFuc3BhcmVuY3k7XG4gICAgdGhpcy5vcmlnaW5BbGlnbiA9IG9yaWdpbkFsaWduO1xuICAgIGlmIChzaG93TGFiZWxzID09IG51bGwpIHsgc2hvd0xhYmVscyA9IHRydWU7IH1cbiAgICB0aGlzLnNob3dMYWJlbHMgPSBzaG93TGFiZWxzO1xuICAgIGlmIChsYWJlbHNMb2dvU2NhbGUgPT0gbnVsbCkgeyBsYWJlbHNMb2dvU2NhbGUgPSBbXTsgfVxuICAgIGlmICh4RGVjaW1hbHMgPT0gbnVsbCkgeyB4RGVjaW1hbHMgPSBudWxsOyB9XG4gICAgdGhpcy54RGVjaW1hbHMgPSB4RGVjaW1hbHM7XG4gICAgaWYgKHlEZWNpbWFscyA9PSBudWxsKSB7IHlEZWNpbWFscyA9IG51bGw7IH1cbiAgICB0aGlzLnlEZWNpbWFscyA9IHlEZWNpbWFscztcbiAgICBpZiAoekRlY2ltYWxzID09IG51bGwpIHsgekRlY2ltYWxzID0gbnVsbDsgfVxuICAgIHRoaXMuekRlY2ltYWxzID0gekRlY2ltYWxzO1xuICAgIGlmICh4UHJlZml4ID09IG51bGwpIHsgeFByZWZpeCA9ICcnOyB9XG4gICAgdGhpcy54UHJlZml4ID0geFByZWZpeDtcbiAgICBpZiAoeVByZWZpeCA9PSBudWxsKSB7IHlQcmVmaXggPSAnJzsgfVxuICAgIHRoaXMueVByZWZpeCA9IHlQcmVmaXg7XG4gICAgaWYgKHpQcmVmaXggPT0gbnVsbCkgeyB6UHJlZml4ID0gJyc7IH1cbiAgICB0aGlzLnpQcmVmaXggPSB6UHJlZml4O1xuICAgIGlmICh4U3VmZml4ID09IG51bGwpIHsgeFN1ZmZpeCA9ICcnOyB9XG4gICAgdGhpcy54U3VmZml4ID0geFN1ZmZpeDtcbiAgICBpZiAoeVN1ZmZpeCA9PSBudWxsKSB7IHlTdWZmaXggPSAnJzsgfVxuICAgIHRoaXMueVN1ZmZpeCA9IHlTdWZmaXg7XG4gICAgaWYgKHpTdWZmaXggPT0gbnVsbCkgeyB6U3VmZml4ID0gJyc7IH1cbiAgICB0aGlzLnpTdWZmaXggPSB6U3VmZml4O1xuICAgIHRoaXMubGVnZW5kU2hvdyA9IGxlZ2VuZFNob3c7XG4gICAgaWYgKGxlZ2VuZEJ1YmJsZXNTaG93ID09IG51bGwpIHsgbGVnZW5kQnViYmxlc1Nob3cgPSB0cnVlOyB9XG4gICAgdGhpcy5sZWdlbmRCdWJibGVzU2hvdyA9IGxlZ2VuZEJ1YmJsZXNTaG93O1xuICAgIHRoaXMubGVnZW5kRm9udEZhbWlseSA9IGxlZ2VuZEZvbnRGYW1pbHk7XG4gICAgdGhpcy5sZWdlbmRGb250U2l6ZSA9IGxlZ2VuZEZvbnRTaXplO1xuICAgIHRoaXMubGVnZW5kRm9udENvbG9yID0gbGVnZW5kRm9udENvbG9yO1xuICAgIHRoaXMuYXhpc0ZvbnRGYW1pbHkgPSBheGlzRm9udEZhbWlseTtcbiAgICB0aGlzLmF4aXNGb250Q29sb3IgPSBheGlzRm9udENvbG9yO1xuICAgIHRoaXMuYXhpc0ZvbnRTaXplID0gYXhpc0ZvbnRTaXplO1xuICAgIGlmIChwb2ludFJhZGl1cyA9PSBudWxsKSB7IHBvaW50UmFkaXVzID0gMjsgfVxuICAgIHRoaXMucG9pbnRSYWRpdXMgPSBwb2ludFJhZGl1cztcbiAgICBpZiAoeEJvdW5kc01pbmltdW0gPT0gbnVsbCkgeyB4Qm91bmRzTWluaW11bSA9IG51bGw7IH1cbiAgICBpZiAoeEJvdW5kc01heGltdW0gPT0gbnVsbCkgeyB4Qm91bmRzTWF4aW11bSA9IG51bGw7IH1cbiAgICBpZiAoeUJvdW5kc01pbmltdW0gPT0gbnVsbCkgeyB5Qm91bmRzTWluaW11bSA9IG51bGw7IH1cbiAgICBpZiAoeUJvdW5kc01heGltdW0gPT0gbnVsbCkgeyB5Qm91bmRzTWF4aW11bSA9IG51bGw7IH1cbiAgICBpZiAoeEJvdW5kc1VuaXRzTWFqb3IgPT0gbnVsbCkgeyB4Qm91bmRzVW5pdHNNYWpvciA9IG51bGw7IH1cbiAgICB0aGlzLnhCb3VuZHNVbml0c01ham9yID0geEJvdW5kc1VuaXRzTWFqb3I7XG4gICAgaWYgKHlCb3VuZHNVbml0c01ham9yID09IG51bGwpIHsgeUJvdW5kc1VuaXRzTWFqb3IgPSBudWxsOyB9XG4gICAgdGhpcy55Qm91bmRzVW5pdHNNYWpvciA9IHlCb3VuZHNVbml0c01ham9yO1xuICAgIGlmICh0cmVuZExpbmVzID09IG51bGwpIHsgdHJlbmRMaW5lcyA9IGZhbHNlOyB9XG4gICAgaWYgKHRyZW5kTGluZXNMaW5lVGhpY2tuZXNzID09IG51bGwpIHsgdHJlbmRMaW5lc0xpbmVUaGlja25lc3MgPSAxOyB9XG4gICAgaWYgKHRyZW5kTGluZXNQb2ludFNpemUgPT0gbnVsbCkgeyB0cmVuZExpbmVzUG9pbnRTaXplID0gMjsgfVxuICAgIGlmIChwbG90Qm9yZGVyU2hvdyA9PSBudWxsKSB7IHBsb3RCb3JkZXJTaG93ID0gdHJ1ZTsgfVxuICAgIHRoaXMucGxvdEJvcmRlclNob3cgPSBwbG90Qm9yZGVyU2hvdztcbiAgICB0aGlzLm1heERyYXdGYWlsdXJlQ291bnQgPSAyMDA7XG5cbiAgICB0aGlzLmxhYmVsc0ZvbnQgPSB7XG4gICAgICBzaXplOiBsYWJlbHNGb250U2l6ZSxcbiAgICAgIGNvbG9yOiBsYWJlbHNGb250Q29sb3IsXG4gICAgICBmYW1pbHk6IGxhYmVsc0ZvbnRGYW1pbHksXG4gICAgICBsb2dvU2NhbGU6IGxhYmVsc0xvZ29TY2FsZSxcbiAgICB9O1xuXG4gICAgdGhpcy54VGl0bGUgPSB7XG4gICAgICB0ZXh0OiB4VGl0bGUsXG4gICAgICB0ZXh0SGVpZ2h0OiB4VGl0bGVGb250U2l6ZSxcbiAgICAgIGZvbnRGYW1pbHk6IHhUaXRsZUZvbnRGYW1pbHksXG4gICAgICBmb250U2l6ZTogeFRpdGxlRm9udFNpemUsXG4gICAgICBmb250Q29sb3I6IHhUaXRsZUZvbnRDb2xvcixcbiAgICAgIHRvcFBhZGRpbmc6IDUsXG4gICAgfTtcbiAgICBpZiAodGhpcy54VGl0bGUudGV4dCA9PT0gJycpIHsgdGhpcy54VGl0bGUudGV4dEhlaWdodCA9IDA7IH1cblxuICAgIHRoaXMueVRpdGxlID0ge1xuICAgICAgdGV4dDogeVRpdGxlLFxuICAgICAgdGV4dEhlaWdodDogeVRpdGxlRm9udFNpemUsXG4gICAgICBmb250RmFtaWx5OiB5VGl0bGVGb250RmFtaWx5LFxuICAgICAgZm9udFNpemU6IHlUaXRsZUZvbnRTaXplLFxuICAgICAgZm9udENvbG9yOiB5VGl0bGVGb250Q29sb3IsXG4gICAgfTtcbiAgICBpZiAodGhpcy55VGl0bGUudGV4dCA9PT0gJycpIHsgdGhpcy55VGl0bGUudGV4dEhlaWdodCA9IDA7IH1cblxuICAgIHRoaXMudHJlbmRMaW5lcyA9IHtcbiAgICAgIHNob3c6IHRyZW5kTGluZXMsXG4gICAgICBsaW5lVGhpY2tuZXNzOiB0cmVuZExpbmVzTGluZVRoaWNrbmVzcyxcbiAgICAgIHBvaW50U2l6ZTogdHJlbmRMaW5lc1BvaW50U2l6ZSxcbiAgICB9O1xuXG4gICAgdGhpcy5heGlzTGVhZGVyTGluZUxlbmd0aCA9IDU7XG4gICAgdGhpcy5heGlzRGltZW5zaW9uVGV4dCA9IHtcbiAgICAgIHJvd01heFdpZHRoOiAwLFxuICAgICAgcm93TWF4SGVpZ2h0OiAwLFxuICAgICAgY29sTWF4V2lkdGg6IDAsXG4gICAgICBjb2xNYXhIZWlnaHQ6IDAsXG4gICAgICByaWdodFBhZGRpbmc6IDAsICAvLyBTZXQgbGF0ZXIsIGZvciB3aGVuIGF4aXMgbWFya2VycyBsYWJlbHMgcHJvdHJ1ZGUgKFZJUy0xNDYpXG4gICAgfTtcbiAgICB0aGlzLnZlcnRpY2FsUGFkZGluZyA9IDU7XG4gICAgdGhpcy5ob3Jpem9udGFsUGFkZGluZyA9IDEwO1xuXG4gICAgdGhpcy5ib3VuZHMgPSB7XG4gICAgICB4bWluOiB4Qm91bmRzTWluaW11bSxcbiAgICAgIHhtYXg6IHhCb3VuZHNNYXhpbXVtLFxuICAgICAgeW1pbjogeUJvdW5kc01pbmltdW0sXG4gICAgICB5bWF4OiB5Qm91bmRzTWF4aW11bSxcbiAgICB9O1xuXG4gICAgdGhpcy50aXRsZSA9IHtcbiAgICAgIHRleHQ6IHRpdGxlLFxuICAgICAgY29sb3I6IHRpdGxlRm9udENvbG9yLFxuICAgICAgYW5jaG9yOiAnbWlkZGxlJyxcbiAgICAgIGZvbnRTaXplOiB0aXRsZUZvbnRTaXplLFxuICAgICAgZm9udFdlaWdodDogJ25vcm1hbCcsXG4gICAgICBmb250RmFtaWx5OiB0aXRsZUZvbnRGYW1pbHksXG4gICAgfTtcblxuICAgIGlmICh0aGlzLnRpdGxlLnRleHQgPT09ICcnKSB7XG4gICAgICB0aGlzLnRpdGxlLnRleHRIZWlnaHQgPSAwO1xuICAgICAgdGhpcy50aXRsZS5wYWRkaW5nQm90ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aXRsZS50ZXh0SGVpZ2h0ID0gdGl0bGVGb250U2l6ZTtcbiAgICAgIHRoaXMudGl0bGUucGFkZGluZ0JvdCA9IDIwO1xuICAgIH1cblxuICAgIHRoaXMudGl0bGUueSA9IHRoaXMudmVydGljYWxQYWRkaW5nICsgdGhpcy50aXRsZS50ZXh0SGVpZ2h0O1xuXG4gICAgdGhpcy5ncmlkID0gKGdyaWQgIT0gbnVsbCkgPyBncmlkIDogdHJ1ZTtcbiAgICB0aGlzLm9yaWdpbiA9IChvcmlnaW4gIT0gbnVsbCkgPyBvcmlnaW4gOiB0cnVlO1xuICAgIHRoaXMuZml4ZWRSYXRpbyA9IChmaXhlZFJhdGlvICE9IG51bGwpID8gZml4ZWRSYXRpbyA6IHRydWU7XG5cbiAgICBpZiAodGhpcy5sYWJlbCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmxhYmVsID0gW107XG4gICAgICBmb3IgKGNvbnN0IHggb2YgQXJyYXkuZnJvbSh0aGlzLlgpKSB7XG4gICAgICAgIHRoaXMubGFiZWwucHVzaCgnJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNob3dMYWJlbHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldERpbSh0aGlzLnN2ZywgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICB9XG5cbiAgc2V0RGltKHN2Zywgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuc3ZnID0gc3ZnO1xuICAgIHRoaXMudGl0bGUueCA9IHdpZHRoIC8gMjtcbiAgICB0aGlzLmxlZ2VuZERpbSA9IHtcbiAgICAgIHdpZHRoOiAwLCAgLy8gaW5pdCB2YWx1ZVxuICAgICAgaGVpZ2h0T2ZSb3c6IHRoaXMubGVnZW5kRm9udFNpemUgKyA5LCAvLyBpbml0IHZhbFxuICAgICAgcmlnaHRQYWRkaW5nOiB0aGlzLmxlZ2VuZEZvbnRTaXplIC8gMS42LFxuICAgICAgbGVmdFBhZGRpbmc6IHRoaXMubGVnZW5kRm9udFNpemUgLyAwLjgsXG4gICAgICBjZW50ZXJQYWRkaW5nOiB0aGlzLmxlZ2VuZEZvbnRTaXplIC8gMC41MyxcbiAgICAgIHB0UmFkaXVzOiB0aGlzLmxlZ2VuZEZvbnRTaXplIC8gMi42NyxcbiAgICAgIHB0VG9UZXh0U3BhY2U6IHRoaXMubGVnZW5kRm9udFNpemUsXG4gICAgICB2ZXJ0UHRQYWRkaW5nOiA1LFxuICAgICAgY29sczogMSxcbiAgICAgIG1hcmtlckxlbjogNSxcbiAgICAgIG1hcmtlcldpZHRoOiAxLFxuICAgICAgbWFya2VyVGV4dFNpemU6IDEwLFxuICAgICAgbWFya2VyQ2hhcldpZHRoOiA0LFxuICAgIH07XG5cbiAgICB0aGlzLnZpZXdCb3hEaW0gPSB7XG4gICAgICBzdmdXaWR0aDogd2lkdGgsXG4gICAgICBzdmdIZWlnaHQ6IGhlaWdodCxcbiAgICAgIHdpZHRoOiB3aWR0aCAtIHRoaXMubGVnZW5kRGltLndpZHRoIC0gKHRoaXMuaG9yaXpvbnRhbFBhZGRpbmcgKiAzKSAtIHRoaXMuYXhpc0xlYWRlckxpbmVMZW5ndGggLSB0aGlzLmF4aXNEaW1lbnNpb25UZXh0LnJvd01heFdpZHRoIC0gdGhpcy55VGl0bGUudGV4dEhlaWdodCAtIHRoaXMuYXhpc0RpbWVuc2lvblRleHQucmlnaHRQYWRkaW5nLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgLSAodGhpcy52ZXJ0aWNhbFBhZGRpbmcgKiAyKSAtIHRoaXMudGl0bGUudGV4dEhlaWdodCAtIHRoaXMudGl0bGUucGFkZGluZ0JvdCAtIHRoaXMuYXhpc0RpbWVuc2lvblRleHQuY29sTWF4SGVpZ2h0IC0gdGhpcy54VGl0bGUudGV4dEhlaWdodCAtIHRoaXMuYXhpc0xlYWRlckxpbmVMZW5ndGggLSB0aGlzLnhUaXRsZS50b3BQYWRkaW5nLFxuICAgICAgeDogKHRoaXMuaG9yaXpvbnRhbFBhZGRpbmcgKiAyKSArIHRoaXMuYXhpc0RpbWVuc2lvblRleHQucm93TWF4V2lkdGggKyB0aGlzLmF4aXNMZWFkZXJMaW5lTGVuZ3RoICsgdGhpcy55VGl0bGUudGV4dEhlaWdodCxcbiAgICAgIHk6IHRoaXMudmVydGljYWxQYWRkaW5nICsgdGhpcy50aXRsZS50ZXh0SGVpZ2h0ICsgdGhpcy50aXRsZS5wYWRkaW5nQm90LFxuICAgICAgbGFiZWxGb250U2l6ZTogdGhpcy5sYWJlbHNGb250LnNpemUsXG4gICAgICBsYWJlbFNtYWxsRm9udFNpemU6IHRoaXMubGFiZWxzRm9udC5zaXplICogMC43NSxcbiAgICAgIGxhYmVsRm9udENvbG9yOiB0aGlzLmxhYmVsc0ZvbnQuY29sb3IsXG4gICAgICBsYWJlbEZvbnRGYW1pbHk6IHRoaXMubGFiZWxzRm9udC5mYW1pbHksXG4gICAgICBsYWJlbExvZ29TY2FsZTogdGhpcy5sYWJlbHNGb250LmxvZ29TY2FsZSxcbiAgICB9O1xuXG4gICAgdGhpcy5sZWdlbmREaW0ueCA9IHRoaXMudmlld0JveERpbS54ICsgdGhpcy52aWV3Qm94RGltLndpZHRoO1xuICAgIHRoaXMudGl0bGUueCA9IHRoaXMudmlld0JveERpbS54ICsgKHRoaXMudmlld0JveERpbS53aWR0aCAvIDIpO1xuXG4gICAgdGhpcy5kYXRhID0gbmV3IFBsb3REYXRhKHRoaXMuWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLlksXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5aLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsQWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0JveERpbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZERpbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbG9ycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpeGVkUmF0aW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5BbGlnbixcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvaW50UmFkaXVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm91bmRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwYXJlbmN5LFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kU2hvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZEJ1YmJsZXNTaG93LFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXhpc0RpbWVuc2lvblRleHQpO1xuXG4gICAgcmV0dXJuIHRoaXMuZHJhd0ZhaWx1cmVDb3VudCA9IDA7XG4gIH1cblxuICBkcmF3KCkge1xuICAgIHJldHVybiB0aGlzLmRyYXdEaW1lbnNpb25NYXJrZXJzKClcbiAgICAgIC50aGVuKHRoaXMuZHJhd0xlZ2VuZC5iaW5kKHRoaXMpKVxuICAgICAgLnRoZW4odGhpcy5kcmF3TGFic0FuZFBsb3QuYmluZCh0aGlzKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gVE9ETyBQbyBpZiB5b3UgcmVtb3ZlIHRoaXMgdGhlbiB0aGUgbGlmZSBleHBlY3RhbmN5IGJ1YmJsZSBwbG90IHdpbGwgbm90IGhhdmUgdGhlIGxlZ2VuZExhYmVscyBpbiB0aGUgbGVnZW5kLiBJdCB3aWxsIG9ubHkgaGF2ZSB0aGUgZ3JvdXBzXG4gICAgICAgIGlmICh0aGlzLmRhdGEubGVnZW5kUmVxdWlyZXNSZWRyYXcpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kcmF3TGVnZW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBkcmF3IHN1Y2NlZWRlZCBhZnRlciAke3RoaXMuZHJhd0ZhaWx1cmVDb3VudH0gZmFpbHVyZXNgKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhd0ZhaWx1cmVDb3VudCA9IDA7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy5kcmF3RmFpbHVyZUNvdW50Kys7XG4gICAgICAgIGlmICh0aGlzLmRyYXdGYWlsdXJlQ291bnQgPj0gdGhpcy5tYXhEcmF3RmFpbHVyZUNvdW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYGRyYXcgZmFpbHVyZSAke2Vyci5tZXNzYWdlfSAoZmFpbCBjb3VudDogJHt0aGlzLmRyYXdGYWlsdXJlQ291bnR9KS4gRXhjZWVkZWQgbWF4IGRyYXcgZmFpbHVyZXMgb2YgJHt0aGlzLm1heERyYXdGYWlsdXJlQ291bnR9LiBUZXJtaW5hdGluZ2ApO1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLnJldHJ5KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYGRyYXcgZmFpbHVyZSAke2Vyci5tZXNzYWdlfSAoZmFpbCBjb3VudDogJHt0aGlzLmRyYXdGYWlsdXJlQ291bnR9KS4gUmVkcmF3aW5nYCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfSk7XG4gIH1cblxuICBkcmF3TGFic0FuZFBsb3QoKSB7XG4gICAgdGhpcy5kYXRhLm5vcm1hbGl6ZURhdGEoKTtcblxuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0UHRzQW5kTGFicygnUmVjdFBsb3QuZHJhd0xhYnNBbmRQbG90JykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnRpdGxlLnggPSB0aGlzLnZpZXdCb3hEaW0ueCArICh0aGlzLnZpZXdCb3hEaW0ud2lkdGggLyAyKTtcblxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzTGVnZW5kUHRzU3luY2VkKHRoaXMuZGF0YS5vdXRzaWRlUGxvdFB0c0lkKSkge1xuICAgICAgICBmb3IgKHZhciBwdCBvZiBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZ2V0TGVnZW5kUHRzKCkpKSB7XG4gICAgICAgICAgaWYgKCFfLmluY2x1ZGVzKHRoaXMuZGF0YS5vdXRzaWRlUGxvdFB0c0lkLCBwdCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5hZGRFbGVtVG9MZWdlbmQocHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAocHQgb2YgQXJyYXkuZnJvbSh0aGlzLmRhdGEub3V0c2lkZVBsb3RQdHNJZCkpIHtcbiAgICAgICAgICBpZiAoIV8uaW5jbHVkZXModGhpcy5zdGF0ZS5nZXRMZWdlbmRQdHMoKSwgcHQpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnB1c2hMZWdlbmRQdChwdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdkcmF3TGFic0FuZFBsb3QgZmFpbGVkIDogc3RhdGUuaXNMZWdlbmRQdHNTeW5jZWQgPSBmYWxzZScpO1xuICAgICAgICBlcnJvci5yZXRyeSA9IHRydWU7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5kcmF3VGl0bGUoKTtcbiAgICAgICAgdGhpcy5kcmF3QW5jKCk7XG4gICAgICAgIHRoaXMuZHJhd0xhYnMoKTtcbiAgICAgICAgaWYgKHRoaXMudHJlbmRMaW5lcy5zaG93KSB7IHRoaXMuZHJhd1RyZW5kTGluZXMoKTsgfVxuICAgICAgICB0aGlzLmRyYXdEcmFnZ2VkTWFya2VycygpO1xuICAgICAgICBpZiAodGhpcy5wbG90Qm9yZGVyU2hvdykgeyB0aGlzLmRyYXdSZWN0KCk7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhd0F4aXNMYWJlbHMoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkcmF3VGl0bGUoKSB7XG4gICAgaWYgKHRoaXMudGl0bGUudGV4dCAhPT0gJycpIHtcbiAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLnBsb3QtdGl0bGUnKS5yZW1vdmUoKTtcbiAgICAgIHJldHVybiB0aGlzLnN2Zy5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdwbG90LXRpdGxlJylcbiAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCB0aGlzLnRpdGxlLmZvbnRGYW1pbHkpXG4gICAgICAgICAgLmF0dHIoJ3gnLCB0aGlzLnRpdGxlLngpXG4gICAgICAgICAgLmF0dHIoJ3knLCB0aGlzLnRpdGxlLnkpXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgdGhpcy50aXRsZS5hbmNob3IpXG4gICAgICAgICAgLmF0dHIoJ2ZpbGwnLCB0aGlzLnRpdGxlLmNvbG9yKVxuICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCB0aGlzLnRpdGxlLmZvbnRTaXplKVxuICAgICAgICAgIC5hdHRyKCdmb250LXdlaWdodCcsIHRoaXMudGl0bGUuZm9udFdlaWdodClcbiAgICAgICAgICAudGV4dCh0aGlzLnRpdGxlLnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGRyYXdSZWN0KCkge1xuICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLnBsb3Qtdmlld2JveCcpLnJlbW92ZSgpO1xuICAgIHJldHVybiB0aGlzLnN2Zy5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAncGxvdC12aWV3Ym94JylcbiAgICAgICAgLmF0dHIoJ3gnLCB0aGlzLnZpZXdCb3hEaW0ueClcbiAgICAgICAgLmF0dHIoJ3knLCB0aGlzLnZpZXdCb3hEaW0ueSlcbiAgICAgICAgLmF0dHIoJ3dpZHRoJywgdGhpcy52aWV3Qm94RGltLndpZHRoKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy52aWV3Qm94RGltLmhlaWdodClcbiAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgJzFweCcpO1xuICB9XG5cbiAgZHJhd0RpbWVuc2lvbk1hcmtlcnMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAvLyBUT0RPOiB1bm5lY2Vzc2FyeSBkb3VibGUgY2FsbCA/IFBsb3REYXRhLmNvbnN0cnVjdG9yIGNhbGxzIFBsb3REYXRhLmNhbGN1bGF0ZU1pbk1heCA/XG4gICAgICB0aGlzLmRhdGEuY2FsY3VsYXRlTWluTWF4KCk7XG4gICAgICBjb25zdCBheGlzQXJyYXlzID0gQXhpc1V0aWxzLmdldEF4aXNEYXRhQXJyYXlzKHRoaXMsIHRoaXMuZGF0YSwgdGhpcy52aWV3Qm94RGltKTtcblxuICAgICAgLy8gVE9ETyBLWiB0aGlzIHNlcXVlbmNlIGNhbiBiZSBlYXNpbHkgY29uc29saWRhdGVkXG4gICAgICBpZiAodGhpcy5ncmlkKSB7XG4gICAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLm9yaWdpbicpLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5vcmlnaW4nKVxuICAgICAgICAgICAgLmRhdGEoYXhpc0FycmF5cy5ncmlkT3JpZ2luKVxuICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ29yaWdpbicpXG4gICAgICAgICAgICAuYXR0cigneDEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54MTsgfSlcbiAgICAgICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnkxOyB9KVxuICAgICAgICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueDI7IH0pXG4gICAgICAgICAgICAuYXR0cigneTInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55MjsgfSlcbiAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAwLjIpXG4gICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ2dyZXknKTtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luKSB7XG4gICAgICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcub3JpZ2luJylcbiAgICAgICAgICAgICAgLnN0eWxlKCdzdHJva2UtZGFzaGFycmF5JywgKCc0LCA2JykpXG4gICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAxKVxuICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ2JsYWNrJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5kaW0tbWFya2VyJykucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmRpbS1tYXJrZXInKVxuICAgICAgICAgICAgICAgICAuZGF0YShheGlzQXJyYXlzLmdyaWRMaW5lcylcbiAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgLmFwcGVuZCgnbGluZScpXG4gICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdkaW0tbWFya2VyJylcbiAgICAgICAgICAgICAgICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueDE7IH0pXG4gICAgICAgICAgICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnkxOyB9KVxuICAgICAgICAgICAgICAgICAuYXR0cigneDInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54MjsgfSlcbiAgICAgICAgICAgICAgICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueTI7IH0pXG4gICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAwLjIpXG4gICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2UnLCAnZ3JleScpO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5ncmlkICYmIHRoaXMub3JpZ2luKSB7XG4gICAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLm9yaWdpbicpLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5vcmlnaW4nKVxuICAgICAgICAgICAgLmRhdGEoYXhpc0FycmF5cy5ncmlkT3JpZ2luKVxuICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ29yaWdpbicpXG4gICAgICAgICAgICAuYXR0cigneDEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54MTsgfSlcbiAgICAgICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnkxOyB9KVxuICAgICAgICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueDI7IH0pXG4gICAgICAgICAgICAuYXR0cigneTInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55MjsgfSlcbiAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLWRhc2hhcnJheScsICgnNCwgNicpKVxuICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDEpXG4gICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ2JsYWNrJyk7XG4gICAgICB9XG5cblxuICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcuZGltLW1hcmtlci1sZWFkZXInKS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmRpbS1tYXJrZXItbGVhZGVyJylcbiAgICAgICAgICAgICAgIC5kYXRhKGF4aXNBcnJheXMuYXhpc0xlYWRlcilcbiAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdkaW0tbWFya2VyLWxlYWRlcicpXG4gICAgICAgICAgICAgICAuYXR0cigneDEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54MTsgfSlcbiAgICAgICAgICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnkxOyB9KVxuICAgICAgICAgICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueDI7IH0pXG4gICAgICAgICAgICAgICAuYXR0cigneTInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55MjsgfSlcbiAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAxKVxuICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpO1xuXG4gICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5kaW0tbWFya2VyLWxhYmVsJykucmVtb3ZlKCk7XG4gICAgICBjb25zdCBtYXJrZXJMYWJlbHMgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5kaW0tbWFya2VyLWxhYmVsJylcbiAgICAgICAgICAgICAgIC5kYXRhKGF4aXNBcnJheXMuYXhpc0xlYWRlckxhYmVsKVxuICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2RpbS1tYXJrZXItbGFiZWwnKVxuICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54OyB9KVxuICAgICAgICAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55OyB9KVxuICAgICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgdGhpcy5heGlzRm9udEZhbWlseSlcbiAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgdGhpcy5heGlzRm9udENvbG9yKVxuICAgICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIHRoaXMuYXhpc0ZvbnRTaXplKVxuICAgICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubGFiZWw7IH0pXG4gICAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5hbmNob3I7IH0pXG4gICAgICAgICAgICAgICAuYXR0cigndHlwZScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnR5cGU7IH0pO1xuXG4gICAgICAvLyBGaWd1cmUgb3V0IHRoZSBtYXggd2lkdGggb2YgdGhlIHlheGlzIGRpbWVuc2lvbmFsIGxhYmVsc1xuICAgICAgY29uc3QgaW5pdEF4aXNUZXh0Um93V2lkdGggPSB0aGlzLmF4aXNEaW1lbnNpb25UZXh0LnJvd01heFdpZHRoO1xuICAgICAgY29uc3QgaW5pdEF4aXNUZXh0Q29sV2lkdGggPSB0aGlzLmF4aXNEaW1lbnNpb25UZXh0LmNvbE1heFdpZHRoO1xuICAgICAgY29uc3QgaW5pdEF4aXNUZXh0Um93SGVpZ2h0ID0gdGhpcy5heGlzRGltZW5zaW9uVGV4dC5yb3dNYXhIZWlnaHQ7XG4gICAgICBjb25zdCBpbml0QXhpc1RleHRDb2xIZWlnaHQgPSB0aGlzLmF4aXNEaW1lbnNpb25UZXh0LmNvbE1heEhlaWdodDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFya2VyTGFiZWxzWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG1hcmtlckxhYmVsID0gbWFya2VyTGFiZWxzWzBdW2ldO1xuICAgICAgICBjb25zdCBsYWJlbFR5cGUgPSBkMy5zZWxlY3QobWFya2VyTGFiZWwpLmF0dHIoJ3R5cGUnKTtcbiAgICAgICAgY29uc3QgYmIgPSBtYXJrZXJMYWJlbC5nZXRCQm94KCk7XG4gICAgICAgIGlmICgodGhpcy5heGlzRGltZW5zaW9uVGV4dC5yb3dNYXhXaWR0aCA8IGJiLndpZHRoKSAmJiAobGFiZWxUeXBlID09PSAncm93JykpIHsgdGhpcy5heGlzRGltZW5zaW9uVGV4dC5yb3dNYXhXaWR0aCA9IGJiLndpZHRoOyB9XG4gICAgICAgIGlmICgodGhpcy5heGlzRGltZW5zaW9uVGV4dC5jb2xNYXhXaWR0aCA8IGJiLndpZHRoKSAmJiAobGFiZWxUeXBlID09PSAnY29sJykpIHsgdGhpcy5heGlzRGltZW5zaW9uVGV4dC5jb2xNYXhXaWR0aCA9IGJiLndpZHRoOyB9XG4gICAgICAgIGlmICgodGhpcy5heGlzRGltZW5zaW9uVGV4dC5yb3dNYXhIZWlnaHQgPCBiYi5oZWlnaHQpICYmIChsYWJlbFR5cGUgPT09ICdyb3cnKSkgeyB0aGlzLmF4aXNEaW1lbnNpb25UZXh0LnJvd01heEhlaWdodCA9IGJiLmhlaWdodDsgfVxuICAgICAgICBpZiAoKHRoaXMuYXhpc0RpbWVuc2lvblRleHQuY29sTWF4SGVpZ2h0IDwgYmIuaGVpZ2h0KSAmJiAobGFiZWxUeXBlID09PSAnY29sJykpIHsgdGhpcy5heGlzRGltZW5zaW9uVGV4dC5jb2xNYXhIZWlnaHQgPSBiYi5oZWlnaHQ7IH1cblxuICAgICAgICBpZiAodGhpcy53aWR0aCA8IChiYi54ICsgYmIud2lkdGgpKSB7XG4gICAgICAgICAgdGhpcy5heGlzRGltZW5zaW9uVGV4dC5yaWdodFBhZGRpbmcgPSBiYi53aWR0aCAvIDI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKChpbml0QXhpc1RleHRSb3dXaWR0aCAhPT0gdGhpcy5heGlzRGltZW5zaW9uVGV4dC5yb3dNYXhXaWR0aCkgfHxcbiAgICAgICAgIChpbml0QXhpc1RleHRDb2xXaWR0aCAhPT0gdGhpcy5heGlzRGltZW5zaW9uVGV4dC5jb2xNYXhXaWR0aCkgfHxcbiAgICAgICAgIChpbml0QXhpc1RleHRSb3dIZWlnaHQgIT09IHRoaXMuYXhpc0RpbWVuc2lvblRleHQucm93TWF4SGVpZ2h0KSB8fFxuICAgICAgICAgKGluaXRBeGlzVGV4dENvbEhlaWdodCAhPT0gdGhpcy5heGlzRGltZW5zaW9uVGV4dC5jb2xNYXhIZWlnaHQpKSB7XG4gICAgICAgIHRoaXMuc2V0RGltKHRoaXMuc3ZnLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuZGF0YS5yZXZlcnRNaW5NYXgoKTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ2F4aXMgbWFya2VyIG91dCBvZiBib3VuZCcpO1xuICAgICAgICBlcnJvci5yZXRyeSA9IHRydWU7XG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICB9LmJpbmQodGhpcykpKTtcbiAgfVxuXG5cbiAgZHJhd0F4aXNMYWJlbHMoKSB7XG4gICAgY29uc3QgYXhpc0xhYmVscyA9IFtcbiAgICAgIHsgLy8geCBheGlzIGxhYmVsXG4gICAgICAgIHg6IHRoaXMudmlld0JveERpbS54ICsgKHRoaXMudmlld0JveERpbS53aWR0aCAvIDIpLFxuICAgICAgICB5OiB0aGlzLnZpZXdCb3hEaW0ueSArIHRoaXMudmlld0JveERpbS5oZWlnaHQgK1xuICAgICAgICAgICB0aGlzLmF4aXNMZWFkZXJMaW5lTGVuZ3RoICtcbiAgICAgICAgICAgdGhpcy5heGlzRGltZW5zaW9uVGV4dC5jb2xNYXhIZWlnaHQgK1xuICAgICAgICAgICB0aGlzLnhUaXRsZS50b3BQYWRkaW5nICtcbiAgICAgICAgICAgdGhpcy54VGl0bGUudGV4dEhlaWdodCxcbiAgICAgICAgdGV4dDogdGhpcy54VGl0bGUudGV4dCxcbiAgICAgICAgYW5jaG9yOiAnbWlkZGxlJyxcbiAgICAgICAgdHJhbnNmb3JtOiAncm90YXRlKDApJyxcbiAgICAgICAgZGlzcGxheTogdGhpcy54VGl0bGUgPT09ICcnID8gJ25vbmUnIDogJycsXG4gICAgICAgIGZvbnRGYW1pbHk6IHRoaXMueFRpdGxlLmZvbnRGYW1pbHksXG4gICAgICAgIGZvbnRTaXplOiB0aGlzLnhUaXRsZS5mb250U2l6ZSxcbiAgICAgICAgZm9udENvbG9yOiB0aGlzLnhUaXRsZS5mb250Q29sb3IsXG4gICAgICB9LFxuICAgICAgeyAvLyB5IGF4aXMgbGFiZWxcbiAgICAgICAgeDogdGhpcy5ob3Jpem9udGFsUGFkZGluZyArIHRoaXMueVRpdGxlLnRleHRIZWlnaHQsXG4gICAgICAgIHk6IHRoaXMudmlld0JveERpbS55ICsgKHRoaXMudmlld0JveERpbS5oZWlnaHQgLyAyKSxcbiAgICAgICAgdGV4dDogdGhpcy55VGl0bGUudGV4dCxcbiAgICAgICAgYW5jaG9yOiAnbWlkZGxlJyxcbiAgICAgICAgdHJhbnNmb3JtOiBgcm90YXRlKDI3MCwke3RoaXMuaG9yaXpvbnRhbFBhZGRpbmcgKyB0aGlzLnlUaXRsZS50ZXh0SGVpZ2h0fSwgJHt0aGlzLnZpZXdCb3hEaW0ueSArICh0aGlzLnZpZXdCb3hEaW0uaGVpZ2h0IC8gMil9KWAsXG4gICAgICAgIGRpc3BsYXk6IHRoaXMueVRpdGxlID09PSAnJyA/ICdub25lJyA6ICcnLFxuICAgICAgICBmb250RmFtaWx5OiB0aGlzLnlUaXRsZS5mb250RmFtaWx5LFxuICAgICAgICBmb250U2l6ZTogdGhpcy55VGl0bGUuZm9udFNpemUsXG4gICAgICAgIGZvbnRDb2xvcjogdGhpcy55VGl0bGUuZm9udENvbG9yLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcuYXhpcy1sYWJlbCcpLnJlbW92ZSgpO1xuICAgIHJldHVybiB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5heGlzLWxhYmVsJylcbiAgICAgICAgICAgICAuZGF0YShheGlzTGFiZWxzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2F4aXMtbGFiZWwnKVxuICAgICAgICAgICAgIC5hdHRyKCd4JywgZCA9PiBkLngpXG4gICAgICAgICAgICAgLmF0dHIoJ3knLCBkID0+IGQueSlcbiAgICAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCBkID0+IGQuZm9udEZhbWlseSlcbiAgICAgICAgICAgICAuYXR0cignZm9udC1zaXplJywgZCA9PiBkLmZvbnRTaXplKVxuICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgZCA9PiBkLmZvbnRDb2xvcilcbiAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCBkID0+IGQuYW5jaG9yKVxuICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBkID0+IGQudHJhbnNmb3JtKVxuICAgICAgICAgICAgIC50ZXh0KGQgPT4gZC50ZXh0KVxuICAgICAgICAgICAgIC5zdHlsZSgnZm9udC13ZWlnaHQnLCAnbm9ybWFsJylcbiAgICAgICAgICAgICAuc3R5bGUoJ2Rpc3BsYXknLCBkID0+IGQuZGlzcGxheSk7XG4gIH1cblxuICBkcmF3TGVnZW5kKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbGV0IGxlZ2VuZEZvbnRTaXplO1xuICAgICAgdGhpcy5kYXRhLnNldHVwTGVnZW5kR3JvdXBzQW5kUHRzKCk7XG5cbiAgICAgIGlmICh0aGlzLmxlZ2VuZEJ1YmJsZXNTaG93ICYmIFV0aWxzLmlzQXJyT2ZOdW1zKHRoaXMuWikpIHtcbiAgICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGVnZW5kLWJ1YmJsZXMnKS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGVnZW5kLWJ1YmJsZXMnKVxuICAgICAgICAgICAgLmRhdGEodGhpcy5kYXRhLmxlZ2VuZEJ1YmJsZXMpXG4gICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsZWdlbmQtYnViYmxlcycpXG4gICAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5jeDsgfSlcbiAgICAgICAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmN5OyB9KVxuICAgICAgICAgICAgLmF0dHIoJ3InLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5yOyB9KVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ2JsYWNrJylcbiAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utb3BhY2l0eScsIDAuNSk7XG5cbiAgICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGVnZW5kLWJ1YmJsZXMtbGFiZWxzJykucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxlZ2VuZC1idWJibGVzLWxhYmVscycpXG4gICAgICAgICAgICAuZGF0YSh0aGlzLmRhdGEubGVnZW5kQnViYmxlcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsZWdlbmQtYnViYmxlcy1sYWJlbHMnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54OyB9KVxuICAgICAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55OyB9KVxuICAgICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAuYXR0cignZm9udC1zaXplJywgdGhpcy5sZWdlbmRGb250U2l6ZSlcbiAgICAgICAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIHRoaXMubGVnZW5kRm9udEZhbWlseSlcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgdGhpcy5sZWdlbmRGb250Q29sb3IpXG4gICAgICAgICAgICAudGV4dChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC50ZXh0OyB9KTtcblxuICAgICAgICBpZiAodGhpcy56VGl0bGUgIT09ICcnKSB7XG4gICAgICAgICAgKHsgbGVnZW5kRm9udFNpemUgfSA9IHRoaXMpO1xuICAgICAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxlZ2VuZC1idWJibGVzLXRpdGxlJykucmVtb3ZlKCk7XG4gICAgICAgICAgY29uc3QgbGVnZW5kQnViYmxlVGl0bGVTdmcgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sZWdlbmQtYnViYmxlcy10aXRsZScpXG4gICAgICAgICAgICAgIC5kYXRhKHRoaXMuZGF0YS5sZWdlbmRCdWJibGVzVGl0bGUpXG4gICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGVnZW5kLWJ1YmJsZXMtdGl0bGUnKVxuICAgICAgICAgICAgICAuYXR0cigneCcsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLng7IH0pXG4gICAgICAgICAgICAgIC5hdHRyKCd5JywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueSAtIChsZWdlbmRGb250U2l6ZSAqIDEuNSk7IH0pXG4gICAgICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCB0aGlzLmxlZ2VuZEZvbnRGYW1pbHkpXG4gICAgICAgICAgICAgIC5hdHRyKCdmb250LXdlaWdodCcsICdub3JtYWwnKVxuICAgICAgICAgICAgICAuYXR0cignZmlsbCcsIHRoaXMubGVnZW5kRm9udENvbG9yKVxuICAgICAgICAgICAgICAudGV4dCh0aGlzLnpUaXRsZSk7XG5cbiAgICAgICAgICBTdmdVdGlscy5zZXRTdmdCQm94V2lkdGhBbmRIZWlnaHQodGhpcy5kYXRhLmxlZ2VuZEJ1YmJsZXNUaXRsZSwgbGVnZW5kQnViYmxlVGl0bGVTdmcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRyYWcgPSBEcmFnVXRpbHMuZ2V0TGVnZW5kTGFiZWxEcmFnQW5kRHJvcCh0aGlzLCB0aGlzLmRhdGEpO1xuICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGVnZW5kLWRyYWdnZWQtcHRzLXRleHQnKS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxlZ2VuZC1kcmFnZ2VkLXB0cy10ZXh0JylcbiAgICAgICAgICAuZGF0YSh0aGlzLmRhdGEubGVnZW5kUHRzKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xlZ2VuZC1kcmFnZ2VkLXB0cy10ZXh0JylcbiAgICAgICAgICAuYXR0cignaWQnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gYGxlZ2VuZC0ke2QuaWR9YDsgfSlcbiAgICAgICAgICAuYXR0cigneCcsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLng7IH0pXG4gICAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55OyB9KVxuICAgICAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIHRoaXMubGVnZW5kRm9udEZhbWlseSlcbiAgICAgICAgICAuYXR0cignZm9udC1zaXplJywgdGhpcy5sZWdlbmRGb250U2l6ZSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5hbmNob3I7IH0pXG4gICAgICAgICAgLmF0dHIoJ2ZpbGwnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5jb2xvcjsgfSlcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoZCkgeyBpZiAoZC5tYXJrZXJJZCAhPSBudWxsKSB7IHJldHVybiBVdGlscy5nZXRTdXBlcnNjcmlwdChkLm1hcmtlcklkICsgMSkgKyBkLnRleHQ7IH0gZWxzZSB7IHJldHVybiBkLnRleHQ7IH0gfSlcbiAgICAgICAgICAuY2FsbChkcmFnKTtcblxuICAgICAgU3ZnVXRpbHMuc2V0U3ZnQkJveFdpZHRoQW5kSGVpZ2h0KHRoaXMuZGF0YS5sZWdlbmRQdHMsIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxlZ2VuZC1kcmFnZ2VkLXB0cy10ZXh0JykpO1xuXG4gICAgICBpZiAodGhpcy5sZWdlbmRTaG93KSB7XG4gICAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxlZ2VuZC1ncm91cHMtdGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sZWdlbmQtZ3JvdXBzLXRleHQnKVxuICAgICAgICAgICAgLmRhdGEodGhpcy5kYXRhLmxlZ2VuZEdyb3VwcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsZWdlbmQtZ3JvdXBzLXRleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54OyB9KVxuICAgICAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55OyB9KVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgdGhpcy5sZWdlbmRGb250RmFtaWx5KVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCB0aGlzLmxlZ2VuZEZvbnRDb2xvcilcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCB0aGlzLmxlZ2VuZEZvbnRTaXplKVxuICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudGV4dDsgfSlcbiAgICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmFuY2hvcjsgfSk7XG5cbiAgICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGVnZW5kLWdyb3Vwcy1wdHMnKS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGVnZW5kLWdyb3Vwcy1wdHMnKVxuICAgICAgICAgICAgICAgICAuZGF0YSh0aGlzLmRhdGEubGVnZW5kR3JvdXBzKVxuICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGVnZW5kLWdyb3Vwcy1wdHMnKVxuICAgICAgICAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5jeDsgfSlcbiAgICAgICAgICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQuY3k7IH0pXG4gICAgICAgICAgICAgICAgIC5hdHRyKCdyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQucjsgfSlcbiAgICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5jb2xvcjsgfSlcbiAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnN0cm9rZTsgfSlcbiAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS1vcGFjaXR5JywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGRbJ3N0cm9rZS1vcGFjaXR5J107IH0pXG4gICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsLW9wYWNpdHknLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5maWxsT3BhY2l0eTsgfSk7XG5cbiAgICAgICAgLy8gSGVpZ2h0IGFuZCB3aWR0aCBhcmUgbm90IHByb3ZpZGVkXG4gICAgICAgIFN2Z1V0aWxzLnNldFN2Z0JCb3hXaWR0aEFuZEhlaWdodCh0aGlzLmRhdGEubGVnZW5kR3JvdXBzLCB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sZWdlbmQtZ3JvdXBzLXRleHQnKSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmxlZ2VuZFNob3cgfHwgKHRoaXMubGVnZW5kQnViYmxlc1Nob3cgJiYgVXRpbHMuaXNBcnJPZk51bXModGhpcy5aKSkgfHwgKHRoaXMuZGF0YS5sZWdlbmRQdHMgIT0gbnVsbCkpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5yZXNpemVkQWZ0ZXJMZWdlbmRHcm91cHNEcmF3bih0aGlzLmxlZ2VuZFNob3cpKSB7XG4gICAgICAgICAgdGhpcy5kYXRhLnJldmVydE1pbk1heCgpO1xuICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdkcmF3TGVnZW5kIEZhaWxlZCcpO1xuICAgICAgICAgIGVycm9yLnJldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICB9LmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIGRyYXdBbmMoKSB7XG4gICAgbGV0IGxhYmVsVHh0LFxuICAgICAgeGxhYmVsLFxuICAgICAgeWxhYmVsO1xuICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmFuYycpLnJlbW92ZSgpO1xuICAgIGNvbnN0IGFuYyA9IHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmFuYycpXG4gICAgICAgICAgICAgLmRhdGEodGhpcy5kYXRhLnB0cylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2FuYycpXG4gICAgICAgICAgICAgLmF0dHIoJ2lkJywgZCA9PiBgYW5jLSR7ZC5pZH1gKVxuICAgICAgICAgICAgIC5hdHRyKCdjeCcsIGQgPT4gZC54KVxuICAgICAgICAgICAgIC5hdHRyKCdjeScsIGQgPT4gZC55KVxuICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgZCA9PiBkLmNvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKCdmaWxsLW9wYWNpdHknLCBkID0+IGQuZmlsbE9wYWNpdHkpXG4gICAgICAgICAgICAgLmF0dHIoJ3InLCAoZCkgPT4ge1xuICAgICAgICAgICAgICAgaWYgKHRoaXMudHJlbmRMaW5lcy5zaG93KSB7XG4gICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyZW5kTGluZXMucG9pbnRTaXplO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIGQucjtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KTtcbiAgICBpZiAoVXRpbHMuaXNBcnJPZk51bXModGhpcy5aKSkge1xuICAgICAgcmV0dXJuIGFuYy5hcHBlbmQoJ3RpdGxlJylcbiAgICAgICAgIC50ZXh0KChkKSA9PiB7XG4gICAgICAgICAgIHhsYWJlbCA9IFV0aWxzLmdldEZvcm1hdHRlZE51bShkLmxhYmVsWCwgdGhpcy54RGVjaW1hbHMsIHRoaXMueFByZWZpeCwgdGhpcy54U3VmZml4KTtcbiAgICAgICAgICAgeWxhYmVsID0gVXRpbHMuZ2V0Rm9ybWF0dGVkTnVtKGQubGFiZWxZLCB0aGlzLnlEZWNpbWFscywgdGhpcy55UHJlZml4LCB0aGlzLnlTdWZmaXgpO1xuICAgICAgICAgICBjb25zdCB6bGFiZWwgPSBVdGlscy5nZXRGb3JtYXR0ZWROdW0oZC5sYWJlbFosIHRoaXMuekRlY2ltYWxzLCB0aGlzLnpQcmVmaXgsIHRoaXMuelN1ZmZpeCk7XG4gICAgICAgICAgIGxhYmVsVHh0ID0gZC5sYWJlbCA9PT0gJycgPyBkLmxhYmVsQWx0IDogZC5sYWJlbDtcbiAgICAgICAgICAgcmV0dXJuIGAke2xhYmVsVHh0fSwgJHtkLmdyb3VwfVxcbiR7emxhYmVsfVxcbigke3hsYWJlbH0sICR7eWxhYmVsfSlgO1xuICAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhbmMuYXBwZW5kKCd0aXRsZScpXG4gICAgICAgICAudGV4dCgoZCkgPT4ge1xuICAgICAgICAgICB4bGFiZWwgPSBVdGlscy5nZXRGb3JtYXR0ZWROdW0oZC5sYWJlbFgsIHRoaXMueERlY2ltYWxzLCB0aGlzLnhQcmVmaXgsIHRoaXMueFN1ZmZpeCk7XG4gICAgICAgICAgIHlsYWJlbCA9IFV0aWxzLmdldEZvcm1hdHRlZE51bShkLmxhYmVsWSwgdGhpcy55RGVjaW1hbHMsIHRoaXMueVByZWZpeCwgdGhpcy55U3VmZml4KTtcbiAgICAgICAgICAgbGFiZWxUeHQgPSBkLmxhYmVsID09PSAnJyA/IGQubGFiZWxBbHQgOiBkLmxhYmVsO1xuICAgICAgICAgICByZXR1cm4gYCR7bGFiZWxUeHR9LCAke2QuZ3JvdXB9XFxuKCR7eGxhYmVsfSwgJHt5bGFiZWx9KWA7XG4gICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkcmF3RHJhZ2dlZE1hcmtlcnMoKSB7XG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubWFya2VyJykucmVtb3ZlKCk7XG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubWFya2VyJylcbiAgICAgICAgLmRhdGEodGhpcy5kYXRhLm91dHNpZGVQbG90TWFya2VycylcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgnbGluZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdtYXJrZXInKVxuICAgICAgICAuYXR0cigneDEnLCBkID0+IGQueDEpXG4gICAgICAgIC5hdHRyKCd5MScsIGQgPT4gZC55MSlcbiAgICAgICAgLmF0dHIoJ3gyJywgZCA9PiBkLngyKVxuICAgICAgICAuYXR0cigneTInLCBkID0+IGQueTIpXG4gICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCBkID0+IGQud2lkdGgpXG4gICAgICAgIC5hdHRyKCdzdHJva2UnLCBkID0+IGQuY29sb3IpO1xuXG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubWFya2VyLWxhYmVsJykucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLm1hcmtlci1sYWJlbCcpXG4gICAgICAgIC5kYXRhKHRoaXMuZGF0YS5vdXRzaWRlUGxvdE1hcmtlcnMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbWFya2VyLWxhYmVsJylcbiAgICAgICAgLmF0dHIoJ3gnLCBkID0+IGQubWFya2VyVGV4dFgpXG4gICAgICAgIC5hdHRyKCd5JywgZCA9PiBkLm1hcmtlclRleHRZKVxuICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCAnQXJpYWwnKVxuICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnc3RhcnQnKVxuICAgICAgICAuYXR0cignZm9udC1zaXplJywgdGhpcy5kYXRhLmxlZ2VuZERpbS5tYXJrZXJUZXh0U2l6ZSlcbiAgICAgICAgLmF0dHIoJ2ZpbGwnLCBkID0+IGQuY29sb3IpXG4gICAgICAgIC50ZXh0KGQgPT4gZC5tYXJrZXJMYWJlbCk7XG4gIH1cblxuICByZXNldFBsb3RBZnRlckRyYWdFdmVudCgpIHtcbiAgICBjb25zdCBwbG90RWxlbXMgPSBbXG4gICAgICAnLnBsb3Qtdmlld2JveCcsXG4gICAgICAnLm9yaWdpbicsXG4gICAgICAnLmRpbS1tYXJrZXInLFxuICAgICAgJy5kaW0tbWFya2VyLWxlYWRlcicsXG4gICAgICAnLmRpbS1tYXJrZXItbGFiZWwnLFxuICAgICAgJy5heGlzLWxhYmVsJyxcbiAgICAgICcubGVnZW5kLXB0cycsXG4gICAgICAnLmxlZ2VuZC10ZXh0JyxcbiAgICAgICcuYW5jJyxcbiAgICAgICcubGFiJyxcbiAgICAgICcubGluaycsXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGVsZW0gb2YgQXJyYXkuZnJvbShwbG90RWxlbXMpKSB7XG4gICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoZWxlbSkucmVtb3ZlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRyYXcoKTtcbiAgfVxuXG4gIGRyYXdMYWJzKCkge1xuICAgIGxldCBkcmFnLFxuICAgICAgbGFiZWxlcixcbiAgICAgIGxhYmVsc19pbWdfc3ZnLFxuICAgICAgbGFiZWxzX3N2ZztcbiAgICBpZiAodGhpcy5zaG93TGFiZWxzICYmICF0aGlzLnRyZW5kTGluZXMuc2hvdykge1xuICAgICAgZHJhZyA9IERyYWdVdGlscy5nZXRMYWJlbERyYWdBbmREcm9wKHRoaXMpO1xuICAgICAgdGhpcy5zdGF0ZS51cGRhdGVMYWJlbHNXaXRoVXNlclBvc2l0aW9uZWREYXRhKHRoaXMuZGF0YS5sYWIsIHRoaXMuZGF0YS52aWV3Qm94RGltKTtcblxuICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGFiLWltZycpLnJlbW92ZSgpO1xuICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGFiLWltZycpXG4gICAgICAgICAgLmRhdGEodGhpcy5kYXRhLmxhYilcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ3N2ZzppbWFnZScpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xhYi1pbWcnKVxuICAgICAgICAgIC5hdHRyKCd4bGluazpocmVmJywgZCA9PiBkLnVybClcbiAgICAgICAgICAuYXR0cignaWQnLCBmdW5jdGlvbiAoZCkgeyBpZiAoZC51cmwgIT09ICcnKSB7IHJldHVybiBkLmlkOyB9IH0pXG4gICAgICAgICAgLmF0dHIoJ3gnLCBkID0+IGQueCAtIChkLndpZHRoIC8gMikpXG4gICAgICAgICAgLmF0dHIoJ3knLCBkID0+IGQueSAtIGQuaGVpZ2h0KVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGQgPT4gZC53aWR0aClcbiAgICAgICAgICAuYXR0cignaGVpZ2h0JywgZCA9PiBkLmhlaWdodClcbiAgICAgICAgICAuY2FsbChkcmFnKTtcblxuICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGFiJykucmVtb3ZlKCk7XG4gICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sYWInKVxuICAgICAgICAgICAgICAgLmRhdGEodGhpcy5kYXRhLmxhYilcbiAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsYWInKVxuICAgICAgICAgICAgICAgLmF0dHIoJ2lkJywgZnVuY3Rpb24gKGQpIHsgaWYgKGQudXJsID09PSAnJykgeyByZXR1cm4gZC5pZDsgfSB9KVxuICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBkID0+IGQueClcbiAgICAgICAgICAgICAgIC5hdHRyKCd5JywgZCA9PiBkLnkpXG4gICAgICAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCBkID0+IGQuZm9udEZhbWlseSlcbiAgICAgICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uIChkKSB7IGlmIChkLnVybCA9PT0gJycpIHsgcmV0dXJuIGQudGV4dDsgfSB9KVxuICAgICAgICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAgICAuYXR0cignZmlsbCcsIGQgPT4gZC5jb2xvcilcbiAgICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCBkID0+IGQuZm9udFNpemUpXG4gICAgICAgICAgICAgICAuY2FsbChkcmFnKTtcblxuICAgICAgbGFiZWxzX3N2ZyA9IHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxhYicpO1xuICAgICAgbGFiZWxzX2ltZ19zdmcgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sYWItaW1nJyk7XG5cbiAgICAgIFN2Z1V0aWxzLnNldFN2Z0JCb3hXaWR0aEFuZEhlaWdodCh0aGlzLmRhdGEubGFiLCBsYWJlbHNfc3ZnKTtcbiAgICAgIGNvbnNvbGUubG9nKCdyaHRtbExhYmVsZWRTY2F0dGVyOiBSdW5uaW5nIGxhYmVsIHBsYWNlbWVudCBhbGdvcml0aG0uLi4nKTtcbiAgICAgIGxhYmVsZXIgPSBkMy5sYWJlbGVyKClcbiAgICAgICAgICAgICAgICAgIC5zdmcodGhpcy5zdmcpXG4gICAgICAgICAgICAgICAgICAudzEodGhpcy52aWV3Qm94RGltLngpXG4gICAgICAgICAgICAgICAgICAudzIodGhpcy52aWV3Qm94RGltLnggKyB0aGlzLnZpZXdCb3hEaW0ud2lkdGgpXG4gICAgICAgICAgICAgICAgICAuaDEodGhpcy52aWV3Qm94RGltLnkpXG4gICAgICAgICAgICAgICAgICAuaDIodGhpcy52aWV3Qm94RGltLnkgKyB0aGlzLnZpZXdCb3hEaW0uaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgLmFuY2hvcih0aGlzLmRhdGEucHRzKVxuICAgICAgICAgICAgICAgICAgLmxhYmVsKHRoaXMuZGF0YS5sYWIpXG4gICAgICAgICAgICAgICAgICAucGlubmVkKHRoaXMuc3RhdGUuZ2V0VXNlclBvc2l0aW9uZWRMYWJJZHMoKSlcbiAgICAgICAgICAgICAgICAgIC5zdGFydCg1MDApO1xuXG4gICAgICBsYWJlbHNfc3ZnLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgICAgIC5kdXJhdGlvbig4MDApXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBkID0+IGQueClcbiAgICAgICAgICAgICAgICAuYXR0cigneScsIGQgPT4gZC55KTtcblxuICAgICAgbGFiZWxzX2ltZ19zdmcudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbig4MDApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgZCA9PiBkLnggLSAoZC53aWR0aCAvIDIpKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cigneScsIGQgPT4gZC55IC0gZC5oZWlnaHQpO1xuXG4gICAgICByZXR1cm4gdGhpcy5kcmF3TGlua3MoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hvd0xhYmVscyAmJiB0aGlzLnRyZW5kTGluZXMuc2hvdykge1xuICAgICAgdGhpcy50bCA9IG5ldyBUcmVuZExpbmUodGhpcy5kYXRhLnB0cywgdGhpcy5kYXRhLmxhYik7XG4gICAgICB0aGlzLnN0YXRlLnVwZGF0ZUxhYmVsc1dpdGhVc2VyUG9zaXRpb25lZERhdGEodGhpcy5kYXRhLmxhYiwgdGhpcy5kYXRhLnZpZXdCb3hEaW0pO1xuXG4gICAgICBkcmFnID0gRHJhZ1V0aWxzLmdldExhYmVsRHJhZ0FuZERyb3AodGhpcywgdGhpcy50cmVuZExpbmVzLnNob3cpO1xuXG4gICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sYWItaW1nJykucmVtb3ZlKCk7XG4gICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sYWItaW1nJylcbiAgICAgICAgLmRhdGEodGhpcy50bC5hcnJvd2hlYWRMYWJlbHMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3N2ZzppbWFnZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdsYWItaW1nJylcbiAgICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCBkID0+IGQudXJsKVxuICAgICAgICAuYXR0cignaWQnLCBmdW5jdGlvbiAoZCkgeyBpZiAoZC51cmwgIT09ICcnKSB7IHJldHVybiBkLmlkOyB9IH0pXG4gICAgICAgIC5hdHRyKCd4JywgZCA9PiBkLnggLSAoZC53aWR0aCAvIDIpKVxuICAgICAgICAuYXR0cigneScsIGQgPT4gZC55IC0gZC5oZWlnaHQpXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIGQgPT4gZC53aWR0aClcbiAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGQgPT4gZC5oZWlnaHQpXG4gICAgICAgIC5jYWxsKGRyYWcpO1xuXG5cbiAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxhYicpLnJlbW92ZSgpO1xuICAgICAgdGhpcy5zdmcuc2VsZWN0QWxsKCcubGFiJylcbiAgICAgICAgLmRhdGEodGhpcy50bC5hcnJvd2hlYWRMYWJlbHMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbGFiJylcbiAgICAgICAgLmF0dHIoJ2lkJywgZnVuY3Rpb24gKGQpIHsgaWYgKGQudXJsID09PSAnJykgeyByZXR1cm4gZC5pZDsgfSB9KVxuICAgICAgICAuYXR0cigneCcsIGQgPT4gZC54KVxuICAgICAgICAuYXR0cigneScsIGQgPT4gZC55KVxuICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCBkID0+IGQuZm9udEZhbWlseSlcbiAgICAgICAgLnRleHQoZnVuY3Rpb24gKGQpIHsgaWYgKGQudXJsID09PSAnJykgeyByZXR1cm4gZC50ZXh0OyB9IH0pXG4gICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAuYXR0cignZmlsbCcsIGQgPT4gZC5jb2xvcilcbiAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIGQgPT4gZC5mb250U2l6ZSlcbiAgICAgICAgLmNhbGwoZHJhZyk7XG5cbiAgICAgIGxhYmVsc19zdmcgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5sYWInKTtcbiAgICAgIGxhYmVsc19pbWdfc3ZnID0gdGhpcy5zdmcuc2VsZWN0QWxsKCcubGFiLWltZycpO1xuICAgICAgU3ZnVXRpbHMuc2V0U3ZnQkJveFdpZHRoQW5kSGVpZ2h0KHRoaXMudGwuYXJyb3doZWFkTGFiZWxzLCBsYWJlbHNfc3ZnKTtcblxuICAgICAgbGFiZWxlciA9IGQzLmxhYmVsZXIoKVxuICAgICAgICAgICAgICAgICAgLnN2Zyh0aGlzLnN2ZylcbiAgICAgICAgICAgICAgICAgIC53MSh0aGlzLnZpZXdCb3hEaW0ueClcbiAgICAgICAgICAgICAgICAgIC53Mih0aGlzLnZpZXdCb3hEaW0ueCArIHRoaXMudmlld0JveERpbS53aWR0aClcbiAgICAgICAgICAgICAgICAgIC5oMSh0aGlzLnZpZXdCb3hEaW0ueSlcbiAgICAgICAgICAgICAgICAgIC5oMih0aGlzLnZpZXdCb3hEaW0ueSArIHRoaXMudmlld0JveERpbS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAuYW5jaG9yKHRoaXMudGwuYXJyb3doZWFkUHRzKVxuICAgICAgICAgICAgICAgICAgLmxhYmVsKHRoaXMudGwuYXJyb3doZWFkTGFiZWxzKVxuICAgICAgICAgICAgICAgICAgLnBpbm5lZCh0aGlzLnN0YXRlLmdldFVzZXJQb3NpdGlvbmVkTGFiSWRzKCkpXG4gICAgICAgICAgICAgICAgICAuc3RhcnQoNTAwKTtcblxuICAgICAgbGFiZWxzX3N2Zy50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKDgwMClcbiAgICAgICAgLmF0dHIoJ3gnLCBkID0+IGQueClcbiAgICAgICAgLmF0dHIoJ3knLCBkID0+IGQueSk7XG5cbiAgICAgIHJldHVybiBsYWJlbHNfaW1nX3N2Zy50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKDgwMClcbiAgICAgICAgLmF0dHIoJ3gnLCBkID0+IGQueCAtIChkLndpZHRoIC8gMikpXG4gICAgICAgIC5hdHRyKCd5JywgZCA9PiBkLnkgLSBkLmhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgZHJhd0xpbmtzKCkge1xuICAgIGNvbnN0IGxpbmtzID0gbmV3IExpbmtzKHRoaXMuZGF0YS5wdHMsIHRoaXMuZGF0YS5sYWIpO1xuICAgIHRoaXMuc3ZnLnNlbGVjdEFsbCgnLmxpbmsnKS5yZW1vdmUoKTtcbiAgICByZXR1cm4gdGhpcy5zdmcuc2VsZWN0QWxsKCcubGluaycpXG4gICAgICAgICAgICAgLmRhdGEobGlua3MuZ2V0TGlua0RhdGEoKSlcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgICAgICAgICAuYXR0cigneDEnLCBkID0+IGQueDEpXG4gICAgICAgICAgICAgLmF0dHIoJ3kxJywgZCA9PiBkLnkxKVxuICAgICAgICAgICAgIC5hdHRyKCd4MicsIGQgPT4gZC54MilcbiAgICAgICAgICAgICAuYXR0cigneTInLCBkID0+IGQueTIpXG4gICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIGQgPT4gZC53aWR0aClcbiAgICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgZCA9PiBkLmNvbG9yKVxuICAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLW9wYWNpdHknLCB0aGlzLmRhdGEucGxvdENvbG9ycy5nZXRGaWxsT3BhY2l0eSh0aGlzLnRyYW5zcGFyZW5jeSkpO1xuICB9XG5cbiAgZHJhd1RyZW5kTGluZXMoKSB7XG4gICAgdGhpcy5zdGF0ZS51cGRhdGVMYWJlbHNXaXRoVXNlclBvc2l0aW9uZWREYXRhKHRoaXMuZGF0YS5sYWIsIHRoaXMuZGF0YS52aWV3Qm94RGltKTtcbiAgICBpZiAoKHRoaXMudGwgPT09IHVuZGVmaW5lZCkgfHwgKHRoaXMudGwgPT09IG51bGwpKSB7XG4gICAgICB0aGlzLnRsID0gbmV3IFRyZW5kTGluZSh0aGlzLmRhdGEucHRzLCB0aGlzLmRhdGEubGFiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gXy5tYXAodGhpcy50bC5nZXRVbmlxdWVHcm91cHMoKSwgKGdyb3VwKSA9PiB7XG4gICAgICAvLyBBcnJvd2hlYWQgbWFya2VyXG4gICAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoYCN0cmlhbmdsZS0ke2dyb3VwfWApLnJlbW92ZSgpO1xuICAgICAgdGhpcy5zdmcuYXBwZW5kKCdzdmc6ZGVmcycpLmFwcGVuZCgnc3ZnOm1hcmtlcicpXG4gICAgICAgICAgLmF0dHIoJ2lkJywgYHRyaWFuZ2xlLSR7Z3JvdXB9YClcbiAgICAgICAgICAuYXR0cigncmVmWCcsIDYpXG4gICAgICAgICAgLmF0dHIoJ3JlZlknLCA2KVxuICAgICAgICAgIC5hdHRyKCdtYXJrZXJXaWR0aCcsIDMwKVxuICAgICAgICAgIC5hdHRyKCdtYXJrZXJIZWlnaHQnLCAzMClcbiAgICAgICAgICAuYXR0cignb3JpZW50JywgJ2F1dG8nKVxuICAgICAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAgIC5hdHRyKCdkJywgJ00gMCAwIDEyIDYgMCAxMiAzIDYnKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIHRoaXMuZGF0YS5wbG90Q29sb3JzLmdldENvbG9yRnJvbUdyb3VwKGdyb3VwKSk7XG5cbiAgICAgIHRoaXMuc3ZnLnNlbGVjdEFsbChgLnRyZW5kbGluZS0ke2dyb3VwfWApLnJlbW92ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuc3ZnLnNlbGVjdEFsbChgLnRyZW5kbGluZS0ke2dyb3VwfWApXG4gICAgICAgIC5kYXRhKHRoaXMudGwuZ2V0TGluZUFycmF5KGdyb3VwKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgnbGluZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIGB0cmVuZGxpbmUtJHtncm91cH1gKVxuICAgICAgICAuYXR0cigneDEnLCBkID0+IGRbMF0pXG4gICAgICAgIC5hdHRyKCd5MScsIGQgPT4gZFsxXSlcbiAgICAgICAgLmF0dHIoJ3gyJywgZCA9PiBkWzJdKVxuICAgICAgICAuYXR0cigneTInLCBkID0+IGRbM10pXG4gICAgICAgIC5hdHRyKCdzdHJva2UnLCB0aGlzLmRhdGEucGxvdENvbG9ycy5nZXRDb2xvckZyb21Hcm91cChncm91cCkpXG4gICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCB0aGlzLnRyZW5kTGluZXMubGluZVRoaWNrbmVzcylcbiAgICAgICAgLmF0dHIoJ21hcmtlci1lbmQnLCAoZCwgaSkgPT4ge1xuICAgICAgICAgIC8vIERyYXcgYXJyb3doZWFkIG9uIGxhc3QgZWxlbWVudCBpbiB0cmVuZGxpbmVcbiAgICAgICAgICBpZiAoaSA9PT0gKCh0aGlzLnRsLmdldExpbmVBcnJheShncm91cCkpLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICByZXR1cm4gYHVybCgjdHJpYW5nbGUtJHtncm91cH0pYDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVjdFBsb3Q7Il19

//# sourceMappingURL=RectPlot.es6.js.map