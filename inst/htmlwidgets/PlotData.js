// Generated by CoffeeScript 1.8.0
var PlotData;

PlotData = (function() {
  function PlotData(X, Y, group, label, viewBoxDim, legendDim, colors, fixedAspectRatio) {
    this.X = X;
    this.Y = Y;
    this.origX = X.slice(0);
    this.origY = Y.slice(0);
    this.normX = X.slice(0);
    this.normY = Y.slice(0);
    this.group = group;
    this.label = label;
    this.viewBoxDim = viewBoxDim;
    this.legendDim = legendDim;
    this.fixedAspectRatio = fixedAspectRatio;
    this.draggedOutPtsId = [];
    this.legendPts = [];
    this.draggedOutCondensedPts = [];
    this.colorWheel = colors ? colors : ['#5B9BD5', '#ED7D31', '#A5A5A5', '#1EC000', '#4472C4', '#70AD47', '#255E91', '#9E480E', '#636363', '#997300', '#264478', '#43682B', '#FF2323'];
    this.cIndex = 0;
    this.superscript = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    if (this.X.length === this.Y.length) {
      this.len = this.origLen = X.length;
      this.normalizeData(this);
      this.setupColors();
      this.calcDataArrays();
    } else {
      throw new Error("Inputs X and Y lengths do not match!");
    }
  }

  PlotData.prototype.normalizeData = function(data) {
    var condensedPtsDataIdArray, diff, draggedNormX, draggedNormY, i, id, lp, markerTextX, markerTextY, newMarkerId, notMovedX, notMovedY, numDigitsInId, ptsOut, rangeX, rangeY, thres, viewBoxDim, x1, x2, xThres, y1, y2, yThres, _i, _len, _ref, _results;
    viewBoxDim = data.viewBoxDim;
    ptsOut = this.draggedOutPtsId;
    notMovedX = _.filter(this.origX, function(val, key) {
      return !(_.includes(ptsOut, key));
    });
    notMovedY = _.filter(this.origY, function(val, key) {
      return !(_.includes(ptsOut, key));
    });
    this.minX = _.min(notMovedX);
    this.maxX = _.max(notMovedX);
    this.minY = _.min(notMovedY);
    this.maxY = _.max(notMovedY);
    thres = 0.08;
    xThres = thres * (this.maxX - this.minX);
    this.maxX = this.maxX < 0 ? 0 : this.maxX + xThres;
    this.minX = this.minX > 0 ? 0 : this.minX - xThres;
    yThres = thres * (this.maxY - this.minY);
    this.maxY = this.maxY < 0 ? 0 : this.maxY + yThres;
    this.minY = this.minY > 0 ? 0 : this.minY - yThres;
    if (this.fixedAspectRatio) {
      rangeX = this.maxX - this.minX;
      rangeY = this.maxY - this.minY;
      diff = Math.abs(rangeX - rangeY);
      if (rangeX > rangeY) {
        this.maxY += diff / 2;
        this.minY -= diff / 2;
      } else if (rangeY > rangeX) {
        this.maxX += diff / 2;
        this.minX -= diff / 2;
      }
    }
    this.draggedOutMarkers = [];
    this.draggedOutMarkersIter = 0;
    _ref = this.legendPts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      lp = _ref[_i];
      id = lp.pt.id;
      draggedNormX = (this.X[id] - this.minX) / (this.maxX - this.minX);
      draggedNormY = (this.Y[id] - this.minY) / (this.maxY - this.minY);
      newMarkerId = this.draggedOutMarkersIter;
      lp.markerId = newMarkerId;
      if (Math.abs(draggedNormX) > 1 || Math.abs(draggedNormY) > 1 || draggedNormX < 0 || draggedNormY < 0) {
        draggedNormX = draggedNormX > 1 ? 1 : draggedNormX;
        draggedNormX = draggedNormX < 0 ? 0 : draggedNormX;
        draggedNormY = draggedNormY > 1 ? 1 : draggedNormY;
        draggedNormY = draggedNormY < 0 ? 0 : draggedNormY;
        x2 = draggedNormX * viewBoxDim.width + viewBoxDim.x;
        y2 = (1 - draggedNormY) * viewBoxDim.height + viewBoxDim.y;
        markerTextX = markerTextY = 0;
        numDigitsInId = Math.ceil(Math.log(newMarkerId + 1.1) / Math.LN10);
        if (draggedNormX === 1) {
          x1 = x2 + this.legendDim.markerLen;
          y1 = y2;
          markerTextX = x1;
          markerTextY = y1 + this.legendDim.markerTextSize / 2;
        } else if (draggedNormX === 0) {
          x1 = x2 - this.legendDim.markerLen;
          y1 = y2;
          markerTextX = x1 - this.legendDim.markerCharWidth * (numDigitsInId + 1);
          markerTextY = y1 + this.legendDim.markerTextSize / 2;
        } else if (draggedNormY === 1) {
          x1 = x2;
          y1 = y2 + -draggedNormY * this.legendDim.markerLen;
          markerTextX = x1 - this.legendDim.markerCharWidth * numDigitsInId;
          markerTextY = y1;
        } else if (draggedNormY === 0) {
          x1 = x2;
          y1 = y2 + this.legendDim.markerLen;
          markerTextX = x1 - this.legendDim.markerCharWidth * numDigitsInId;
          markerTextY = y1 + this.legendDim.markerTextSize;
        }
        this.draggedOutMarkers.push({
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
        this.draggedOutCondensedPts = _.filter(this.draggedOutCondensedPts, function(e) {
          return e.dataId !== id;
        });
        this.len = this.origLen - this.draggedOutMarkers.length;
      } else {
        console.log("Condensed point added");
        condensedPtsDataIdArray = _.map(this.draggedOutCondensedPts, function(e) {
          return e.dataId;
        });
        if (!_.includes(condensedPtsDataIdArray, id)) {
          this.draggedOutCondensedPts.push({
            dataId: id,
            markerId: newMarkerId
          });
        }
      }
      this.draggedOutMarkersIter++;
    }
    i = 0;
    _results = [];
    while (i < this.origLen) {
      this.normX[i] = (this.X[i] - this.minX) / (this.maxX - this.minX);
      this.normY[i] = (this.Y[i] - this.minY) / (this.maxY - this.minY);
      _results.push(i++);
    }
    return _results;
  };

  PlotData.prototype.setupColors = function() {
    var group, i, newColor, _results;
    this.legendGroups = [];
    this.groupToColorMap = {};
    group = this.group;
    i = 0;
    _results = [];
    while (i < this.len) {
      if (!(_.some(this.legendGroups, function(e) {
        return e.text === group[i];
      }))) {
        newColor = this.getDefaultColor();
        this.legendGroups.push({
          text: this.group[i],
          color: newColor,
          r: this.legendDim.ptRadius,
          anchor: 'start'
        });
        this.groupToColorMap[this.group[i]] = newColor;
      }
      _results.push(i++);
    }
    return _results;
  };

  PlotData.prototype.calcDataArrays = function() {
    var fontSize, i, label, pt, x, y, _results;
    this.pts = [];
    this.lab = [];
    this.anc = [];
    i = 0;
    _results = [];
    while (i < this.origLen) {
      if ((!_.includes(this.draggedOutPtsId, i)) || _.includes(_.map(this.draggedOutCondensedPts, function(e) {
        return e.dataId;
      }), i)) {
        x = this.normX[i] * this.viewBoxDim.width + this.viewBoxDim.x;
        y = (1 - this.normY[i]) * this.viewBoxDim.height + this.viewBoxDim.y;
        label = this.label[i];
        fontSize = this.viewBoxDim.labelFontSize;
        if (_.includes(_.map(this.draggedOutCondensedPts, function(e) {
          return e.dataId;
        }), i)) {
          pt = _.find(this.draggedOutCondensedPts, function(e) {
            return e.dataId === i;
          });
          label = pt.markerId + 1;
          fontSize = this.viewBoxDim.labelSmallFontSize;
        }
        this.pts.push({
          x: x,
          y: y,
          r: 2,
          label: label,
          labelX: this.origX[i].toPrecision(3).toString(),
          labelY: this.origY[i].toPrecision(3).toString(),
          group: this.group[i],
          color: this.groupToColorMap[this.group[i]],
          id: i
        });
        this.lab.push({
          x: x,
          y: y,
          text: label,
          color: this.groupToColorMap[this.group[i]],
          id: i,
          fontSize: fontSize
        });
        this.anc.push({
          x: x,
          y: y,
          r: 2,
          id: i
        });
      }
      _results.push(i++);
    }
    return _results;
  };

  PlotData.prototype.setLegendItemsPositions = function(data, numItems, itemsArray, cols) {
    var colSpacing, currentCol, exceededCurrentCol, i, legendDim, legendStartY, li, numElemsInCol, numItemsInPrevCols, plottedEvenBalanceOfItemsBtwnCols, startOfCenteredLegendItems, startOfViewBox, totalItemsSpacingExceedLegendArea, viewBoxDim, _results;
    legendDim = data.legendDim;
    viewBoxDim = data.viewBoxDim;
    startOfCenteredLegendItems = viewBoxDim.y + viewBoxDim.height / 2 - legendDim.heightOfRow * (numItems / cols) / 2 + legendDim.ptRadius;
    startOfViewBox = viewBoxDim.y + legendDim.ptRadius;
    legendStartY = Math.max(startOfCenteredLegendItems, startOfViewBox);
    colSpacing = 0;
    numItemsInPrevCols = 0;
    i = 0;
    currentCol = 1;
    _results = [];
    while (i < numItems) {
      if (cols > 1) {
        numElemsInCol = numItems / cols;
        exceededCurrentCol = legendStartY + (i - numItemsInPrevCols) * legendDim.heightOfRow > viewBoxDim.y + viewBoxDim.height;
        plottedEvenBalanceOfItemsBtwnCols = i >= numElemsInCol * currentCol;
        if (exceededCurrentCol || plottedEvenBalanceOfItemsBtwnCols) {
          colSpacing = (legendDim.colSpace + legendDim.ptRadius * 2 + legendDim.ptToTextSpace) * currentCol;
          numItemsInPrevCols = i;
          currentCol++;
        }
        totalItemsSpacingExceedLegendArea = legendStartY + (i - numItemsInPrevCols) * legendDim.heightOfRow > viewBoxDim.y + viewBoxDim.height;
        if (totalItemsSpacingExceedLegendArea) {
          break;
        }
      }
      li = itemsArray[i];
      if (li.isDraggedPt) {
        li.x = legendDim.x + legendDim.leftPadding + colSpacing;
        li.y = legendStartY + (i - numItemsInPrevCols) * legendDim.heightOfRow;
      } else {
        li.cx = legendDim.x + legendDim.leftPadding + colSpacing + li.r;
        li.cy = legendStartY + (i - numItemsInPrevCols) * legendDim.heightOfRow;
        li.x = li.cx + legendDim.ptToTextSpace;
        li.y = li.cy + li.r;
      }
      _results.push(i++);
    }
    return _results;
  };

  PlotData.prototype.setupLegendGroupsAndPts = function(data) {
    var i, j, legendDim, legendGroups, legendItemArray, legendPts, totalLegendItems;
    legendGroups = data.legendGroups;
    legendDim = data.legendDim;
    legendPts = data.legendPts;
    if (legendPts.length > 0) {
      totalLegendItems = legendGroups.length + legendPts.length;
      legendItemArray = [];
      i = 0;
      j = 0;
      while (i < totalLegendItems) {
        if (i < legendGroups.length) {
          legendItemArray.push(legendGroups[i]);
        } else {
          j = i - legendGroups.length;
          legendItemArray.push(legendPts[j]);
        }
        i++;
      }
      return data.setLegendItemsPositions(data, totalLegendItems, legendItemArray, legendDim.cols);
    } else {
      return this.setLegendItemsPositions(this, legendGroups.length, legendGroups, legendDim.cols);
    }
  };

  PlotData.prototype.resizedAfterLegendGroupsDrawn = function() {
    var initWidth, legendGrpsTextMax, legendPtsTextMax, maxTextWidth, spacingAroundMaxTextWidth, totalLegendItems;
    initWidth = this.viewBoxDim.width;
    totalLegendItems = this.legendGroups.length + this.legendPts.length;
    legendGrpsTextMax = (_.maxBy(this.legendGroups, function(e) {
      return e.width;
    })).width;
    legendPtsTextMax = this.legendPts.length > 0 ? (_.maxBy(this.legendPts, function(e) {
      return e.width;
    })).width : 0;
    maxTextWidth = Math.max(legendGrpsTextMax, legendPtsTextMax);
    spacingAroundMaxTextWidth = this.legendDim.leftPadding + this.legendDim.ptRadius * 2 + this.legendDim.rightPadding + this.legendDim.ptToTextSpace;
    this.legendDim.cols = Math.ceil(totalLegendItems * this.legendDim.heightOfRow / this.viewBoxDim.height);
    this.legendDim.width = maxTextWidth * this.legendDim.cols + spacingAroundMaxTextWidth + this.legendDim.centerPadding * (this.legendDim.cols - 1);
    this.legendDim.colSpace = maxTextWidth;
    this.viewBoxDim.width = this.viewBoxDim.svgWidth - this.legendDim.width - this.viewBoxDim.x;
    this.legendDim.x = this.viewBoxDim.x + this.viewBoxDim.width;
    this.setupLegendGroupsAndPts(this);
    return initWidth !== this.viewBoxDim.width;
  };

  PlotData.prototype.getDefaultColor = function() {
    return this.colorWheel[(this.cIndex++) % this.colorWheel.length];
  };

  PlotData.prototype.isOutsideViewBox = function(lab) {
    var bot, left, right, top;
    left = lab.x - lab.width / 2;
    right = lab.x + lab.width / 2;
    top = lab.y - lab.height;
    bot = lab.y;
    if (left < this.viewBoxDim.x || right > this.viewBoxDim.x + this.viewBoxDim.width || top < this.viewBoxDim.y || bot > this.viewBoxDim.y + this.viewBoxDim.height) {
      return true;
    }
    return false;
  };

  PlotData.prototype.moveElemToLegend = function(id, data) {
    var checkId, movedAnc, movedLab, movedPt;
    checkId = function(e) {
      return e.id === id;
    };
    movedPt = _.remove(this.pts, checkId);
    movedLab = _.remove(this.lab, checkId);
    movedAnc = _.remove(this.anc, checkId);
    data.legendPts.push({
      pt: movedPt[0],
      lab: movedLab[0],
      anc: movedAnc[0],
      anchor: 'start',
      text: movedPt[0].label + ' (' + movedPt[0].labelX + ', ' + movedPt[0].labelY + ')',
      yOffset: this.legendDim.yPtOffset,
      color: movedPt[0].color,
      isDraggedPt: true
    });
    this.draggedOutPtsId.push(id);
    this.normalizeData(data);
    this.calcDataArrays();
    return this.setupLegendGroupsAndPts(this);
  };

  return PlotData;

})();
