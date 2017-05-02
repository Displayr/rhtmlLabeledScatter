(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PlotData = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// To Refactor:
//   * fixed aspect ratio code can (probably) be simplified : see Pictograph utils/geometryUtils.js
//


var PlotData = function () {
  function PlotData(X, Y, Z, group, label, labelAlt, viewBoxDim, legendDim, colorWheel, fixedAspectRatio, originAlign, pointRadius, bounds, transparency, legendShow, legendBubblesShow, axisDimensionText) {
    _classCallCheck(this, PlotData);

    this.revertMinMax = this.revertMinMax.bind(this);
    this.calculateMinMax = this.calculateMinMax.bind(this);
    this.normalizeData = this.normalizeData.bind(this);
    this.normalizeZData = this.normalizeZData.bind(this);
    this.getPtsAndLabs = this.getPtsAndLabs.bind(this);
    this.setLegendItemsPositions = this.setLegendItemsPositions.bind(this);
    this.setupLegendGroupsAndPts = this.setupLegendGroupsAndPts.bind(this);
    this.resizedAfterLegendGroupsDrawn = this.resizedAfterLegendGroupsDrawn.bind(this);
    this.isOutsideViewBox = this.isOutsideViewBox.bind(this);
    this.isLegendPtOutsideViewBox = this.isLegendPtOutsideViewBox.bind(this);
    this.addElemToLegend = this.addElemToLegend.bind(this);
    this.removeElemFromLegend = this.removeElemFromLegend.bind(this);
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.group = group;
    this.label = label;
    this.labelAlt = labelAlt;
    this.viewBoxDim = viewBoxDim;
    this.legendDim = legendDim;
    this.colorWheel = colorWheel;
    this.fixedAspectRatio = fixedAspectRatio;
    this.originAlign = originAlign;
    this.pointRadius = pointRadius;
    this.bounds = bounds;
    this.transparency = transparency;
    this.legendShow = legendShow;
    this.legendBubblesShow = legendBubblesShow;
    this.axisDimensionText = axisDimensionText;
    this.origX = this.X.slice(0);
    this.origY = this.Y.slice(0);
    this.normX = this.X.slice(0);
    this.normY = this.Y.slice(0);
    if (Utils.isArrOfNums(this.Z) && this.Z.length === this.X.length) {
      this.normZ = this.Z.slice();
    }
    this.outsidePlotPtsId = [];
    this.legendPts = [];
    this.outsidePlotCondensedPts = [];
    this.legendBubbles = [];
    this.legendBubblesLab = [];
    this.legendRequiresRedraw = false;

    if (this.X.length === this.Y.length) {
      this.len = this.origLen = X.length;
      this.normalizeData();
      if (Utils.isArrOfNums(this.Z)) {
        this.normalizeZData();
      }
      this.plotColors = new PlotColors(this);
      this.labelNew = new PlotLabel(this.label, this.labelAlt, this.viewBoxDim.labelLogoScale);
    } else {
      throw new Error('Inputs X and Y lengths do not match!');
    }
  }

  PlotData.prototype.revertMinMax = function revertMinMax() {
    this.minX = this.minXold;
    this.maxX = this.maxXold;
    this.minY = this.minYold;
    return this.maxY = this.maxYold;
  };

  PlotData.prototype.calculateMinMax = function calculateMinMax() {
    this.minXold = this.minX;
    this.maxXold = this.maxX;
    this.minYold = this.minY;
    this.maxYold = this.maxY;

    var ptsOut = this.outsidePlotPtsId;
    var notMovedX = _.filter(this.origX, function (val, key) {
      return !(_.indexOf(ptsOut, key) !== -1);
    });
    var notMovedY = _.filter(this.origY, function (val, key) {
      return !(_.indexOf(ptsOut, key) !== -1);
    });

    this.minX = _.min(notMovedX);
    this.maxX = _.max(notMovedX);
    this.minY = _.min(notMovedY);
    this.maxY = _.max(notMovedY);

    // threshold used so pts are not right on border of plot
    var rangeX = this.maxX - this.minX;
    var rangeY = this.maxY - this.minY;
    var thres = 0.08;
    var xThres = thres * rangeX;
    var yThres = thres * rangeY;
    if (xThres === 0) {
      // if there is no difference, add arbitrary threshold of 1
      xThres = 1;
    }
    if (yThres === 0) {
      // if there is no difference, add arbitrary threshold of 1
      yThres = 1;
    }

    // Note: Thresholding increase the space around the points which is why we add to the max and min
    this.maxX += xThres;
    this.minX -= xThres;
    this.maxY += yThres;
    this.minY -= yThres;

    // originAlign: compensates to make sure origin lines are on axis
    if (this.originAlign) {
      this.maxX = this.maxX < 0 ? 0 : this.maxX + xThres; // so axis can be on origin
      this.minX = this.minX > 0 ? 0 : this.minX - xThres;
      this.maxY = this.maxY < 0 ? 0 : this.maxY + yThres;
      this.minY = this.minY > 0 ? 0 : this.minY - yThres;
    }

    // TODO KZ (another) this can be simplified : see Pictograph utils/geometryUtils.js
    if (this.fixedAspectRatio) {
      rangeX = this.maxX - this.minX;
      rangeY = this.maxY - this.minY;
      var rangeAR = Math.abs(rangeX / rangeY);
      var widgetAR = this.viewBoxDim.width / this.viewBoxDim.height;
      var rangeToWidgetARRatio = widgetAR / rangeAR;

      if (widgetAR >= 1) {
        if (rangeX > rangeY) {
          if (rangeToWidgetARRatio > 1) {
            this.maxX += (widgetAR * rangeY - rangeX) / 2;
            this.minX -= (widgetAR * rangeY - rangeX) / 2;
          } else {
            this.maxY += (1 / widgetAR * rangeX - rangeY) / 2;
            this.minY -= (1 / widgetAR * rangeX - rangeY) / 2;
          }
        } else if (rangeX < rangeY) {
          this.maxX += (widgetAR * rangeY - rangeX) / 2;
          this.minX -= (widgetAR * rangeY - rangeX) / 2;
        }
      } else if (rangeX < rangeY) {
        if (rangeToWidgetARRatio < 1) {
          this.maxY += (1 / widgetAR * rangeX - rangeY) / 2;
          this.minY -= (1 / widgetAR * rangeX - rangeY) / 2;
        } else {
          this.maxX += (widgetAR * rangeY - rangeX) / 2;
          this.minX -= (widgetAR * rangeY - rangeX) / 2;
        }
      } else if (rangeX > rangeY) {
        this.maxY += (1 / widgetAR * rangeX - rangeY) / 2;
        this.minY -= (1 / widgetAR * rangeX - rangeY) / 2;
      }
    }

    // TODO KZ this should be done first to skip the wasted computation (unless there are side effect in the above) ??
    // If user has sent x and y boundaries, these hold higher priority
    if (Utils.isNum(this.bounds.xmax)) {
      this.maxX = this.bounds.xmax;
    }
    if (Utils.isNum(this.bounds.xmin)) {
      this.minX = this.bounds.xmin;
    }
    if (Utils.isNum(this.bounds.ymax)) {
      this.maxY = this.bounds.ymax;
    }
    if (Utils.isNum(this.bounds.ymin)) {
      return this.minY = this.bounds.ymin;
    }
  };

  PlotData.prototype.normalizeData = function normalizeData() {
    var _this = this;

    // TODO KZ remove this side effect. Plus Data.calcMinMax is called over and over in the code. Why ??
    var i = void 0;
    this.calculateMinMax();

    // create list of movedOffPts that need markers
    this.outsidePlotMarkers = [];
    this.outsidePlotMarkersIter = 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Array.from(this.legendPts)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var lp = _step.value;
        var id = lp.pt.id;

        var draggedNormX = (this.X[id] - this.minX) / (this.maxX - this.minX);
        var draggedNormY = (this.Y[id] - this.minY) / (this.maxY - this.minY);
        // TODO KZ the ++ should be immed. after the use of the iter !
        var newMarkerId = this.outsidePlotMarkersIter;
        lp.markerId = newMarkerId;

        if (Math.abs(draggedNormX) > 1 || Math.abs(draggedNormY) > 1 || draggedNormX < 0 || draggedNormY < 0) {
          var markerTextY, x1, y1;
          draggedNormX = draggedNormX > 1 ? 1 : draggedNormX;
          draggedNormX = draggedNormX < 0 ? 0 : draggedNormX;
          draggedNormY = draggedNormY > 1 ? 1 : draggedNormY;
          draggedNormY = draggedNormY < 0 ? 0 : draggedNormY;
          var x2 = draggedNormX * this.viewBoxDim.width + this.viewBoxDim.x;
          var y2 = (1 - draggedNormY) * this.viewBoxDim.height + this.viewBoxDim.y;

          var markerTextX = markerTextY = 0;
          var numDigitsInId = Math.ceil(Math.log(newMarkerId + 1.1) / Math.LN10);
          if (draggedNormX === 1) {
            // right bound
            x1 = x2 + this.legendDim.markerLen;
            y1 = y2;
            markerTextX = x1;
            markerTextY = y1 + this.legendDim.markerTextSize / 2;
          } else if (draggedNormX === 0) {
            // left bound
            x1 = x2 - this.legendDim.markerLen;
            y1 = y2;
            markerTextX = x1 - this.legendDim.markerCharWidth * (numDigitsInId + 1);
            markerTextY = y1 + this.legendDim.markerTextSize / 2;
          } else if (draggedNormY === 1) {
            // top bound
            x1 = x2;
            y1 = y2 + -draggedNormY * this.legendDim.markerLen;
            markerTextX = x1 - this.legendDim.markerCharWidth * numDigitsInId;
            markerTextY = y1;
          } else if (draggedNormY === 0) {
            // bot bound
            x1 = x2;
            y1 = y2 + this.legendDim.markerLen;
            markerTextX = x1 - this.legendDim.markerCharWidth * numDigitsInId;
            markerTextY = y1 + this.legendDim.markerTextSize;
          }

          // TODO KZ bug? : newMarkerId + 1, but lp.markerId = newMarker ??
          this.outsidePlotMarkers.push({
            markerLabel: newMarkerId + 1,
            ptId: id,
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            markerTextX: markerTextX,
            markerTextY: markerTextY,
            width: this.legendDim.markerWidth,
            color: lp.color
          });

          // if the points were condensed, remove point
          this.outsidePlotCondensedPts = _.filter(this.outsidePlotCondensedPts, function (e) {
            return e.dataId !== id;
          });
          this.len = this.origLen - this.outsidePlotMarkers.length;
        } else {
          // no marker required, but still inside plot window
          console.log('rhtmlLabeledScatter: Condensed point added');
          var condensedPtsDataIdArray = _.map(this.outsidePlotCondensedPts, function (e) {
            return e.dataId;
          });
          if (!(_.indexOf(condensedPtsDataIdArray, id) !== -1)) {
            this.outsidePlotCondensedPts.push({
              dataId: id,
              markerId: newMarkerId
            });
          }
        }
        this.outsidePlotMarkersIter++;
      }

      // Remove pts that are outside plot if user bounds were set
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

    this.outsideBoundsPtsId = [];
    if (_.some(this.bounds, function (b) {
      return Utils.isNum(b);
    })) {
      i = 0;
      while (i < this.origLen) {
        if (!(_.indexOf(this.outsideBoundsPtsId, i) !== -1)) {
          if (this.X[i] < this.minX || this.X[i] > this.maxX || this.Y[i] < this.minY || this.Y[i] > this.maxY) {
            this.outsideBoundsPtsId.push(i);
          }
        }
        i++;
      }
    }

    i = 0;
    return function () {
      var result = [];
      while (i < _this.origLen) {
        _this.normX[i] = _this.minX === _this.maxX ? _this.minX : (_this.X[i] - _this.minX) / (_this.maxX - _this.minX);
        // copy/paste bug using x when calculating Y. WTF is this even doing ?
        _this.normY[i] = _this.minY === _this.maxY ? _this.minX : (_this.Y[i] - _this.minY) / (_this.maxY - _this.minY);
        result.push(i++);
      }
      return result;
    }();
  };

  PlotData.prototype.normalizeZData = function normalizeZData() {
    var legendUtils = LegendUtils;

    var maxZ = _.max(this.Z);
    legendUtils.calcZQuartiles(this, maxZ);
    return legendUtils.normalizeZValues(this, maxZ);
  };

  PlotData.prototype.getPtsAndLabs = function getPtsAndLabs(calleeName) {
    var _this2 = this;

    console.log('getPtsAndLabs(' + calleeName + ')');
    return Promise.all(this.labelNew.getLabels()).then(function (resolvedLabels) {
      //      console.log("resolvedLabels for getPtsandLabs callee name #{calleeName}")
      //      console.log(resolvedLabels)

      _this2.pts = [];
      _this2.lab = [];

      var i = 0;
      while (i < _this2.origLen) {
        if (!(_.indexOf(_this2.outsidePlotPtsId, i) !== -1) || _.indexOf(_.map(_this2.outsidePlotCondensedPts, function (e) {
          return e.dataId;
        }), i) !== -1) {
          var ptColor;
          var x = _this2.normX[i] * _this2.viewBoxDim.width + _this2.viewBoxDim.x;
          var y = (1 - _this2.normY[i]) * _this2.viewBoxDim.height + _this2.viewBoxDim.y;
          var r = _this2.pointRadius;
          if (Utils.isArrOfNums(_this2.Z)) {
            var legendUtils = LegendUtils;
            r = legendUtils.normalizedZtoRadius(_this2.viewBoxDim, _this2.normZ[i]);
          }
          var fillOpacity = _this2.plotColors.getFillOpacity(_this2.transparency);

          var label = resolvedLabels[i].label;

          var labelAlt = (_this2.labelAlt != null ? _this2.labelAlt[i] : undefined) != null ? _this2.labelAlt[i] : '';
          var width = resolvedLabels[i].width;
          var height = resolvedLabels[i].height;
          var url = resolvedLabels[i].url;


          var labelZ = Utils.isArrOfNums(_this2.Z) ? _this2.Z[i].toString() : '';
          var fontSize = _this2.viewBoxDim.labelFontSize;

          // If pt hsa been already condensed
          if (_.indexOf(_.map(_this2.outsidePlotCondensedPts, function (e) {
            return e.dataId;
          }), i) !== -1) {
            var pt = _.find(_this2.outsidePlotCondensedPts, function (e) {
              return e.dataId === i;
            });
            label = pt.markerId + 1;
            fontSize = _this2.viewBoxDim.labelSmallFontSize;
            url = '';
            width = null;
            height = null;
          }

          var fontColor = ptColor = _this2.plotColors.getColor(i);
          if (_this2.viewBoxDim.labelFontColor != null && !(_this2.viewBoxDim.labelFontColor === '')) {
            fontColor = _this2.viewBoxDim.labelFontColor;
          }
          var group = _this2.group != null ? _this2.group[i] : '';
          _this2.pts.push({
            x: x,
            y: y,
            r: r,
            label: label,
            labelAlt: labelAlt,
            labelX: _this2.origX[i].toPrecision(3).toString(),
            labelY: _this2.origY[i].toPrecision(3).toString(),
            labelZ: labelZ,
            group: group,
            color: ptColor,
            id: i,
            fillOpacity: fillOpacity
          });
          _this2.lab.push({
            x: x,
            y: y,
            color: fontColor,
            id: i,
            fontSize: fontSize,
            fontFamily: _this2.viewBoxDim.labelFontFamily,
            text: label,
            width: width,
            height: height,
            url: url
          });
        }
        i++;
      }

      // Remove pts outside plot because user bounds set
      return function () {
        var result = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Array.from(_this2.outsideBoundsPtsId)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var p = _step2.value;

            var item = void 0;
            if (!(_.indexOf(_this2.outsidePlotPtsId, p) !== -1)) {
              item = _this2.addElemToLegend(p);
            }
            result.push(item);
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

        return result;
      }();
    }).catch(function (err) {
      return console.log(err);
    });
  };

  // TODO KZ rename to numColumns once meaning is confirmed
  // TODO KZ If I have an array, I dont need to be told its length


  PlotData.prototype.setLegendItemsPositions = function setLegendItemsPositions(numItems, itemsArray, cols) {
    var _this3 = this;

    var bubbleLegendTextHeight = 20;
    this.legendHeight = this.viewBoxDim.height;
    if (this.legendBubblesTitle != null && this.legendBubblesShow) {
      this.legendHeight = this.legendBubblesTitle[0].y - bubbleLegendTextHeight - this.viewBoxDim.y;
    }

    if (this.Zquartiles != null) {
      var legendUtils = LegendUtils;
      legendUtils.setupBubbles(this);
    }

    var startOfCenteredLegendItems = this.viewBoxDim.y + this.legendHeight / 2 - this.legendDim.heightOfRow * (numItems / cols) / 2 + this.legendDim.ptRadius;
    var startOfViewBox = this.viewBoxDim.y + this.legendDim.ptRadius;
    var legendStartY = Math.max(startOfCenteredLegendItems, startOfViewBox);

    var colSpacing = 0;
    var numItemsInPrevCols = 0;

    var i = 0;
    var currentCol = 1;
    return function () {
      var result = [];
      while (i < numItems) {
        if (cols > 1) {
          var numElemsInCol = numItems / cols;
          var exceededCurrentCol = legendStartY + (i - numItemsInPrevCols) * _this3.legendDim.heightOfRow > _this3.viewBoxDim.y + _this3.legendHeight;
          var plottedEvenBalanceOfItemsBtwnCols = i >= numElemsInCol * currentCol;
          if (exceededCurrentCol || plottedEvenBalanceOfItemsBtwnCols) {
            colSpacing = (_this3.legendDim.colSpace + _this3.legendDim.ptRadius * 2 + _this3.legendDim.ptToTextSpace) * currentCol;
            numItemsInPrevCols = i;
            currentCol++;
          }

          var totalItemsSpacingExceedLegendArea = legendStartY + (i - numItemsInPrevCols) * _this3.legendDim.heightOfRow > _this3.viewBoxDim.y + _this3.legendHeight;
          if (totalItemsSpacingExceedLegendArea) {
            break;
          }
        }

        var li = itemsArray[i];
        if (li.isDraggedPt) {
          li.x = _this3.legendDim.x + _this3.legendDim.leftPadding + colSpacing;
          li.y = legendStartY + (i - numItemsInPrevCols) * _this3.legendDim.heightOfRow + _this3.legendDim.vertPtPadding;
        } else {
          li.cx = _this3.legendDim.x + _this3.legendDim.leftPadding + colSpacing + li.r;
          li.cy = legendStartY + (i - numItemsInPrevCols) * _this3.legendDim.heightOfRow;
          li.x = li.cx + _this3.legendDim.ptToTextSpace;
          li.y = li.cy + li.r;
        }
        result.push(i++);
      }
      return result;
    }();
  };

  PlotData.prototype.setupLegendGroupsAndPts = function setupLegendGroupsAndPts() {
    if (this.legendPts.length > 0 && this.legendShow === true) {
      var totalLegendItems = this.legendGroups.length + this.legendPts.length;
      var legendItemArray = [];
      var i = 0;
      var j = 0;

      // KZ TODO possibly the worst array concat ive ever seen
      while (i < totalLegendItems) {
        if (i < this.legendGroups.length) {
          legendItemArray.push(this.legendGroups[i]);
        } else {
          j = i - this.legendGroups.length;
          legendItemArray.push(this.legendPts[j]);
        }
        i++;
      }

      return this.setLegendItemsPositions(totalLegendItems, legendItemArray, this.legendDim.cols);
    } else if (this.legendPts.length > 0 && this.legendShow === false) {
      return this.setLegendItemsPositions(this.legendPts.length, this.legendPts, this.legendDim.cols);
    } else {
      return this.setLegendItemsPositions(this.legendGroups.length, this.legendGroups, this.legendDim.cols);
    }
  };

  PlotData.prototype.resizedAfterLegendGroupsDrawn = function resizedAfterLegendGroupsDrawn() {
    var initWidth = this.viewBoxDim.width;

    var totalLegendItems = this.legendShow ? this.legendGroups.length + this.legendPts.length : this.legendPts.length;
    var legendGrpsTextMax = this.legendGroups.length > 0 && this.legendShow ? _.maxBy(this.legendGroups, function (e) {
      return e.width;
    }).width : 0;
    var legendPtsTextMax = this.legendPts.length > 0 ? _.maxBy(this.legendPts, function (e) {
      return e.width;
    }).width : 0;

    var maxTextWidth = _.max([legendGrpsTextMax, legendPtsTextMax]);

    var spacingAroundMaxTextWidth = this.legendDim.leftPadding + this.legendDim.ptRadius * 2 + this.legendDim.rightPadding + this.legendDim.ptToTextSpace;

    var bubbleLeftRightPadding = this.legendDim.leftPadding + this.legendDim.rightPadding;

    this.legendDim.cols = Math.ceil(totalLegendItems * this.legendDim.heightOfRow / this.legendHeight);
    this.legendDim.width = maxTextWidth * this.legendDim.cols + spacingAroundMaxTextWidth + this.legendDim.centerPadding * (this.legendDim.cols - 1);

    var bubbleTitleWidth = this.legendBubblesTitle != null ? this.legendBubblesTitle[0].width : undefined;
    this.legendDim.width = _.max([this.legendDim.width, bubbleTitleWidth + bubbleLeftRightPadding, this.legendBubblesMaxWidth + bubbleLeftRightPadding]);

    this.legendDim.colSpace = maxTextWidth;

    this.viewBoxDim.width = this.viewBoxDim.svgWidth - this.legendDim.width - this.viewBoxDim.x - this.axisDimensionText.rowMaxWidth;
    this.legendDim.x = this.viewBoxDim.x + this.viewBoxDim.width;

    return initWidth !== this.viewBoxDim.width;
  };

  PlotData.prototype.isOutsideViewBox = function isOutsideViewBox(lab) {
    var left = lab.x - lab.width / 2;
    var right = lab.x + lab.width / 2;
    var top = lab.y - lab.height;
    var bot = lab.y;

    if (left < this.viewBoxDim.x || right > this.viewBoxDim.x + this.viewBoxDim.width || top < this.viewBoxDim.y || bot > this.viewBoxDim.y + this.viewBoxDim.height) {
      return true;
    }
    return false;
  };

  PlotData.prototype.isLegendPtOutsideViewBox = function isLegendPtOutsideViewBox(lab) {
    var left = lab.x;
    var right = lab.x + lab.width;
    var top = lab.y - lab.height;
    var bot = lab.y;

    if (left < this.viewBoxDim.x || right > this.viewBoxDim.x + this.viewBoxDim.width || top < this.viewBoxDim.y || bot > this.viewBoxDim.y + this.viewBoxDim.height) {
      return true;
    }
    return false;
  };

  PlotData.prototype.addElemToLegend = function addElemToLegend(id) {
    var checkId = function checkId(e) {
      return e.id === id;
    };
    var movedPt = _.remove(this.pts, checkId);
    var movedLab = _.remove(this.lab, checkId);
    this.legendPts.push({
      id: id,
      pt: movedPt[0],
      lab: movedLab[0],
      anchor: 'start',
      text: movedLab[0].text + ' (' + movedPt[0].labelX + ', ' + movedPt[0].labelY + ')',
      color: movedPt[0].color,
      isDraggedPt: true
    });
    //    console.log("pushed legendPt : #{JSON.stringify(@legendPts[@legendPts.length-1])}")

    this.outsidePlotPtsId.push(id);
    this.normalizeData();
    this.getPtsAndLabs('PlotData.addElemToLegend');
    this.setupLegendGroupsAndPts();
    return this.legendRequiresRedraw = true;
  };

  PlotData.prototype.removeElemFromLegend = function removeElemFromLegend(id) {
    var checkId = function checkId(e) {
      return e.id === id;
    };
    var legendPt = _.remove(this.legendPts, checkId);
    this.pts.push(legendPt.pt);
    this.lab.push(legendPt.lab);

    _.remove(this.outsidePlotPtsId, function (i) {
      return i === id;
    });
    _.remove(this.outsidePlotCondensedPts, function (i) {
      return i.dataId === id;
    });

    this.normalizeData();
    this.getPtsAndLabs('PlotData.removeElemFromLegend');
    return this.setupLegendGroupsAndPts();
  };

  return PlotData;
}();

module.exports = PlotData;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9QbG90RGF0YS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7QUFDQTtBQUNBOzs7SUFHTSxRO0FBQ0osb0JBQVksQ0FBWixFQUNFLENBREYsRUFFRSxDQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxRQUxGLEVBTUUsVUFORixFQU9FLFNBUEYsRUFRRSxVQVJGLEVBU0UsZ0JBVEYsRUFVRSxXQVZGLEVBV0UsV0FYRixFQVlFLE1BWkYsRUFhRSxZQWJGLEVBY0UsVUFkRixFQWVFLGlCQWZGLEVBZ0JFLGlCQWhCRixFQWdCcUI7QUFBQTs7QUFDbkIsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUFwQjtBQUNBLFNBQUssZUFBTCxHQUF1QixLQUFLLGVBQUwsQ0FBcUIsSUFBckIsQ0FBMEIsSUFBMUIsQ0FBdkI7QUFDQSxTQUFLLGFBQUwsR0FBcUIsS0FBSyxhQUFMLENBQW1CLElBQW5CLENBQXdCLElBQXhCLENBQXJCO0FBQ0EsU0FBSyxjQUFMLEdBQXNCLEtBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixJQUF6QixDQUF0QjtBQUNBLFNBQUssYUFBTCxHQUFxQixLQUFLLGFBQUwsQ0FBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBckI7QUFDQSxTQUFLLHVCQUFMLEdBQStCLEtBQUssdUJBQUwsQ0FBNkIsSUFBN0IsQ0FBa0MsSUFBbEMsQ0FBL0I7QUFDQSxTQUFLLHVCQUFMLEdBQStCLEtBQUssdUJBQUwsQ0FBNkIsSUFBN0IsQ0FBa0MsSUFBbEMsQ0FBL0I7QUFDQSxTQUFLLDZCQUFMLEdBQXFDLEtBQUssNkJBQUwsQ0FBbUMsSUFBbkMsQ0FBd0MsSUFBeEMsQ0FBckM7QUFDQSxTQUFLLGdCQUFMLEdBQXdCLEtBQUssZ0JBQUwsQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBM0Is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LFFBQVEsQ0FBUixFQUFXLEtBTkE7QUFPbEIsbUJBQWE7QUFQSyxLQUFwQjtBQVNKOztBQUVJLFNBQUssZ0JBQUwsQ0FBc0IsSUFBdEIsQ0FBMkIsRUFBM0I7QUFDQSxTQUFLLGFBQUw7QUFDQSxTQUFLLGFBQUwsQ0FBbUIsMEJBQW5CO0FBQ0EsU0FBSyx1QkFBTDtBQUNBLFdBQU8sS0FBSyxvQkFBTCxHQUE0QixJQUFuQztBQUNELEc7O3FCQUVELG9CLGlDQUFxQixFLEVBQUk7QUFDdkIsUUFBTSxVQUFVLFNBQVYsT0FBVTtBQUFBLGFBQUssRUFBRSxFQUFGLEtBQVMsRUFBZDtBQUFBLEtBQWhCO0FBQ0EsUUFBTSxXQUFXLEVBQUUsTUFBRixDQUFTLEtBQUssU0FBZCxFQUF5QixPQUF6QixDQUFqQjtBQUNBLFNBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxTQUFTLEVBQXZCO0FBQ0EsU0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFNBQVMsR0FBdkI7O0FBRUEsTUFBRSxNQUFGLENBQVMsS0FBSyxnQkFBZCxFQUFnQztBQUFBLGFBQUssTUFBTSxFQUFYO0FBQUEsS0FBaEM7QUFDQSxNQUFFLE1BQUYsQ0FBUyxLQUFLLHVCQUFkLEVBQXVDO0FBQUEsYUFBSyxFQUFFLE1BQUYsS0FBYSxFQUFsQjtBQUFBLEtBQXZDOztBQUVBLFNBQUssYUFBTDtBQUNBLFNBQUssYUFBTCxDQUFtQiwrQkFBbkI7QUFDQSxXQUFPLEtBQUssdUJBQUwsRUFBUDtBQUNELEc7Ozs7O0FBR0gsT0FBTyxPQUFQLEdBQWlCLFFBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFRvIFJlZmFjdG9yOlxuLy8gICAqIGZpeGVkIGFzcGVjdCByYXRpbyBjb2RlIGNhbiAocHJvYmFibHkpIGJlIHNpbXBsaWZpZWQgOiBzZWUgUGljdG9ncmFwaCB1dGlscy9nZW9tZXRyeVV0aWxzLmpzXG4vL1xuXG5cbmNsYXNzIFBsb3REYXRhIHtcbiAgY29uc3RydWN0b3IoWCxcbiAgICBZLFxuICAgIFosXG4gICAgZ3JvdXAsXG4gICAgbGFiZWwsXG4gICAgbGFiZWxBbHQsXG4gICAgdmlld0JveERpbSxcbiAgICBsZWdlbmREaW0sXG4gICAgY29sb3JXaGVlbCxcbiAgICBmaXhlZEFzcGVjdFJhdGlvLFxuICAgIG9yaWdpbkFsaWduLFxuICAgIHBvaW50UmFkaXVzLFxuICAgIGJvdW5kcyxcbiAgICB0cmFuc3BhcmVuY3ksXG4gICAgbGVnZW5kU2hvdyxcbiAgICBsZWdlbmRCdWJibGVzU2hvdyxcbiAgICBheGlzRGltZW5zaW9uVGV4dCkge1xuICAgIHRoaXMucmV2ZXJ0TWluTWF4ID0gdGhpcy5yZXZlcnRNaW5NYXguYmluZCh0aGlzKTtcbiAgICB0aGlzLmNhbGN1bGF0ZU1pbk1heCA9IHRoaXMuY2FsY3VsYXRlTWluTWF4LmJpbmQodGhpcyk7XG4gICAgdGhpcy5ub3JtYWxpemVEYXRhID0gdGhpcy5ub3JtYWxpemVEYXRhLmJpbmQodGhpcyk7XG4gICAgdGhpcy5ub3JtYWxpemVaRGF0YSA9IHRoaXMubm9ybWFsaXplWkRhdGEuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldFB0c0FuZExhYnMgPSB0aGlzLmdldFB0c0FuZExhYnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldExlZ2VuZEl0ZW1zUG9zaXRpb25zID0gdGhpcy5zZXRMZWdlbmRJdGVtc1Bvc2l0aW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0dXBMZWdlbmRHcm91cHNBbmRQdHMgPSB0aGlzLnNldHVwTGVnZW5kR3JvdXBzQW5kUHRzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXNpemVkQWZ0ZXJMZWdlbmRHcm91cHNEcmF3biA9IHRoaXMucmVzaXplZEFmdGVyTGVnZW5kR3JvdXBzRHJhd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmlzT3V0c2lkZVZpZXdCb3ggPSB0aGlzLmlzT3V0c2lkZVZpZXdCb3guYmluZCh0aGlzKTtcbiAgICB0aGlzLmlzTGVnZW5kUHRPdXRzaWRlVmlld0JveCA9IHRoaXMuaXNMZWdlbmRQdE91dHNpZGVWaWV3Qm94LmJpbmQodGhpcyk7XG4gICAgdGhpcy5hZGRFbGVtVG9MZWdlbmQgPSB0aGlzLmFkZEVsZW1Ub0xlZ2VuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlRWxlbUZyb21MZWdlbmQgPSB0aGlzLnJlbW92ZUVsZW1Gcm9tTGVnZW5kLmJpbmQodGhpcyk7XG4gICAgdGhpcy5YID0gWDtcbiAgICB0aGlzLlkgPSBZO1xuICAgIHRoaXMuWiA9IFo7XG4gICAgdGhpcy5ncm91cCA9IGdyb3VwO1xuICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB0aGlzLmxhYmVsQWx0ID0gbGFiZWxBbHQ7XG4gICAgdGhpcy52aWV3Qm94RGltID0gdmlld0JveERpbTtcbiAgICB0aGlzLmxlZ2VuZERpbSA9IGxlZ2VuZERpbTtcbiAgICB0aGlzLmNvbG9yV2hlZWwgPSBjb2xvcldoZWVsO1xuICAgIHRoaXMuZml4ZWRBc3BlY3RSYXRpbyA9IGZpeGVkQXNwZWN0UmF0aW87XG4gICAgdGhpcy5vcmlnaW5BbGlnbiA9IG9yaWdpbkFsaWduO1xuICAgIHRoaXMucG9pbnRSYWRpdXMgPSBwb2ludFJhZGl1cztcbiAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgICB0aGlzLnRyYW5zcGFyZW5jeSA9IHRyYW5zcGFyZW5jeTtcbiAgICB0aGlzLmxlZ2VuZFNob3cgPSBsZWdlbmRTaG93O1xuICAgIHRoaXMubGVnZW5kQnViYmxlc1Nob3cgPSBsZWdlbmRCdWJibGVzU2hvdztcbiAgICB0aGlzLmF4aXNEaW1lbnNpb25UZXh0ID0gYXhpc0RpbWVuc2lvblRleHQ7XG4gICAgdGhpcy5vcmlnWCA9IHRoaXMuWC5zbGljZSgwKTtcbiAgICB0aGlzLm9yaWdZID0gdGhpcy5ZLnNsaWNlKDApO1xuICAgIHRoaXMubm9ybVggPSB0aGlzLlguc2xpY2UoMCk7XG4gICAgdGhpcy5ub3JtWSA9IHRoaXMuWS5zbGljZSgwKTtcbiAgICBpZiAoVXRpbHMuaXNBcnJPZk51bXModGhpcy5aKSAmJiAodGhpcy5aLmxlbmd0aCA9PT0gdGhpcy5YLmxlbmd0aCkpIHsgdGhpcy5ub3JtWiA9IHRoaXMuWi5zbGljZSgpOyB9XG4gICAgdGhpcy5vdXRzaWRlUGxvdFB0c0lkID0gW107XG4gICAgdGhpcy5sZWdlbmRQdHMgPSBbXTtcbiAgICB0aGlzLm91dHNpZGVQbG90Q29uZGVuc2VkUHRzID0gW107XG4gICAgdGhpcy5sZWdlbmRCdWJibGVzID0gW107XG4gICAgdGhpcy5sZWdlbmRCdWJibGVzTGFiID0gW107XG4gICAgdGhpcy5sZWdlbmRSZXF1aXJlc1JlZHJhdyA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuWC5sZW5ndGggPT09IHRoaXMuWS5sZW5ndGgpIHtcbiAgICAgIHRoaXMubGVuID0gKHRoaXMub3JpZ0xlbiA9IFgubGVuZ3RoKTtcbiAgICAgIHRoaXMubm9ybWFsaXplRGF0YSgpO1xuICAgICAgaWYgKFV0aWxzLmlzQXJyT2ZOdW1zKHRoaXMuWikpIHsgdGhpcy5ub3JtYWxpemVaRGF0YSgpOyB9XG4gICAgICB0aGlzLnBsb3RDb2xvcnMgPSBuZXcgUGxvdENvbG9ycyh0aGlzKTtcbiAgICAgIHRoaXMubGFiZWxOZXcgPSBuZXcgUGxvdExhYmVsKHRoaXMubGFiZWwsIHRoaXMubGFiZWxBbHQsIHRoaXMudmlld0JveERpbS5sYWJlbExvZ29TY2FsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5wdXRzIFggYW5kIFkgbGVuZ3RocyBkbyBub3QgbWF0Y2ghJyk7XG4gICAgfVxuICB9XG5cbiAgcmV2ZXJ0TWluTWF4KCkge1xuICAgIHRoaXMubWluWCA9IHRoaXMubWluWG9sZDtcbiAgICB0aGlzLm1heFggPSB0aGlzLm1heFhvbGQ7XG4gICAgdGhpcy5taW5ZID0gdGhpcy5taW5Zb2xkO1xuICAgIHJldHVybiB0aGlzLm1heFkgPSB0aGlzLm1heFlvbGQ7XG4gIH1cblxuICBjYWxjdWxhdGVNaW5NYXgoKSB7XG4gICAgdGhpcy5taW5Yb2xkID0gdGhpcy5taW5YO1xuICAgIHRoaXMubWF4WG9sZCA9IHRoaXMubWF4WDtcbiAgICB0aGlzLm1pbllvbGQgPSB0aGlzLm1pblk7XG4gICAgdGhpcy5tYXhZb2xkID0gdGhpcy5tYXhZO1xuXG4gICAgY29uc3QgcHRzT3V0ID0gdGhpcy5vdXRzaWRlUGxvdFB0c0lkO1xuICAgIGNvbnN0IG5vdE1vdmVkWCA9IF8uZmlsdGVyKHRoaXMub3JpZ1gsICh2YWwsIGtleSkgPT4gIShfLmluY2x1ZGVzKHB0c091dCwga2V5KSkpO1xuICAgIGNvbnN0IG5vdE1vdmVkWSA9IF8uZmlsdGVyKHRoaXMub3JpZ1ksICh2YWwsIGtleSkgPT4gIShfLmluY2x1ZGVzKHB0c091dCwga2V5KSkpO1xuXG4gICAgdGhpcy5taW5YID0gXy5taW4obm90TW92ZWRYKTtcbiAgICB0aGlzLm1heFggPSBfLm1heChub3RNb3ZlZFgpO1xuICAgIHRoaXMubWluWSA9IF8ubWluKG5vdE1vdmVkWSk7XG4gICAgdGhpcy5tYXhZID0gXy5tYXgobm90TW92ZWRZKTtcblxuICAgIC8vIHRocmVzaG9sZCB1c2VkIHNvIHB0cyBhcmUgbm90IHJpZ2h0IG9uIGJvcmRlciBvZiBwbG90XG4gICAgbGV0IHJhbmdlWCA9IHRoaXMubWF4WCAtIHRoaXMubWluWDtcbiAgICBsZXQgcmFuZ2VZID0gdGhpcy5tYXhZIC0gdGhpcy5taW5ZO1xuICAgIGNvbnN0IHRocmVzID0gMC4wODtcbiAgICBsZXQgeFRocmVzID0gdGhyZXMgKiByYW5nZVg7XG4gICAgbGV0IHlUaHJlcyA9IHRocmVzICogcmFuZ2VZO1xuICAgIGlmICh4VGhyZXMgPT09IDApIHsgLy8gaWYgdGhlcmUgaXMgbm8gZGlmZmVyZW5jZSwgYWRkIGFyYml0cmFyeSB0aHJlc2hvbGQgb2YgMVxuICAgICAgeFRocmVzID0gMTtcbiAgICB9XG4gICAgaWYgKHlUaHJlcyA9PT0gMCkgeyAvLyBpZiB0aGVyZSBpcyBubyBkaWZmZXJlbmNlLCBhZGQgYXJiaXRyYXJ5IHRocmVzaG9sZCBvZiAxXG4gICAgICB5VGhyZXMgPSAxO1xuICAgIH1cblxuICAgIC8vIE5vdGU6IFRocmVzaG9sZGluZyBpbmNyZWFzZSB0aGUgc3BhY2UgYXJvdW5kIHRoZSBwb2ludHMgd2hpY2ggaXMgd2h5IHdlIGFkZCB0byB0aGUgbWF4IGFuZCBtaW5cbiAgICB0aGlzLm1heFggKz0geFRocmVzO1xuICAgIHRoaXMubWluWCAtPSB4VGhyZXM7XG4gICAgdGhpcy5tYXhZICs9IHlUaHJlcztcbiAgICB0aGlzLm1pblkgLT0geVRocmVzO1xuXG4gICAgLy8gb3JpZ2luQWxpZ246IGNvbXBlbnNhdGVzIHRvIG1ha2Ugc3VyZSBvcmlnaW4gbGluZXMgYXJlIG9uIGF4aXNcbiAgICBpZiAodGhpcy5vcmlnaW5BbGlnbikge1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5tYXhYIDwgMCA/IDAgOiB0aGlzLm1heFggKyB4VGhyZXM7IC8vIHNvIGF4aXMgY2FuIGJlIG9uIG9yaWdpblxuICAgICAgdGhpcy5taW5YID0gdGhpcy5taW5YID4gMCA/IDAgOiB0aGlzLm1pblggLSB4VGhyZXM7XG4gICAgICB0aGlzLm1heFkgPSB0aGlzLm1heFkgPCAwID8gMCA6IHRoaXMubWF4WSArIHlUaHJlcztcbiAgICAgIHRoaXMubWluWSA9IHRoaXMubWluWSA+IDAgPyAwIDogdGhpcy5taW5ZIC0geVRocmVzO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETyBLWiAoYW5vdGhlcikgdGhpcyBjYW4gYmUgc2ltcGxpZmllZCA6IHNlZSBQaWN0b2dyYXBoIHV0aWxzL2dlb21ldHJ5VXRpbHMuanNcbiAgICBpZiAodGhpcy5maXhlZEFzcGVjdFJhdGlvKSB7XG4gICAgICByYW5nZVggPSB0aGlzLm1heFggLSB0aGlzLm1pblg7XG4gICAgICByYW5nZVkgPSB0aGlzLm1heFkgLSB0aGlzLm1pblk7XG4gICAgICBjb25zdCByYW5nZUFSID0gTWF0aC5hYnMocmFuZ2VYIC8gcmFuZ2VZKTtcbiAgICAgIGNvbnN0IHdpZGdldEFSID0gKHRoaXMudmlld0JveERpbS53aWR0aCAvIHRoaXMudmlld0JveERpbS5oZWlnaHQpO1xuICAgICAgY29uc3QgcmFuZ2VUb1dpZGdldEFSUmF0aW8gPSB3aWRnZXRBUiAvIHJhbmdlQVI7XG5cbiAgICAgIGlmICh3aWRnZXRBUiA+PSAxKSB7XG4gICAgICAgIGlmIChyYW5nZVggPiByYW5nZVkpIHtcbiAgICAgICAgICBpZiAocmFuZ2VUb1dpZGdldEFSUmF0aW8gPiAxKSB7XG4gICAgICAgICAgICB0aGlzLm1heFggKz0gKCgod2lkZ2V0QVIgKiByYW5nZVkpIC0gcmFuZ2VYKSAvIDIpO1xuICAgICAgICAgICAgdGhpcy5taW5YIC09ICgoKHdpZGdldEFSICogcmFuZ2VZKSAtIHJhbmdlWCkgLyAyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tYXhZICs9ICgoKDEgLyB3aWRnZXRBUikgKiByYW5nZVgpIC0gcmFuZ2VZKSAvIDI7XG4gICAgICAgICAgICB0aGlzLm1pblkgLT0gKCgoMSAvIHdpZGdldEFSKSAqIHJhbmdlWCkgLSByYW5nZVkpIC8gMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmFuZ2VYIDwgcmFuZ2VZKSB7XG4gICAgICAgICAgdGhpcy5tYXhYICs9ICgod2lkZ2V0QVIgKiByYW5nZVkpIC0gcmFuZ2VYKSAvIDI7XG4gICAgICAgICAgdGhpcy5taW5YIC09ICgod2lkZ2V0QVIgKiByYW5nZVkpIC0gcmFuZ2VYKSAvIDI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmFuZ2VYIDwgcmFuZ2VZKSB7XG4gICAgICAgIGlmIChyYW5nZVRvV2lkZ2V0QVJSYXRpbyA8IDEpIHtcbiAgICAgICAgICB0aGlzLm1heFkgKz0gKCgoMSAvIHdpZGdldEFSKSAqIHJhbmdlWCkgLSByYW5nZVkpIC8gMjtcbiAgICAgICAgICB0aGlzLm1pblkgLT0gKCgoMSAvIHdpZGdldEFSKSAqIHJhbmdlWCkgLSByYW5nZVkpIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm1heFggKz0gKCh3aWRnZXRBUiAqIHJhbmdlWSkgLSByYW5nZVgpIC8gMjtcbiAgICAgICAgICB0aGlzLm1pblggLT0gKCh3aWRnZXRBUiAqIHJhbmdlWSkgLSByYW5nZVgpIC8gMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyYW5nZVggPiByYW5nZVkpIHtcbiAgICAgICAgdGhpcy5tYXhZICs9ICgoKDEgLyB3aWRnZXRBUikgKiByYW5nZVgpIC0gcmFuZ2VZKSAvIDI7XG4gICAgICAgIHRoaXMubWluWSAtPSAoKCgxIC8gd2lkZ2V0QVIpICogcmFuZ2VYKSAtIHJhbmdlWSkgLyAyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE8gS1ogdGhpcyBzaG91bGQgYmUgZG9uZSBmaXJzdCB0byBza2lwIHRoZSB3YXN0ZWQgY29tcHV0YXRpb24gKHVubGVzcyB0aGVyZSBhcmUgc2lkZSBlZmZlY3QgaW4gdGhlIGFib3ZlKSA/P1xuICAgIC8vIElmIHVzZXIgaGFzIHNlbnQgeCBhbmQgeSBib3VuZGFyaWVzLCB0aGVzZSBob2xkIGhpZ2hlciBwcmlvcml0eVxuICAgIGlmIChVdGlscy5pc051bSh0aGlzLmJvdW5kcy54bWF4KSkgeyB0aGlzLm1heFggPSB0aGlzLmJvdW5kcy54bWF4OyB9XG4gICAgaWYgKFV0aWxzLmlzTnVtKHRoaXMuYm91bmRzLnhtaW4pKSB7IHRoaXMubWluWCA9IHRoaXMuYm91bmRzLnhtaW47IH1cbiAgICBpZiAoVXRpbHMuaXNOdW0odGhpcy5ib3VuZHMueW1heCkpIHsgdGhpcy5tYXhZID0gdGhpcy5ib3VuZHMueW1heDsgfVxuICAgIGlmIChVdGlscy5pc051bSh0aGlzLmJvdW5kcy55bWluKSkgeyByZXR1cm4gdGhpcy5taW5ZID0gdGhpcy5ib3VuZHMueW1pbjsgfVxuICB9XG5cbiAgbm9ybWFsaXplRGF0YSgpIHtcbiAgICAvLyBUT0RPIEtaIHJlbW92ZSB0aGlzIHNpZGUgZWZmZWN0LiBQbHVzIERhdGEuY2FsY01pbk1heCBpcyBjYWxsZWQgb3ZlciBhbmQgb3ZlciBpbiB0aGUgY29kZS4gV2h5ID8/XG4gICAgbGV0IGk7XG4gICAgdGhpcy5jYWxjdWxhdGVNaW5NYXgoKTtcblxuICAgIC8vIGNyZWF0ZSBsaXN0IG9mIG1vdmVkT2ZmUHRzIHRoYXQgbmVlZCBtYXJrZXJzXG4gICAgdGhpcy5vdXRzaWRlUGxvdE1hcmtlcnMgPSBbXTtcbiAgICB0aGlzLm91dHNpZGVQbG90TWFya2Vyc0l0ZXIgPSAwO1xuXG4gICAgZm9yIChjb25zdCBscCBvZiBBcnJheS5mcm9tKHRoaXMubGVnZW5kUHRzKSkge1xuICAgICAgdmFyIHsgaWQgfSA9IGxwLnB0O1xuICAgICAgbGV0IGRyYWdnZWROb3JtWCA9ICh0aGlzLlhbaWRdIC0gdGhpcy5taW5YKSAvICh0aGlzLm1heFggLSB0aGlzLm1pblgpO1xuICAgICAgbGV0IGRyYWdnZWROb3JtWSA9ICh0aGlzLllbaWRdIC0gdGhpcy5taW5ZKSAvICh0aGlzLm1heFkgLSB0aGlzLm1pblkpO1xuICAgICAgLy8gVE9ETyBLWiB0aGUgKysgc2hvdWxkIGJlIGltbWVkLiBhZnRlciB0aGUgdXNlIG9mIHRoZSBpdGVyICFcbiAgICAgIGNvbnN0IG5ld01hcmtlcklkID0gdGhpcy5vdXRzaWRlUGxvdE1hcmtlcnNJdGVyO1xuICAgICAgbHAubWFya2VySWQgPSBuZXdNYXJrZXJJZDtcblxuICAgICAgaWYgKChNYXRoLmFicyhkcmFnZ2VkTm9ybVgpID4gMSkgfHwgKE1hdGguYWJzKGRyYWdnZWROb3JtWSkgPiAxKSB8fFxuICAgICAgICAgKGRyYWdnZWROb3JtWCA8IDApIHx8IChkcmFnZ2VkTm9ybVkgPCAwKSkge1xuICAgICAgICB2YXIgbWFya2VyVGV4dFksXG4gICAgICAgICAgeDEsXG4gICAgICAgICAgeTE7XG4gICAgICAgIGRyYWdnZWROb3JtWCA9IGRyYWdnZWROb3JtWCA+IDEgPyAxIDogZHJhZ2dlZE5vcm1YO1xuICAgICAgICBkcmFnZ2VkTm9ybVggPSBkcmFnZ2VkTm9ybVggPCAwID8gMCA6IGRyYWdnZWROb3JtWDtcbiAgICAgICAgZHJhZ2dlZE5vcm1ZID0gZHJhZ2dlZE5vcm1ZID4gMSA/IDEgOiBkcmFnZ2VkTm9ybVk7XG4gICAgICAgIGRyYWdnZWROb3JtWSA9IGRyYWdnZWROb3JtWSA8IDAgPyAwIDogZHJhZ2dlZE5vcm1ZO1xuICAgICAgICBjb25zdCB4MiA9IChkcmFnZ2VkTm9ybVggKiB0aGlzLnZpZXdCb3hEaW0ud2lkdGgpICsgdGhpcy52aWV3Qm94RGltLng7XG4gICAgICAgIGNvbnN0IHkyID0gKCgxIC0gZHJhZ2dlZE5vcm1ZKSAqIHRoaXMudmlld0JveERpbS5oZWlnaHQpICsgdGhpcy52aWV3Qm94RGltLnk7XG5cbiAgICAgICAgbGV0IG1hcmtlclRleHRYID0gKG1hcmtlclRleHRZID0gMCk7XG4gICAgICAgIGNvbnN0IG51bURpZ2l0c0luSWQgPSBNYXRoLmNlaWwoTWF0aC5sb2cobmV3TWFya2VySWQgKyAxLjEpIC8gTWF0aC5MTjEwKTtcbiAgICAgICAgaWYgKGRyYWdnZWROb3JtWCA9PT0gMSkgeyAvLyByaWdodCBib3VuZFxuICAgICAgICAgIHgxID0geDIgKyB0aGlzLmxlZ2VuZERpbS5tYXJrZXJMZW47XG4gICAgICAgICAgeTEgPSB5MjtcbiAgICAgICAgICBtYXJrZXJUZXh0WCA9IHgxO1xuICAgICAgICAgIG1hcmtlclRleHRZID0geTEgKyAodGhpcy5sZWdlbmREaW0ubWFya2VyVGV4dFNpemUgLyAyKTtcbiAgICAgICAgfSBlbHNlIGlmIChkcmFnZ2VkTm9ybVggPT09IDApIHsgLy8gbGVmdCBib3VuZFxuICAgICAgICAgIHgxID0geDIgLSB0aGlzLmxlZ2VuZERpbS5tYXJrZXJMZW47XG4gICAgICAgICAgeTEgPSB5MjtcbiAgICAgICAgICBtYXJrZXJUZXh0WCA9IHgxIC0gKHRoaXMubGVnZW5kRGltLm1hcmtlckNoYXJXaWR0aCAqIChudW1EaWdpdHNJbklkICsgMSkpO1xuICAgICAgICAgIG1hcmtlclRleHRZID0geTEgKyAodGhpcy5sZWdlbmREaW0ubWFya2VyVGV4dFNpemUgLyAyKTtcbiAgICAgICAgfSBlbHNlIGlmIChkcmFnZ2VkTm9ybVkgPT09IDEpIHsgLy8gdG9wIGJvdW5kXG4gICAgICAgICAgeDEgPSB4MjtcbiAgICAgICAgICB5MSA9IHkyICsgKC1kcmFnZ2VkTm9ybVkgKiB0aGlzLmxlZ2VuZERpbS5tYXJrZXJMZW4pO1xuICAgICAgICAgIG1hcmtlclRleHRYID0geDEgLSAodGhpcy5sZWdlbmREaW0ubWFya2VyQ2hhcldpZHRoICogKG51bURpZ2l0c0luSWQpKTtcbiAgICAgICAgICBtYXJrZXJUZXh0WSA9IHkxO1xuICAgICAgICB9IGVsc2UgaWYgKGRyYWdnZWROb3JtWSA9PT0gMCkgeyAvLyBib3QgYm91bmRcbiAgICAgICAgICB4MSA9IHgyO1xuICAgICAgICAgIHkxID0geTIgKyB0aGlzLmxlZ2VuZERpbS5tYXJrZXJMZW47XG4gICAgICAgICAgbWFya2VyVGV4dFggPSB4MSAtICh0aGlzLmxlZ2VuZERpbS5tYXJrZXJDaGFyV2lkdGggKiAobnVtRGlnaXRzSW5JZCkpO1xuICAgICAgICAgIG1hcmtlclRleHRZID0geTEgKyB0aGlzLmxlZ2VuZERpbS5tYXJrZXJUZXh0U2l6ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE8gS1ogYnVnPyA6IG5ld01hcmtlcklkICsgMSwgYnV0IGxwLm1hcmtlcklkID0gbmV3TWFya2VyID8/XG4gICAgICAgIHRoaXMub3V0c2lkZVBsb3RNYXJrZXJzLnB1c2goe1xuICAgICAgICAgIG1hcmtlckxhYmVsOiBuZXdNYXJrZXJJZCArIDEsXG4gICAgICAgICAgcHRJZDogaWQsXG4gICAgICAgICAgeDEsXG4gICAgICAgICAgeTEsXG4gICAgICAgICAgeDIsXG4gICAgICAgICAgeTIsXG4gICAgICAgICAgbWFya2VyVGV4dFgsXG4gICAgICAgICAgbWFya2VyVGV4dFksXG4gICAgICAgICAgd2lkdGg6IHRoaXMubGVnZW5kRGltLm1hcmtlcldpZHRoLFxuICAgICAgICAgIGNvbG9yOiBscC5jb2xvcixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIHBvaW50cyB3ZXJlIGNvbmRlbnNlZCwgcmVtb3ZlIHBvaW50XG4gICAgICAgIHRoaXMub3V0c2lkZVBsb3RDb25kZW5zZWRQdHMgPSBfLmZpbHRlcih0aGlzLm91dHNpZGVQbG90Q29uZGVuc2VkUHRzLCBlID0+IGUuZGF0YUlkICE9PSBpZCk7XG4gICAgICAgIHRoaXMubGVuID0gdGhpcy5vcmlnTGVuIC0gdGhpcy5vdXRzaWRlUGxvdE1hcmtlcnMubGVuZ3RoO1xuICAgICAgfSBlbHNlIHsgLy8gbm8gbWFya2VyIHJlcXVpcmVkLCBidXQgc3RpbGwgaW5zaWRlIHBsb3Qgd2luZG93XG4gICAgICAgIGNvbnNvbGUubG9nKCdyaHRtbExhYmVsZWRTY2F0dGVyOiBDb25kZW5zZWQgcG9pbnQgYWRkZWQnKTtcbiAgICAgICAgY29uc3QgY29uZGVuc2VkUHRzRGF0YUlkQXJyYXkgPSBfLm1hcCh0aGlzLm91dHNpZGVQbG90Q29uZGVuc2VkUHRzLCBlID0+IGUuZGF0YUlkKTtcbiAgICAgICAgaWYgKCFfLmluY2x1ZGVzKGNvbmRlbnNlZFB0c0RhdGFJZEFycmF5LCBpZCkpIHtcbiAgICAgICAgICB0aGlzLm91dHNpZGVQbG90Q29uZGVuc2VkUHRzLnB1c2goe1xuICAgICAgICAgICAgZGF0YUlkOiBpZCxcbiAgICAgICAgICAgIG1hcmtlcklkOiBuZXdNYXJrZXJJZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5vdXRzaWRlUGxvdE1hcmtlcnNJdGVyKys7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHB0cyB0aGF0IGFyZSBvdXRzaWRlIHBsb3QgaWYgdXNlciBib3VuZHMgd2VyZSBzZXRcbiAgICB0aGlzLm91dHNpZGVCb3VuZHNQdHNJZCA9IFtdO1xuICAgIGlmIChfLnNvbWUodGhpcy5ib3VuZHMsIGIgPT4gVXRpbHMuaXNOdW0oYikpKSB7XG4gICAgICBpID0gMDtcbiAgICAgIHdoaWxlIChpIDwgdGhpcy5vcmlnTGVuKSB7XG4gICAgICAgIGlmICghXy5pbmNsdWRlcyh0aGlzLm91dHNpZGVCb3VuZHNQdHNJZCwgaSkpIHtcbiAgICAgICAgICBpZiAoKHRoaXMuWFtpXSA8IHRoaXMubWluWCkgfHwgKHRoaXMuWFtpXSA+IHRoaXMubWF4WCkgfHxcbiAgICAgICAgICAgICAodGhpcy5ZW2ldIDwgdGhpcy5taW5ZKSB8fCAodGhpcy5ZW2ldID4gdGhpcy5tYXhZKSkge1xuICAgICAgICAgICAgdGhpcy5vdXRzaWRlQm91bmRzUHRzSWQucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGkgPSAwO1xuICAgIHJldHVybiAoKCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICB3aGlsZSAoaSA8IHRoaXMub3JpZ0xlbikge1xuICAgICAgICB0aGlzLm5vcm1YW2ldID0gdGhpcy5taW5YID09PSB0aGlzLm1heFggPyB0aGlzLm1pblggOiAodGhpcy5YW2ldIC0gdGhpcy5taW5YKSAvICh0aGlzLm1heFggLSB0aGlzLm1pblgpO1xuICAgICAgICAvLyBjb3B5L3Bhc3RlIGJ1ZyB1c2luZyB4IHdoZW4gY2FsY3VsYXRpbmcgWS4gV1RGIGlzIHRoaXMgZXZlbiBkb2luZyA/XG4gICAgICAgIHRoaXMubm9ybVlbaV0gPSB0aGlzLm1pblkgPT09IHRoaXMubWF4WSA/IHRoaXMubWluWCA6ICh0aGlzLllbaV0gLSB0aGlzLm1pblkpIC8gKHRoaXMubWF4WSAtIHRoaXMubWluWSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGkrKyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pKCk7XG4gIH1cblxuICBub3JtYWxpemVaRGF0YSgpIHtcbiAgICBjb25zdCBsZWdlbmRVdGlscyA9IExlZ2VuZFV0aWxzO1xuXG4gICAgY29uc3QgbWF4WiA9IF8ubWF4KHRoaXMuWik7XG4gICAgbGVnZW5kVXRpbHMuY2FsY1pRdWFydGlsZXModGhpcywgbWF4Wik7XG4gICAgcmV0dXJuIGxlZ2VuZFV0aWxzLm5vcm1hbGl6ZVpWYWx1ZXModGhpcywgbWF4Wik7XG4gIH1cblxuICBnZXRQdHNBbmRMYWJzKGNhbGxlZU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhgZ2V0UHRzQW5kTGFicygke2NhbGxlZU5hbWV9KWApO1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmxhYmVsTmV3LmdldExhYmVscygpKS50aGVuKChyZXNvbHZlZExhYmVscykgPT4ge1xuLy8gICAgICBjb25zb2xlLmxvZyhcInJlc29sdmVkTGFiZWxzIGZvciBnZXRQdHNhbmRMYWJzIGNhbGxlZSBuYW1lICN7Y2FsbGVlTmFtZX1cIilcbi8vICAgICAgY29uc29sZS5sb2cocmVzb2x2ZWRMYWJlbHMpXG5cbiAgICAgIHRoaXMucHRzID0gW107XG4gICAgICB0aGlzLmxhYiA9IFtdO1xuXG4gICAgICBsZXQgaSA9IDA7XG4gICAgICB3aGlsZSAoaSA8IHRoaXMub3JpZ0xlbikge1xuICAgICAgICBpZiAoKCFfLmluY2x1ZGVzKHRoaXMub3V0c2lkZVBsb3RQdHNJZCwgaSkpIHx8XG4gICAgICAgICAgIF8uaW5jbHVkZXMoKF8ubWFwKHRoaXMub3V0c2lkZVBsb3RDb25kZW5zZWRQdHMsIGUgPT4gZS5kYXRhSWQpKSwgaSkpIHtcbiAgICAgICAgICB2YXIgcHRDb2xvcjtcbiAgICAgICAgICBjb25zdCB4ID0gKHRoaXMubm9ybVhbaV0gKiB0aGlzLnZpZXdCb3hEaW0ud2lkdGgpICsgdGhpcy52aWV3Qm94RGltLng7XG4gICAgICAgICAgY29uc3QgeSA9ICgoMSAtIHRoaXMubm9ybVlbaV0pICogdGhpcy52aWV3Qm94RGltLmhlaWdodCkgKyB0aGlzLnZpZXdCb3hEaW0ueTtcbiAgICAgICAgICBsZXQgciA9IHRoaXMucG9pbnRSYWRpdXM7XG4gICAgICAgICAgaWYgKFV0aWxzLmlzQXJyT2ZOdW1zKHRoaXMuWikpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlZ2VuZFV0aWxzID0gTGVnZW5kVXRpbHM7XG4gICAgICAgICAgICByID0gbGVnZW5kVXRpbHMubm9ybWFsaXplZFp0b1JhZGl1cyh0aGlzLnZpZXdCb3hEaW0sIHRoaXMubm9ybVpbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaWxsT3BhY2l0eSA9IHRoaXMucGxvdENvbG9ycy5nZXRGaWxsT3BhY2l0eSh0aGlzLnRyYW5zcGFyZW5jeSk7XG5cbiAgICAgICAgICBsZXQgeyBsYWJlbCB9ID0gcmVzb2x2ZWRMYWJlbHNbaV07XG4gICAgICAgICAgY29uc3QgbGFiZWxBbHQgPSAoKHRoaXMubGFiZWxBbHQgIT0gbnVsbCA/IHRoaXMubGFiZWxBbHRbaV0gOiB1bmRlZmluZWQpICE9IG51bGwpID8gdGhpcy5sYWJlbEFsdFtpXSA6ICcnO1xuICAgICAgICAgIGxldCB7IHdpZHRoIH0gPSByZXNvbHZlZExhYmVsc1tpXTtcbiAgICAgICAgICBsZXQgeyBoZWlnaHQgfSA9IHJlc29sdmVkTGFiZWxzW2ldO1xuICAgICAgICAgIGxldCB7IHVybCB9ID0gcmVzb2x2ZWRMYWJlbHNbaV07XG5cbiAgICAgICAgICBjb25zdCBsYWJlbFogPSBVdGlscy5pc0Fyck9mTnVtcyh0aGlzLlopID8gdGhpcy5aW2ldLnRvU3RyaW5nKCkgOiAnJztcbiAgICAgICAgICBsZXQgZm9udFNpemUgPSB0aGlzLnZpZXdCb3hEaW0ubGFiZWxGb250U2l6ZTtcblxuICAgICAgICAgIC8vIElmIHB0IGhzYSBiZWVuIGFscmVhZHkgY29uZGVuc2VkXG4gICAgICAgICAgaWYgKF8uaW5jbHVkZXMoKF8ubWFwKHRoaXMub3V0c2lkZVBsb3RDb25kZW5zZWRQdHMsIGUgPT4gZS5kYXRhSWQpKSwgaSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHB0ID0gXy5maW5kKHRoaXMub3V0c2lkZVBsb3RDb25kZW5zZWRQdHMsIGUgPT4gZS5kYXRhSWQgPT09IGkpO1xuICAgICAgICAgICAgbGFiZWwgPSBwdC5tYXJrZXJJZCArIDE7XG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMudmlld0JveERpbS5sYWJlbFNtYWxsRm9udFNpemU7XG4gICAgICAgICAgICB1cmwgPSAnJztcbiAgICAgICAgICAgIHdpZHRoID0gbnVsbDtcbiAgICAgICAgICAgIGhlaWdodCA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGZvbnRDb2xvciA9IChwdENvbG9yID0gdGhpcy5wbG90Q29sb3JzLmdldENvbG9yKGkpKTtcbiAgICAgICAgICBpZiAoKHRoaXMudmlld0JveERpbS5sYWJlbEZvbnRDb2xvciAhPSBudWxsKSAmJiAhKHRoaXMudmlld0JveERpbS5sYWJlbEZvbnRDb2xvciA9PT0gJycpKSB7IGZvbnRDb2xvciA9IHRoaXMudmlld0JveERpbS5sYWJlbEZvbnRDb2xvcjsgfVxuICAgICAgICAgIGNvbnN0IGdyb3VwID0gKHRoaXMuZ3JvdXAgIT0gbnVsbCkgPyB0aGlzLmdyb3VwW2ldIDogJyc7XG4gICAgICAgICAgdGhpcy5wdHMucHVzaCh7XG4gICAgICAgICAgICB4LFxuICAgICAgICAgICAgeSxcbiAgICAgICAgICAgIHIsXG4gICAgICAgICAgICBsYWJlbCxcbiAgICAgICAgICAgIGxhYmVsQWx0LFxuICAgICAgICAgICAgbGFiZWxYOiB0aGlzLm9yaWdYW2ldLnRvUHJlY2lzaW9uKDMpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBsYWJlbFk6IHRoaXMub3JpZ1lbaV0udG9QcmVjaXNpb24oMykudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGxhYmVsWixcbiAgICAgICAgICAgIGdyb3VwLFxuICAgICAgICAgICAgY29sb3I6IHB0Q29sb3IsXG4gICAgICAgICAgICBpZDogaSxcbiAgICAgICAgICAgIGZpbGxPcGFjaXR5LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMubGFiLnB1c2goe1xuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHksXG4gICAgICAgICAgICBjb2xvcjogZm9udENvbG9yLFxuICAgICAgICAgICAgaWQ6IGksXG4gICAgICAgICAgICBmb250U2l6ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IHRoaXMudmlld0JveERpbS5sYWJlbEZvbnRGYW1pbHksXG4gICAgICAgICAgICB0ZXh0OiBsYWJlbCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIHB0cyBvdXRzaWRlIHBsb3QgYmVjYXVzZSB1c2VyIGJvdW5kcyBzZXRcbiAgICAgIHJldHVybiAoKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIEFycmF5LmZyb20odGhpcy5vdXRzaWRlQm91bmRzUHRzSWQpKSB7XG4gICAgICAgICAgbGV0IGl0ZW07XG4gICAgICAgICAgaWYgKCFfLmluY2x1ZGVzKHRoaXMub3V0c2lkZVBsb3RQdHNJZCwgcCkpIHsgaXRlbSA9IHRoaXMuYWRkRWxlbVRvTGVnZW5kKHApOyB9XG4gICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pKCk7XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG5cbiAgLy8gVE9ETyBLWiByZW5hbWUgdG8gbnVtQ29sdW1ucyBvbmNlIG1lYW5pbmcgaXMgY29uZmlybWVkXG4gIC8vIFRPRE8gS1ogSWYgSSBoYXZlIGFuIGFycmF5LCBJIGRvbnQgbmVlZCB0byBiZSB0b2xkIGl0cyBsZW5ndGhcbiAgc2V0TGVnZW5kSXRlbXNQb3NpdGlvbnMobnVtSXRlbXMsIGl0ZW1zQXJyYXksIGNvbHMpIHtcbiAgICBjb25zdCBidWJibGVMZWdlbmRUZXh0SGVpZ2h0ID0gMjA7XG4gICAgdGhpcy5sZWdlbmRIZWlnaHQgPSB0aGlzLnZpZXdCb3hEaW0uaGVpZ2h0O1xuICAgIGlmICgodGhpcy5sZWdlbmRCdWJibGVzVGl0bGUgIT0gbnVsbCkgJiYgdGhpcy5sZWdlbmRCdWJibGVzU2hvdykge1xuICAgICAgdGhpcy5sZWdlbmRIZWlnaHQgPSB0aGlzLmxlZ2VuZEJ1YmJsZXNUaXRsZVswXS55IC0gYnViYmxlTGVnZW5kVGV4dEhlaWdodCAtIHRoaXMudmlld0JveERpbS55O1xuICAgIH1cblxuICAgIGlmICh0aGlzLlpxdWFydGlsZXMgIT0gbnVsbCkge1xuICAgICAgY29uc3QgbGVnZW5kVXRpbHMgPSBMZWdlbmRVdGlscztcbiAgICAgIGxlZ2VuZFV0aWxzLnNldHVwQnViYmxlcyh0aGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydE9mQ2VudGVyZWRMZWdlbmRJdGVtcyA9ICgoKHRoaXMudmlld0JveERpbS55ICsgKHRoaXMubGVnZW5kSGVpZ2h0IC8gMikpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKHRoaXMubGVnZW5kRGltLmhlaWdodE9mUm93ICogKG51bUl0ZW1zIC8gY29scykpIC8gMikpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxlZ2VuZERpbS5wdFJhZGl1cyk7XG4gICAgY29uc3Qgc3RhcnRPZlZpZXdCb3ggPSB0aGlzLnZpZXdCb3hEaW0ueSArIHRoaXMubGVnZW5kRGltLnB0UmFkaXVzO1xuICAgIGNvbnN0IGxlZ2VuZFN0YXJ0WSA9IE1hdGgubWF4KHN0YXJ0T2ZDZW50ZXJlZExlZ2VuZEl0ZW1zLCBzdGFydE9mVmlld0JveCk7XG5cbiAgICBsZXQgY29sU3BhY2luZyA9IDA7XG4gICAgbGV0IG51bUl0ZW1zSW5QcmV2Q29scyA9IDA7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGN1cnJlbnRDb2wgPSAxO1xuICAgIHJldHVybiAoKCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICB3aGlsZSAoaSA8IG51bUl0ZW1zKSB7XG4gICAgICAgIGlmIChjb2xzID4gMSkge1xuICAgICAgICAgIGNvbnN0IG51bUVsZW1zSW5Db2wgPSBudW1JdGVtcyAvIGNvbHM7XG4gICAgICAgICAgY29uc3QgZXhjZWVkZWRDdXJyZW50Q29sID0gKGxlZ2VuZFN0YXJ0WSArICgoaSAtIG51bUl0ZW1zSW5QcmV2Q29scykgKiB0aGlzLmxlZ2VuZERpbS5oZWlnaHRPZlJvdykpID4gKHRoaXMudmlld0JveERpbS55ICsgdGhpcy5sZWdlbmRIZWlnaHQpO1xuICAgICAgICAgIGNvbnN0IHBsb3R0ZWRFdmVuQmFsYW5jZU9mSXRlbXNCdHduQ29scyA9IGkgPj0gKG51bUVsZW1zSW5Db2wgKiBjdXJyZW50Q29sKTtcbiAgICAgICAgICBpZiAoZXhjZWVkZWRDdXJyZW50Q29sIHx8IHBsb3R0ZWRFdmVuQmFsYW5jZU9mSXRlbXNCdHduQ29scykge1xuICAgICAgICAgICAgY29sU3BhY2luZyA9ICh0aGlzLmxlZ2VuZERpbS5jb2xTcGFjZSArICh0aGlzLmxlZ2VuZERpbS5wdFJhZGl1cyAqIDIpICsgdGhpcy5sZWdlbmREaW0ucHRUb1RleHRTcGFjZSkgKiBjdXJyZW50Q29sO1xuICAgICAgICAgICAgbnVtSXRlbXNJblByZXZDb2xzID0gaTtcbiAgICAgICAgICAgIGN1cnJlbnRDb2wrKztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0b3RhbEl0ZW1zU3BhY2luZ0V4Y2VlZExlZ2VuZEFyZWEgPSAobGVnZW5kU3RhcnRZICsgKChpIC0gbnVtSXRlbXNJblByZXZDb2xzKSAqIHRoaXMubGVnZW5kRGltLmhlaWdodE9mUm93KSkgPiAodGhpcy52aWV3Qm94RGltLnkgKyB0aGlzLmxlZ2VuZEhlaWdodCk7XG4gICAgICAgICAgaWYgKHRvdGFsSXRlbXNTcGFjaW5nRXhjZWVkTGVnZW5kQXJlYSkgeyBicmVhazsgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGkgPSBpdGVtc0FycmF5W2ldO1xuICAgICAgICBpZiAobGkuaXNEcmFnZ2VkUHQpIHtcbiAgICAgICAgICBsaS54ID0gdGhpcy5sZWdlbmREaW0ueCArIHRoaXMubGVnZW5kRGltLmxlZnRQYWRkaW5nICsgY29sU3BhY2luZztcbiAgICAgICAgICBsaS55ID0gbGVnZW5kU3RhcnRZICsgKChpIC0gbnVtSXRlbXNJblByZXZDb2xzKSAqIHRoaXMubGVnZW5kRGltLmhlaWdodE9mUm93KSArIHRoaXMubGVnZW5kRGltLnZlcnRQdFBhZGRpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGkuY3ggPSB0aGlzLmxlZ2VuZERpbS54ICsgdGhpcy5sZWdlbmREaW0ubGVmdFBhZGRpbmcgKyBjb2xTcGFjaW5nICsgbGkucjtcbiAgICAgICAgICBsaS5jeSA9IGxlZ2VuZFN0YXJ0WSArICgoaSAtIG51bUl0ZW1zSW5QcmV2Q29scykgKiB0aGlzLmxlZ2VuZERpbS5oZWlnaHRPZlJvdyk7XG4gICAgICAgICAgbGkueCA9IGxpLmN4ICsgdGhpcy5sZWdlbmREaW0ucHRUb1RleHRTcGFjZTtcbiAgICAgICAgICBsaS55ID0gbGkuY3kgKyBsaS5yO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGkrKyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pKCk7XG4gIH1cblxuICBzZXR1cExlZ2VuZEdyb3Vwc0FuZFB0cygpIHtcbiAgICBpZiAoKHRoaXMubGVnZW5kUHRzLmxlbmd0aCA+IDApICYmICh0aGlzLmxlZ2VuZFNob3cgPT09IHRydWUpKSB7XG4gICAgICBjb25zdCB0b3RhbExlZ2VuZEl0ZW1zID0gdGhpcy5sZWdlbmRHcm91cHMubGVuZ3RoICsgdGhpcy5sZWdlbmRQdHMubGVuZ3RoO1xuICAgICAgY29uc3QgbGVnZW5kSXRlbUFycmF5ID0gW107XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBsZXQgaiA9IDA7XG5cbiAgICAgIC8vIEtaIFRPRE8gcG9zc2libHkgdGhlIHdvcnN0IGFycmF5IGNvbmNhdCBpdmUgZXZlciBzZWVuXG4gICAgICB3aGlsZSAoaSA8IHRvdGFsTGVnZW5kSXRlbXMpIHtcbiAgICAgICAgaWYgKGkgPCB0aGlzLmxlZ2VuZEdyb3Vwcy5sZW5ndGgpIHtcbiAgICAgICAgICBsZWdlbmRJdGVtQXJyYXkucHVzaCh0aGlzLmxlZ2VuZEdyb3Vwc1tpXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaiA9IGkgLSB0aGlzLmxlZ2VuZEdyb3Vwcy5sZW5ndGg7XG4gICAgICAgICAgbGVnZW5kSXRlbUFycmF5LnB1c2godGhpcy5sZWdlbmRQdHNbal0pO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuc2V0TGVnZW5kSXRlbXNQb3NpdGlvbnModG90YWxMZWdlbmRJdGVtcywgbGVnZW5kSXRlbUFycmF5LCB0aGlzLmxlZ2VuZERpbS5jb2xzKTtcbiAgICB9IGVsc2UgaWYgKCh0aGlzLmxlZ2VuZFB0cy5sZW5ndGggPiAwKSAmJiAodGhpcy5sZWdlbmRTaG93ID09PSBmYWxzZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldExlZ2VuZEl0ZW1zUG9zaXRpb25zKHRoaXMubGVnZW5kUHRzLmxlbmd0aCwgdGhpcy5sZWdlbmRQdHMsIHRoaXMubGVnZW5kRGltLmNvbHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRMZWdlbmRJdGVtc1Bvc2l0aW9ucyh0aGlzLmxlZ2VuZEdyb3Vwcy5sZW5ndGgsIHRoaXMubGVnZW5kR3JvdXBzLCB0aGlzLmxlZ2VuZERpbS5jb2xzKTtcbiAgICB9XG4gIH1cblxuICByZXNpemVkQWZ0ZXJMZWdlbmRHcm91cHNEcmF3bigpIHtcbiAgICBjb25zdCBpbml0V2lkdGggPSB0aGlzLnZpZXdCb3hEaW0ud2lkdGg7XG5cbiAgICBjb25zdCB0b3RhbExlZ2VuZEl0ZW1zID0gdGhpcy5sZWdlbmRTaG93ID8gdGhpcy5sZWdlbmRHcm91cHMubGVuZ3RoICsgdGhpcy5sZWdlbmRQdHMubGVuZ3RoIDogdGhpcy5sZWdlbmRQdHMubGVuZ3RoO1xuICAgIGNvbnN0IGxlZ2VuZEdycHNUZXh0TWF4ID0gKHRoaXMubGVnZW5kR3JvdXBzLmxlbmd0aCA+IDApICYmIHRoaXMubGVnZW5kU2hvdyA/IChfLm1heEJ5KHRoaXMubGVnZW5kR3JvdXBzLCBlID0+IGUud2lkdGgpKS53aWR0aCA6IDA7XG4gICAgY29uc3QgbGVnZW5kUHRzVGV4dE1heCA9IHRoaXMubGVnZW5kUHRzLmxlbmd0aCA+IDAgPyAoXy5tYXhCeSh0aGlzLmxlZ2VuZFB0cywgZSA9PiBlLndpZHRoKSkud2lkdGggOiAwO1xuXG4gICAgY29uc3QgbWF4VGV4dFdpZHRoID0gXy5tYXgoW2xlZ2VuZEdycHNUZXh0TWF4LCBsZWdlbmRQdHNUZXh0TWF4XSk7XG5cbiAgICBjb25zdCBzcGFjaW5nQXJvdW5kTWF4VGV4dFdpZHRoID0gdGhpcy5sZWdlbmREaW0ubGVmdFBhZGRpbmcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5sZWdlbmREaW0ucHRSYWRpdXMgKiAyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kRGltLnJpZ2h0UGFkZGluZyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kRGltLnB0VG9UZXh0U3BhY2U7XG5cbiAgICBjb25zdCBidWJibGVMZWZ0UmlnaHRQYWRkaW5nID0gdGhpcy5sZWdlbmREaW0ubGVmdFBhZGRpbmcgKyB0aGlzLmxlZ2VuZERpbS5yaWdodFBhZGRpbmc7XG5cbiAgICB0aGlzLmxlZ2VuZERpbS5jb2xzID0gTWF0aC5jZWlsKCgodG90YWxMZWdlbmRJdGVtcykgKiB0aGlzLmxlZ2VuZERpbS5oZWlnaHRPZlJvdykgLyB0aGlzLmxlZ2VuZEhlaWdodCk7XG4gICAgdGhpcy5sZWdlbmREaW0ud2lkdGggPSAobWF4VGV4dFdpZHRoICogdGhpcy5sZWdlbmREaW0uY29scykgKyBzcGFjaW5nQXJvdW5kTWF4VGV4dFdpZHRoICsgKHRoaXMubGVnZW5kRGltLmNlbnRlclBhZGRpbmcgKiAodGhpcy5sZWdlbmREaW0uY29scyAtIDEpKTtcblxuICAgIGNvbnN0IGJ1YmJsZVRpdGxlV2lkdGggPSB0aGlzLmxlZ2VuZEJ1YmJsZXNUaXRsZSAhPSBudWxsID8gdGhpcy5sZWdlbmRCdWJibGVzVGl0bGVbMF0ud2lkdGggOiB1bmRlZmluZWQ7XG4gICAgdGhpcy5sZWdlbmREaW0ud2lkdGggPSBfLm1heChbdGhpcy5sZWdlbmREaW0ud2lkdGgsIGJ1YmJsZVRpdGxlV2lkdGggKyBidWJibGVMZWZ0UmlnaHRQYWRkaW5nLCB0aGlzLmxlZ2VuZEJ1YmJsZXNNYXhXaWR0aCArIGJ1YmJsZUxlZnRSaWdodFBhZGRpbmddKTtcblxuICAgIHRoaXMubGVnZW5kRGltLmNvbFNwYWNlID0gbWF4VGV4dFdpZHRoO1xuXG4gICAgdGhpcy52aWV3Qm94RGltLndpZHRoID0gdGhpcy52aWV3Qm94RGltLnN2Z1dpZHRoIC0gdGhpcy5sZWdlbmREaW0ud2lkdGggLSB0aGlzLnZpZXdCb3hEaW0ueCAtIHRoaXMuYXhpc0RpbWVuc2lvblRleHQucm93TWF4V2lkdGg7XG4gICAgdGhpcy5sZWdlbmREaW0ueCA9IHRoaXMudmlld0JveERpbS54ICsgdGhpcy52aWV3Qm94RGltLndpZHRoO1xuXG4gICAgcmV0dXJuIGluaXRXaWR0aCAhPT0gdGhpcy52aWV3Qm94RGltLndpZHRoO1xuICB9XG5cbiAgaXNPdXRzaWRlVmlld0JveChsYWIpIHtcbiAgICBjb25zdCBsZWZ0ID0gbGFiLnggLSAobGFiLndpZHRoIC8gMik7XG4gICAgY29uc3QgcmlnaHQgPSBsYWIueCArIChsYWIud2lkdGggLyAyKTtcbiAgICBjb25zdCB0b3AgPSBsYWIueSAtIGxhYi5oZWlnaHQ7XG4gICAgY29uc3QgYm90ID0gbGFiLnk7XG5cbiAgICBpZiAoKGxlZnQgPCB0aGlzLnZpZXdCb3hEaW0ueCkgfHxcbiAgICAgICAgKHJpZ2h0ID4gKHRoaXMudmlld0JveERpbS54ICsgdGhpcy52aWV3Qm94RGltLndpZHRoKSkgfHxcbiAgICAgICAgKHRvcCA8IHRoaXMudmlld0JveERpbS55KSB8fFxuICAgICAgICAoYm90ID4gKHRoaXMudmlld0JveERpbS55ICsgdGhpcy52aWV3Qm94RGltLmhlaWdodCkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNMZWdlbmRQdE91dHNpZGVWaWV3Qm94KGxhYikge1xuICAgIGNvbnN0IGxlZnQgPSBsYWIueDtcbiAgICBjb25zdCByaWdodCA9IGxhYi54ICsgbGFiLndpZHRoO1xuICAgIGNvbnN0IHRvcCA9IGxhYi55IC0gbGFiLmhlaWdodDtcbiAgICBjb25zdCBib3QgPSBsYWIueTtcblxuICAgIGlmICgobGVmdCA8IHRoaXMudmlld0JveERpbS54KSB8fFxuICAgICAgICAocmlnaHQgPiAodGhpcy52aWV3Qm94RGltLnggKyB0aGlzLnZpZXdCb3hEaW0ud2lkdGgpKSB8fFxuICAgICAgICAodG9wIDwgdGhpcy52aWV3Qm94RGltLnkpIHx8XG4gICAgICAgIChib3QgPiAodGhpcy52aWV3Qm94RGltLnkgKyB0aGlzLnZpZXdCb3hEaW0uaGVpZ2h0KSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBhZGRFbGVtVG9MZWdlbmQoaWQpIHtcbiAgICBjb25zdCBjaGVja0lkID0gZSA9PiBlLmlkID09PSBpZDtcbiAgICBjb25zdCBtb3ZlZFB0ID0gXy5yZW1vdmUodGhpcy5wdHMsIGNoZWNrSWQpO1xuICAgIGNvbnN0IG1vdmVkTGFiID0gXy5yZW1vdmUodGhpcy5sYWIsIGNoZWNrSWQpO1xuICAgIHRoaXMubGVnZW5kUHRzLnB1c2goe1xuICAgICAgaWQsXG4gICAgICBwdDogbW92ZWRQdFswXSxcbiAgICAgIGxhYjogbW92ZWRMYWJbMF0sXG4gICAgICBhbmNob3I6ICdzdGFydCcsXG4gICAgICB0ZXh0OiBgJHttb3ZlZExhYlswXS50ZXh0fSAoJHttb3ZlZFB0WzBdLmxhYmVsWH0sICR7bW92ZWRQdFswXS5sYWJlbFl9KWAsXG4gICAgICBjb2xvcjogbW92ZWRQdFswXS5jb2xvcixcbiAgICAgIGlzRHJhZ2dlZFB0OiB0cnVlLFxuICAgIH0pO1xuLy8gICAgY29uc29sZS5sb2coXCJwdXNoZWQgbGVnZW5kUHQgOiAje0pTT04uc3RyaW5naWZ5KEBsZWdlbmRQdHNbQGxlZ2VuZFB0cy5sZW5ndGgtMV0pfVwiKVxuXG4gICAgdGhpcy5vdXRzaWRlUGxvdFB0c0lkLnB1c2goaWQpO1xuICAgIHRoaXMubm9ybWFsaXplRGF0YSgpO1xuICAgIHRoaXMuZ2V0UHRzQW5kTGFicygnUGxvdERhdGEuYWRkRWxlbVRvTGVnZW5kJyk7XG4gICAgdGhpcy5zZXR1cExlZ2VuZEdyb3Vwc0FuZFB0cygpO1xuICAgIHJldHVybiB0aGlzLmxlZ2VuZFJlcXVpcmVzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuXG4gIHJlbW92ZUVsZW1Gcm9tTGVnZW5kKGlkKSB7XG4gICAgY29uc3QgY2hlY2tJZCA9IGUgPT4gZS5pZCA9PT0gaWQ7XG4gICAgY29uc3QgbGVnZW5kUHQgPSBfLnJlbW92ZSh0aGlzLmxlZ2VuZFB0cywgY2hlY2tJZCk7XG4gICAgdGhpcy5wdHMucHVzaChsZWdlbmRQdC5wdCk7XG4gICAgdGhpcy5sYWIucHVzaChsZWdlbmRQdC5sYWIpO1xuXG4gICAgXy5yZW1vdmUodGhpcy5vdXRzaWRlUGxvdFB0c0lkLCBpID0+IGkgPT09IGlkKTtcbiAgICBfLnJlbW92ZSh0aGlzLm91dHNpZGVQbG90Q29uZGVuc2VkUHRzLCBpID0+IGkuZGF0YUlkID09PSBpZCk7XG5cbiAgICB0aGlzLm5vcm1hbGl6ZURhdGEoKTtcbiAgICB0aGlzLmdldFB0c0FuZExhYnMoJ1Bsb3REYXRhLnJlbW92ZUVsZW1Gcm9tTGVnZW5kJyk7XG4gICAgcmV0dXJuIHRoaXMuc2V0dXBMZWdlbmRHcm91cHNBbmRQdHMoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsb3REYXRhOyJdfQ==

//# sourceMappingURL=PlotData.es6.js.map