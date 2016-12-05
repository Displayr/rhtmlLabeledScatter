// Generated by CoffeeScript 1.8.0
var RectPlot,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

RectPlot = (function() {
  function RectPlot(stateObj, stateChangedCallback, width, height, X, Y, Z, group, label, labelAlt, svg, fixedRatio, xTitle, yTitle, zTitle, title, colors, transparency, grid, origin, originAlign, titleFontFamily, titleFontSize, titleFontColor, xTitleFontFamily, xTitleFontSize, xTitleFontColor, yTitleFontFamily, yTitleFontSize, yTitleFontColor, showLabels, labelsFontFamily, labelsFontSize, labelsFontColor, labelsLogoScale, xDecimals, yDecimals, zDecimals, xPrefix, yPrefix, zPrefix, xSuffix, ySuffix, zSuffix, legendShow, legendBubblesShow, legendFontFamily, legendFontSize, legendFontColor, axisFontFamily, axisFontColor, axisFontSize, pointRadius, xBoundsMinimum, xBoundsMaximum, yBoundsMinimum, yBoundsMaximum, xBoundsUnitsMajor, yBoundsUnitsMajor, trendLines, trendLinesLineThickness, trendLinesPointSize) {
    var x, _i, _len, _ref;
    this.width = width;
    this.height = height;
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.group = group;
    this.label = label;
    this.labelAlt = labelAlt != null ? labelAlt : [];
    this.svg = svg;
    this.zTitle = zTitle != null ? zTitle : '';
    this.colors = colors;
    this.transparency = transparency;
    this.originAlign = originAlign;
    this.showLabels = showLabels != null ? showLabels : true;
    if (labelsLogoScale == null) {
      labelsLogoScale = [];
    }
    this.xDecimals = xDecimals != null ? xDecimals : null;
    this.yDecimals = yDecimals != null ? yDecimals : null;
    this.zDecimals = zDecimals != null ? zDecimals : null;
    this.xPrefix = xPrefix != null ? xPrefix : '';
    this.yPrefix = yPrefix != null ? yPrefix : '';
    this.zPrefix = zPrefix != null ? zPrefix : '';
    this.xSuffix = xSuffix != null ? xSuffix : '';
    this.ySuffix = ySuffix != null ? ySuffix : '';
    this.zSuffix = zSuffix != null ? zSuffix : '';
    this.legendShow = legendShow;
    this.legendBubblesShow = legendBubblesShow != null ? legendBubblesShow : true;
    this.legendFontFamily = legendFontFamily;
    this.legendFontSize = legendFontSize;
    this.legendFontColor = legendFontColor;
    this.axisFontFamily = axisFontFamily;
    this.axisFontColor = axisFontColor;
    this.axisFontSize = axisFontSize;
    this.pointRadius = pointRadius != null ? pointRadius : 2;
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
    this.xBoundsUnitsMajor = xBoundsUnitsMajor != null ? xBoundsUnitsMajor : null;
    this.yBoundsUnitsMajor = yBoundsUnitsMajor != null ? yBoundsUnitsMajor : null;
    if (trendLines == null) {
      trendLines = false;
    }
    if (trendLinesLineThickness == null) {
      trendLinesLineThickness = 1;
    }
    if (trendLinesPointSize == null) {
      trendLinesPointSize = 2;
    }
    this.drawTrendLines = __bind(this.drawTrendLines, this);
    this.drawLinks = __bind(this.drawLinks, this);
    this.drawLabs = __bind(this.drawLabs, this);
    this.resetPlotAfterDragEvent = __bind(this.resetPlotAfterDragEvent, this);
    this.drawDraggedMarkers = __bind(this.drawDraggedMarkers, this);
    this.drawAnc = __bind(this.drawAnc, this);
    this.drawLegend = __bind(this.drawLegend, this);
    this.drawAxisLabels = __bind(this.drawAxisLabels, this);
    this.drawDimensionMarkers = __bind(this.drawDimensionMarkers, this);
    this.drawRect = __bind(this.drawRect, this);
    this.drawTitle = __bind(this.drawTitle, this);
    this.drawLabsAndPlot = __bind(this.drawLabsAndPlot, this);
    this.draw = __bind(this.draw, this);
    this.setDim = __bind(this.setDim, this);
    this.state = new State(stateObj, stateChangedCallback);
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
      rightPadding: 0
    };
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
      fontWeight: 'bold',
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
      _ref = this.X;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        this.label.push('');
      }
      this.showLabels = false;
    }
    this.setDim(this.svg, this.width, this.height);
  }

  RectPlot.prototype.setDim = function(svg, width, height) {
    this.svg = svg;
    this.title.x = width / 2;
    this.legendDim = {
      width: 0,
      heightOfRow: this.legendFontSize + 9,
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
    return this.data = new PlotData(this.X, this.Y, this.Z, this.group, this.label, this.labelAlt, this.viewBoxDim, this.legendDim, this.colors, this.fixedRatio, this.originAlign, this.pointRadius, this.bounds, this.transparency, this.legendShow, this.legendBubblesShow, this.axisDimensionText);
  };

  RectPlot.prototype.draw = function() {
    return this.drawDimensionMarkers().then((function(_this) {
      return function() {
        return _this.drawLegend().then(function() {
          return _this.drawLabsAndPlot();
        });
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        if (err != null) {
          throw new Error(err);
        }
        console.log('rhtmlLabeledScatter: redraw');
        return _this.draw();
      };
    })(this));
  };

  RectPlot.prototype.drawLabsAndPlot = function() {
    this.data.normalizeData();
    return this.data.getPtsAndLabs().then((function(_this) {
      return function() {
        var error, pt, _i, _j, _len, _len1, _ref, _ref1;
        _this.title.x = _this.viewBoxDim.x + _this.viewBoxDim.width / 2;
        if (!_this.state.isLegendPtsSynced(_this.data.outsidePlotPtsId)) {
          _ref = _this.state.getLegendPts();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pt = _ref[_i];
            if (!_.includes(_this.data.outsidePlotPtsId, pt)) {
              _this.data.addElemToLegend(pt);
            }
          }
          _ref1 = _this.data.outsidePlotPtsId;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            pt = _ref1[_j];
            if (!_.includes(_this.state.getLegendPts(), pt)) {
              _this.state.pushLegendPt(pt);
            }
          }
          console.log("rhtmlLabeledScatter: drawLabsAndPlot false");
          throw new Error();
        }
        try {
          _this.drawTitle();
          _this.drawLabs();
          _this.drawAnc();
          if (_this.trendLines.show) {
            _this.drawTrendLines();
          }
          _this.drawDraggedMarkers();
          _this.drawRect();
          return _this.drawAxisLabels();
        } catch (_error) {
          error = _error;
          return console.log(error);
        }
      };
    })(this));
  };

  RectPlot.prototype.drawTitle = function() {
    if (this.title.text !== '') {
      this.svg.selectAll('.plot-title').remove();
      return this.svg.append('text').attr('class', 'plot-title').attr('font-family', this.title.fontFamily).attr('x', this.title.x).attr('y', this.title.y).attr('text-anchor', this.title.anchor).attr('fill', this.title.color).attr('font-size', this.title.fontSize).attr('font-weight', this.title.fontWeight).text(this.title.text);
    }
  };

  RectPlot.prototype.drawRect = function() {
    this.svg.selectAll('.plot-viewbox').remove();
    return this.svg.append('rect').attr('class', 'plot-viewbox').attr('x', this.viewBoxDim.x).attr('y', this.viewBoxDim.y).attr('width', this.viewBoxDim.width).attr('height', this.viewBoxDim.height).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', '1px');
  };

  RectPlot.prototype.drawDimensionMarkers = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var axisArrays, bb, i, initAxisTextColHeight, initAxisTextColWidth, initAxisTextRowHeight, initAxisTextRowWidth, labelType, markerLabel, markerLabels, _i, _len, _ref;
        axisArrays = AxisUtils.get().getAxisDataArrays(_this, _this.data, _this.viewBoxDim);
        if (_this.grid) {
          _this.svg.selectAll('.origin').remove();
          _this.svg.selectAll('.origin').data(axisArrays.gridOrigin).enter().append('line').attr('class', 'origin').attr('x1', function(d) {
            return d.x1;
          }).attr('y1', function(d) {
            return d.y1;
          }).attr('x2', function(d) {
            return d.x2;
          }).attr('y2', function(d) {
            return d.y2;
          }).attr('stroke-width', 0.2).attr('stroke', 'grey');
          if (_this.origin) {
            _this.svg.selectAll('.origin').style('stroke-dasharray', '4, 6').attr('stroke-width', 1).attr('stroke', 'black');
          }
          _this.svg.selectAll('.dim-marker').remove();
          _this.svg.selectAll('.dim-marker').data(axisArrays.gridLines).enter().append('line').attr('class', 'dim-marker').attr('x1', function(d) {
            return d.x1;
          }).attr('y1', function(d) {
            return d.y1;
          }).attr('x2', function(d) {
            return d.x2;
          }).attr('y2', function(d) {
            return d.y2;
          }).attr('stroke-width', 0.2).attr('stroke', 'grey');
        } else if (!_this.grid && _this.origin) {
          _this.svg.selectAll('.origin').remove();
          _this.svg.selectAll('.origin').data(axisArrays.gridOrigin).enter().append('line').attr('class', 'origin').attr('x1', function(d) {
            return d.x1;
          }).attr('y1', function(d) {
            return d.y1;
          }).attr('x2', function(d) {
            return d.x2;
          }).attr('y2', function(d) {
            return d.y2;
          }).style('stroke-dasharray', '4, 6').attr('stroke-width', 1).attr('stroke', 'black');
        }
        _this.svg.selectAll('.dim-marker-leader').remove();
        _this.svg.selectAll('.dim-marker-leader').data(axisArrays.axisLeader).enter().append('line').attr('class', 'dim-marker-leader').attr('x1', function(d) {
          return d.x1;
        }).attr('y1', function(d) {
          return d.y1;
        }).attr('x2', function(d) {
          return d.x2;
        }).attr('y2', function(d) {
          return d.y2;
        }).attr('stroke-width', 1).attr('stroke', 'black');
        _this.svg.selectAll('.dim-marker-label').remove();
        markerLabels = _this.svg.selectAll('.dim-marker-label').data(axisArrays.axisLeaderLabel).enter().append('text').attr('class', 'dim-marker-label').attr('x', function(d) {
          return d.x;
        }).attr('y', function(d) {
          return d.y;
        }).attr('font-family', _this.axisFontFamily).attr('fill', _this.axisFontColor).attr('font-size', _this.axisFontSize).text(function(d) {
          return d.label;
        }).attr('text-anchor', function(d) {
          return d.anchor;
        }).attr('type', function(d) {
          return d.type;
        });
        initAxisTextRowWidth = _this.axisDimensionText.rowMaxWidth;
        initAxisTextColWidth = _this.axisDimensionText.colMaxWidth;
        initAxisTextRowHeight = _this.axisDimensionText.rowMaxHeight;
        initAxisTextColHeight = _this.axisDimensionText.colMaxHeight;
        _ref = markerLabels[0];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          markerLabel = _ref[i];
          labelType = d3.select(markerLabel).attr('type');
          bb = markerLabel.getBBox();
          if (_this.axisDimensionText.rowMaxWidth < bb.width && labelType === 'row') {
            _this.axisDimensionText.rowMaxWidth = bb.width;
          }
          if (_this.axisDimensionText.colMaxWidth < bb.width && labelType === 'col') {
            _this.axisDimensionText.colMaxWidth = bb.width;
          }
          if (_this.axisDimensionText.rowMaxHeight < bb.height && labelType === 'row') {
            _this.axisDimensionText.rowMaxHeight = bb.height;
          }
          if (_this.axisDimensionText.colMaxHeight < bb.height && labelType === 'col') {
            _this.axisDimensionText.colMaxHeight = bb.height;
          }
          if (_this.width < bb.x + bb.width) {
            _this.axisDimensionText.rightPadding = bb.width / 2;
          }
        }
        if (initAxisTextRowWidth !== _this.axisDimensionText.rowMaxWidth || initAxisTextColWidth !== _this.axisDimensionText.colMaxWidth || initAxisTextRowHeight !== _this.axisDimensionText.rowMaxHeight || initAxisTextColHeight !== _this.axisDimensionText.colMaxHeight) {
          console.log("rhtmlLabeledScatter: drawDimensionMarkers fail");
          _this.setDim(_this.svg, _this.width, _this.height);
          reject();
        }
        return resolve();
      };
    })(this));
  };

  RectPlot.prototype.drawAxisLabels = function() {
    var axisLabels;
    axisLabels = [
      {
        x: this.viewBoxDim.x + this.viewBoxDim.width / 2,
        y: this.viewBoxDim.y + this.viewBoxDim.height + this.axisLeaderLineLength + this.axisDimensionText.colMaxHeight + this.xTitle.topPadding + this.xTitle.textHeight,
        text: this.xTitle.text,
        anchor: 'middle',
        transform: 'rotate(0)',
        display: this.xTitle === '' ? 'none' : '',
        fontFamily: this.xTitle.fontFamily,
        fontSize: this.xTitle.fontSize,
        fontColor: this.xTitle.fontColor
      }, {
        x: this.horizontalPadding + this.yTitle.textHeight,
        y: this.viewBoxDim.y + this.viewBoxDim.height / 2,
        text: this.yTitle.text,
        anchor: 'middle',
        transform: 'rotate(270,' + (this.horizontalPadding + this.yTitle.textHeight) + ', ' + (this.viewBoxDim.y + this.viewBoxDim.height / 2) + ')',
        display: this.yTitle === '' ? 'none' : '',
        fontFamily: this.yTitle.fontFamily,
        fontSize: this.yTitle.fontSize,
        fontColor: this.yTitle.fontColor
      }
    ];
    this.svg.selectAll('.axis-label').remove();
    return this.svg.selectAll('.axis-label').data(axisLabels).enter().append('text').attr('class', 'axis-label').attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', function(d) {
      return d.fontFamily;
    }).attr('font-size', function(d) {
      return d.fontSize;
    }).attr('fill', function(d) {
      return d.fontColor;
    }).attr('text-anchor', function(d) {
      return d.anchor;
    }).attr('transform', function(d) {
      return d.transform;
    }).text(function(d) {
      return d.text;
    }).style('font-weight', 'bold').style('display', function(d) {
      return d.display;
    });
  };

  RectPlot.prototype.drawLegend = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var drag, legendBubbleTitleSvg, legendFontSize;
        _this.data.setupLegendGroupsAndPts();
        if (_this.legendBubblesShow && Utils.get().isArr(_this.Z)) {
          _this.svg.selectAll('.legend-bubbles').remove();
          _this.svg.selectAll('.legend-bubbles').data(_this.data.legendBubbles).enter().append('circle').attr('class', 'legend-bubbles').attr('cx', function(d) {
            return d.cx;
          }).attr('cy', function(d) {
            return d.cy;
          }).attr('r', function(d) {
            return d.r;
          }).attr('fill', 'none').attr('stroke', 'black').attr('stroke-opacity', 0.5);
          _this.svg.selectAll('.legend-bubbles-labels').remove();
          _this.svg.selectAll('.legend-bubbles-labels').data(_this.data.legendBubbles).enter().append('text').attr('class', 'legend-bubbles-labels').attr('x', function(d) {
            return d.x;
          }).attr('y', function(d) {
            return d.y;
          }).attr('text-anchor', 'middle').attr('font-size', _this.legendFontSize).attr('font-family', _this.legendFontFamily).attr('fill', _this.legendFontColor).text(function(d) {
            return d.text;
          });
          if (_this.zTitle !== '') {
            legendFontSize = _this.legendFontSize;
            _this.svg.selectAll('.legend-bubbles-title').remove();
            legendBubbleTitleSvg = _this.svg.selectAll('.legend-bubbles-title').data(_this.data.legendBubblesTitle).enter().append('text').attr('class', 'legend-bubbles-title').attr('x', function(d) {
              return d.x;
            }).attr('y', function(d) {
              return d.y - (legendFontSize * 1.5);
            }).attr('text-anchor', 'middle').attr('font-family', _this.legendFontFamily).attr('font-weight', 'bold').attr('fill', _this.legendFontColor).text(_this.zTitle);
            SvgUtils.get().setSvgBBoxWidthAndHeight(_this.data.legendBubblesTitle, legendBubbleTitleSvg);
          }
        }
        drag = DragUtils.get().getLegendLabelDragAndDrop(_this, _this.data);
        _this.svg.selectAll('.legend-dragged-pts-text').remove();
        _this.svg.selectAll('.legend-dragged-pts-text').data(_this.data.legendPts).enter().append('text').attr('class', 'legend-dragged-pts-text').attr('id', function(d) {
          return "legend-" + d.id;
        }).attr('x', function(d) {
          return d.x;
        }).attr('y', function(d) {
          return d.y;
        }).attr('font-family', _this.legendFontFamily).attr('font-size', _this.legendFontSize).attr('text-anchor', function(d) {
          return d.anchor;
        }).attr('fill', function(d) {
          return d.color;
        }).text(function(d) {
          if (d.markerId != null) {
            return Utils.get().getSuperscript(d.markerId + 1) + d.text;
          } else {
            return d.text;
          }
        }).call(drag);
        SvgUtils.get().setSvgBBoxWidthAndHeight(_this.data.legendPts, _this.svg.selectAll('.legend-dragged-pts-text'));
        if (_this.legendShow) {
          _this.svg.selectAll('.legend-groups-text').remove();
          _this.svg.selectAll('.legend-groups-text').data(_this.data.legendGroups).enter().append('text').attr('class', 'legend-groups-text').attr('x', function(d) {
            return d.x;
          }).attr('y', function(d) {
            return d.y;
          }).attr('font-family', _this.legendFontFamily).attr('fill', _this.legendFontColor).attr('font-size', _this.legendFontSize).text(function(d) {
            return d.text;
          }).attr('text-anchor', function(d) {
            return d.anchor;
          });
          _this.svg.selectAll('.legend-groups-pts').remove();
          _this.svg.selectAll('.legend-groups-pts').data(_this.data.legendGroups).enter().append('circle').attr('class', 'legend-groups-pts').attr('cx', function(d) {
            return d.cx;
          }).attr('cy', function(d) {
            return d.cy;
          }).attr('r', function(d) {
            return d.r;
          }).attr('fill', function(d) {
            return d.color;
          }).attr('stroke', function(d) {
            return d.stroke;
          }).attr('stroke-opacity', function(d) {
            return d['stroke-opacity'];
          }).attr('fill-opacity', function(d) {
            return d.fillOpacity;
          });
          SvgUtils.get().setSvgBBoxWidthAndHeight(_this.data.legendGroups, _this.svg.selectAll('.legend-groups-text'));
        }
        if (_this.legendShow || (_this.legendBubblesShow && Utils.get().isArr(_this.Z)) || (_this.data.legendPts != null)) {
          if (_this.data.resizedAfterLegendGroupsDrawn(_this.legendShow)) {
            console.log("rhtmlLabeledScatter: drawLegend false");
            reject();
          }
        }
        return resolve();
      };
    })(this));
  };

  RectPlot.prototype.drawAnc = function() {
    var anc;
    this.svg.selectAll('.anc').remove();
    anc = this.svg.selectAll('.anc').data(this.data.pts).enter().append('circle').attr('class', 'anc').attr('id', function(d) {
      return "anc-" + d.id;
    }).attr('cx', function(d) {
      return d.x;
    }).attr('cy', function(d) {
      return d.y;
    }).attr('fill', function(d) {
      return d.color;
    }).attr('fill-opacity', function(d) {
      return d.fillOpacity;
    }).attr('r', (function(_this) {
      return function(d) {
        if (_this.trendLines.show) {
          return _this.trendLines.pointSize;
        } else {
          return d.r;
        }
      };
    })(this));
    if (Utils.get().isArr(this.Z)) {
      return anc.append('title').text((function(_this) {
        return function(d) {
          var labelTxt, xlabel, ylabel, zlabel;
          xlabel = Utils.get().getFormattedNum(d.labelX, _this.xDecimals, _this.xPrefix, _this.xSuffix);
          ylabel = Utils.get().getFormattedNum(d.labelY, _this.yDecimals, _this.yPrefix, _this.ySuffix);
          zlabel = Utils.get().getFormattedNum(d.labelZ, _this.zDecimals, _this.zPrefix, _this.zSuffix);
          labelTxt = d.label === '' ? d.labelAlt : d.label;
          return "" + labelTxt + "\n" + zlabel + "\n" + d.group + "\n[" + xlabel + ", " + ylabel + "]";
        };
      })(this));
    } else {
      return anc.append('title').text((function(_this) {
        return function(d) {
          var labelTxt, xlabel, ylabel;
          xlabel = Utils.get().getFormattedNum(d.labelX, _this.xDecimals, _this.xPrefix, _this.xSuffix);
          ylabel = Utils.get().getFormattedNum(d.labelY, _this.yDecimals, _this.yPrefix, _this.ySuffix);
          labelTxt = d.label === '' ? d.labelAlt : d.label;
          return "" + labelTxt + "\n" + d.group + "\n[" + xlabel + ", " + ylabel + "]";
        };
      })(this));
    }
  };

  RectPlot.prototype.drawDraggedMarkers = function() {
    this.svg.selectAll('.marker').remove();
    this.svg.selectAll('.marker').data(this.data.outsidePlotMarkers).enter().append('line').attr('class', 'marker').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', function(d) {
      return d.width;
    }).attr('stroke', function(d) {
      return d.color;
    });
    this.svg.selectAll('.marker-label').remove();
    return this.svg.selectAll('.marker-label').data(this.data.outsidePlotMarkers).enter().append('text').attr('class', 'marker-label').attr('x', function(d) {
      return d.markerTextX;
    }).attr('y', function(d) {
      return d.markerTextY;
    }).attr('font-family', 'Arial').attr('text-anchor', 'start').attr('font-size', this.data.legendDim.markerTextSize).attr('fill', function(d) {
      return d.color;
    }).text(function(d) {
      return d.markerLabel;
    });
  };

  RectPlot.prototype.resetPlotAfterDragEvent = function() {
    var elem, plotElems, _i, _len;
    plotElems = ['.plot-viewbox', '.origin', '.dim-marker', '.dim-marker-leader', '.dim-marker-label', '.axis-label', '.legend-pts', '.legend-text', '.anc', '.lab', '.link'];
    for (_i = 0, _len = plotElems.length; _i < _len; _i++) {
      elem = plotElems[_i];
      this.svg.selectAll(elem).remove();
    }
    return this.draw();
  };

  RectPlot.prototype.drawLabs = function() {
    var arrowheadLabs, drag, labeler, labels_img_svg, labels_svg;
    if (this.showLabels && !this.trendLines.show) {
      drag = DragUtils.get().getLabelDragAndDrop(this);
      this.state.updateLabelsWithUserPositionedData(this.data.lab, this.data.viewBoxDim);
      this.svg.selectAll('.lab-img').remove();
      this.svg.selectAll('.lab-img').data(this.data.lab).enter().append('svg:image').attr('class', 'lab-img').attr('xlink:href', function(d) {
        return d.url;
      }).attr('id', function(d) {
        if (d.url !== '') {
          return d.id;
        }
      }).attr('x', function(d) {
        return d.x - d.width / 2;
      }).attr('y', function(d) {
        return d.y - d.height;
      }).attr('width', function(d) {
        return d.width;
      }).attr('height', function(d) {
        return d.height;
      }).call(drag);
      this.svg.selectAll('.lab').remove();
      this.svg.selectAll('.lab').data(this.data.lab).enter().append('text').attr('class', 'lab').attr('id', function(d) {
        if (d.url === '') {
          return d.id;
        }
      }).attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y;
      }).attr('font-family', function(d) {
        return d.fontFamily;
      }).text(function(d) {
        if (d.url === '') {
          return d.text;
        }
      }).attr('text-anchor', 'middle').attr('fill', function(d) {
        return d.color;
      }).attr('font-size', function(d) {
        return d.fontSize;
      }).call(drag);
      labels_svg = this.svg.selectAll('.lab');
      labels_img_svg = this.svg.selectAll('.lab-img');
      SvgUtils.get().setSvgBBoxWidthAndHeight(this.data.lab, labels_svg);
      console.log("rhtmlLabeledScatter: Running label placement algorithm...");
      labeler = d3.labeler().svg(this.svg).w1(this.viewBoxDim.x).w2(this.viewBoxDim.x + this.viewBoxDim.width).h1(this.viewBoxDim.y).h2(this.viewBoxDim.y + this.viewBoxDim.height).anchor(this.data.pts).label(this.data.lab).pinned(this.state.getUserPositionedLabIds()).start(500);
      labels_svg.transition().duration(800).attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y;
      });
      labels_img_svg.transition().duration(800).attr('x', function(d) {
        return d.x - d.width / 2;
      }).attr('y', function(d) {
        return d.y - d.height;
      });
      return this.drawLinks();
    } else if (this.showLabels && this.trendLines.show) {
      if (this.tl === void 0 || this.tl === null) {
        this.tl = new TrendLine(this.data.pts, this.data.lab);
      }
      arrowheadLabs = this.tl.getArrowheadLabels();
      this.svg.selectAll('.lab-img').remove();
      this.svg.selectAll('.lab-img').data(arrowheadLabs).enter().append('svg:image').attr('class', 'lab-img').attr('xlink:href', function(d) {
        return d.url;
      }).attr('id', function(d) {
        if (d.url !== '') {
          return d.id;
        }
      }).attr('x', function(d) {
        return d.x - d.width / 2;
      }).attr('y', function(d) {
        return d.y - d.height;
      }).attr('width', function(d) {
        return d.width;
      }).attr('height', function(d) {
        return d.height;
      });
      this.svg.selectAll('.lab').remove();
      this.svg.selectAll('.lab').data(arrowheadLabs).enter().append('text').attr('class', 'lab').attr('id', function(d) {
        if (d.url === '') {
          return d.id;
        }
      }).attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y;
      }).attr('font-family', function(d) {
        return d.fontFamily;
      }).text(function(d) {
        if (d.url === '') {
          return d.text;
        }
      }).attr('text-anchor', 'middle').attr('fill', function(d) {
        return d.color;
      }).attr('font-size', function(d) {
        return d.fontSize;
      });
      labels_svg = this.svg.selectAll('.lab');
      labels_img_svg = this.svg.selectAll('.lab-img');
      SvgUtils.get().setSvgBBoxWidthAndHeight(arrowheadLabs, labels_svg);
      labeler = d3.labeler().svg(this.svg).w1(this.viewBoxDim.x).w2(this.viewBoxDim.x + this.viewBoxDim.width).h1(this.viewBoxDim.y).h2(this.viewBoxDim.y + this.viewBoxDim.height).anchor(this.tl.getArrowheadPts()).label(arrowheadLabs).start(500);
      labels_svg.transition().duration(800).attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y;
      });
      return labels_img_svg.transition().duration(800).attr('x', function(d) {
        return d.x - d.width / 2;
      }).attr('y', function(d) {
        return d.y - d.height;
      });
    }
  };

  RectPlot.prototype.drawLinks = function() {
    var links;
    links = new Links(this.data.pts, this.data.lab);
    this.svg.selectAll('.link').remove();
    return this.svg.selectAll('.link').data(links.getLinkData()).enter().append('line').attr('class', 'link').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', function(d) {
      return d.width;
    }).attr('stroke', function(d) {
      return d.color;
    }).style('stroke-opacity', this.data.plotColors.getFillOpacity(this.transparency));
  };

  RectPlot.prototype.drawTrendLines = function() {
    if (this.tl === void 0 || this.tl === null) {
      this.tl = new TrendLine(this.data.pts, this.data.label);
    }
    return _.map(this.tl.getUniqueGroups(), (function(_this) {
      return function(group) {
        _this.svg.append('svg:defs').append('svg:marker').attr('id', "triangle-" + group).attr('refX', 6).attr('refY', 6).attr('markerWidth', 30).attr('markerHeight', 30).attr('orient', 'auto').append('path').attr('d', 'M 0 0 12 6 0 12 3 6').style('fill', _this.data.plotColors.getColorFromGroup(group));
        return _this.svg.selectAll(".trendline-" + group).data(_this.tl.getLineArray(group)).enter().append('line').attr('class', "trendline-" + group).attr('x1', function(d) {
          return d[0];
        }).attr('y1', function(d) {
          return d[1];
        }).attr('x2', function(d) {
          return d[2];
        }).attr('y2', function(d) {
          return d[3];
        }).attr('stroke', _this.data.plotColors.getColorFromGroup(group)).attr('stroke-width', _this.trendLines.lineThickness).attr('marker-end', function(d, i) {
          if (i === (_this.tl.getLineArray(group)).length - 1) {
            return "url(#triangle-" + group + ")";
          }
        });
      };
    })(this));
  };

  return RectPlot;

})();
