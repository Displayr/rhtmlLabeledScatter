(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AxisUtils = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global Utils */
// import Utils from './Utils.es6';

/* To Refactor:
 *  * marker leader lines + labels can surely be grouped or at least the lines can be derived at presentation time
 */

var AxisUtils = function () {
  function AxisUtils() {
    _classCallCheck(this, AxisUtils);
  }

  // Calc tick increments - http://stackoverflow.com/questions/326679/choosing-an-attractive-linear-scale-for-a-graphs-y-axis
  AxisUtils._getTickRange = function _getTickRange(max, min) {
    var maxTicks = 8;
    var range = max - min;
    var unroundedTickSize = range / (maxTicks - 1);

    var pow10x = 10 ** Math.ceil(Math.log(unroundedTickSize) / Math.LN10 - 1);
    var roundedTickRange = Math.ceil(unroundedTickSize / pow10x) * pow10x;
    return roundedTickRange;
  };

  AxisUtils._between = function _between(num, min, max) {
    return num >= min && num <= max;
  };

  AxisUtils._normalizeXCoords = function _normalizeXCoords(data, Xcoord) {
    var viewBoxDim = data.viewBoxDim;

    return (Xcoord - data.minX) / (data.maxX - data.minX) * viewBoxDim.width + viewBoxDim.x;
  };

  AxisUtils._normalizeYCoords = function _normalizeYCoords(data, Ycoord) {
    var viewBoxDim = data.viewBoxDim;

    return -(Ycoord - data.minY) / (data.maxY - data.minY) * viewBoxDim.height + viewBoxDim.y + viewBoxDim.height;
  };

  // TODO KZ calculation of x axis and y axis are independent ? If so, then split into a reusable function


  AxisUtils.getAxisDataArrays = function getAxisDataArrays(plot, data, viewBoxDim) {
    // exit if all points have been dragged off plot
    if (!(data.len > 0)) {
      return {};
    }

    var dimensionMarkerStack = [];
    var dimensionMarkerLeaderStack = [];
    var dimensionMarkerLabelStack = [];

    var pushDimensionMarker = function pushDimensionMarker(type, x1, y1, x2, y2, label) {
      var leaderLineLen = plot.axisLeaderLineLength;
      var labelHeight = _.max([plot.axisDimensionText.rowMaxHeight, plot.axisDimensionText.colMaxHeight]);
      var xDecimals = plot.xDecimals,
          yDecimals = plot.yDecimals,
          xPrefix = plot.xPrefix,
          yPrefix = plot.yPrefix,
          xSuffix = plot.xSuffix,
          ySuffix = plot.ySuffix;


      if (type === 'col') {
        dimensionMarkerLeaderStack.push({
          x1: x1,
          y1: y2,
          x2: x1,
          y2: y2 + leaderLineLen
        });
        dimensionMarkerLabelStack.push({
          x: x1,
          y: y2 + leaderLineLen + labelHeight,
          label: Utils.getFormattedNum(label, xDecimals, xPrefix, xSuffix),
          anchor: 'middle',
          type: type
        });
      }

      if (type === 'row') {
        dimensionMarkerLeaderStack.push({
          x1: x1 - leaderLineLen,
          y1: y1,
          x2: x1,
          y2: y2
        });
        dimensionMarkerLabelStack.push({
          x: x1 - leaderLineLen,
          y: y2 + labelHeight / 3,
          label: Utils.getFormattedNum(label, yDecimals, yPrefix, ySuffix),
          anchor: 'end',
          type: type
        });
      }
    };

    // TODO KZ (another) Unecessary call to calculateMinMax ??
    data.calculateMinMax();

    var ticksX = null;
    var ticksY = null;

    if (Utils.isNum(plot.xBoundsUnitsMajor)) {
      ticksX = plot.xBoundsUnitsMajor / 2;
    } else {
      ticksX = this._getTickRange(data.maxX, data.minX);
    }

    if (Utils.isNum(plot.yBoundsUnitsMajor)) {
      ticksY = plot.yBoundsUnitsMajor / 2;
    } else {
      ticksY = this._getTickRange(data.maxY, data.minY);
    }

    // Compute origins if they are within bounds

    var originAxis = [];
    var yCoordOfXAxisOrigin = this._normalizeYCoords(data, 0);
    if (yCoordOfXAxisOrigin <= viewBoxDim.y + viewBoxDim.height && yCoordOfXAxisOrigin >= viewBoxDim.y) {
      var xAxisOrigin = {
        x1: viewBoxDim.x,
        y1: yCoordOfXAxisOrigin,
        x2: viewBoxDim.x + viewBoxDim.width,
        y2: yCoordOfXAxisOrigin
      };
      pushDimensionMarker('row', xAxisOrigin.x1, xAxisOrigin.y1, xAxisOrigin.x2, xAxisOrigin.y2, 0);
      if (data.minY !== 0 && data.maxY !== 0) {
        originAxis.push(xAxisOrigin);
      }
    }

    var xCoordOfYAxisOrigin = this._normalizeXCoords(data, 0);
    if (xCoordOfYAxisOrigin >= viewBoxDim.x && xCoordOfYAxisOrigin <= viewBoxDim.x + viewBoxDim.width) {
      var yAxisOrigin = {
        x1: xCoordOfYAxisOrigin,
        y1: viewBoxDim.y,
        x2: xCoordOfYAxisOrigin,
        y2: viewBoxDim.y + viewBoxDim.height
      };
      pushDimensionMarker('col', yAxisOrigin.x1, yAxisOrigin.y1, yAxisOrigin.x2, yAxisOrigin.y2, 0);
      if (data.minX !== 0 && data.maxX !== 0) {
        originAxis.push(yAxisOrigin);
      }
    }

    // calculate number of dimension markers

    var colsPositive = 0;
    var colsNegative = 0;
    if (this._between(0, data.minX, data.maxX)) {
      colsPositive = data.maxX / ticksX - 1;
      colsNegative = Math.abs(data.minX / ticksX) - 1;
    } else {
      var numColumns = (data.maxX - data.minX) / ticksX;
      if (data.minX < 0) {
        colsNegative = numColumns;
        colsPositive = 0;
      } else {
        colsNegative = 0;
        colsPositive = numColumns;
      }
    }

    var rowsPositive = 0;
    var rowsNegative = 0;
    if (this._between(0, data.minY, data.maxY)) {
      rowsPositive = Math.abs(data.minY / ticksY) - 1;
      rowsNegative = data.maxY / ticksY - 1;
    } else {
      var numRows = (data.maxY - data.minY) / ticksY;
      if (data.minY < 0) {
        rowsNegative = 0;
        rowsPositive = numRows;
      } else {
        rowsNegative = numRows;
        rowsPositive = 0;
      }
    }

    var i = 0;
    while (i < Math.max(colsPositive, colsNegative)) {
      var val = void 0,
          x1 = void 0,
          x2 = void 0,
          y1 = void 0,
          y2 = null;

      if (i < colsPositive) {
        val = (i + 1) * ticksX;
        if (!this._between(0, data.minX, data.maxX)) {
          val = data.minX + i * ticksX;
        }
        x1 = this._normalizeXCoords(data, val);
        y1 = viewBoxDim.y;
        x2 = this._normalizeXCoords(data, val);
        y2 = viewBoxDim.y + viewBoxDim.height;

        dimensionMarkerStack.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
        if (i % 2) {
          pushDimensionMarker('col', x1, y1, x2, y2, val.toPrecision(14));
        }
      }

      if (i < colsNegative) {
        val = -(i + 1) * ticksX;
        x1 = this._normalizeXCoords(data, val);
        y1 = viewBoxDim.y;
        x2 = this._normalizeXCoords(data, val);
        y2 = viewBoxDim.y + viewBoxDim.height;
        dimensionMarkerStack.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
        if (i % 2) {
          pushDimensionMarker('col', x1, y1, x2, y2, val.toPrecision(14));
        }
      }
      i++;
    }

    i = 0;
    while (i < Math.max(rowsPositive, rowsNegative)) {
      var _val = void 0,
          _x = void 0,
          _x2 = void 0,
          _y = void 0,
          _y2 = null;

      if (i < rowsPositive) {
        _val = -(i + 1) * ticksY;
        _x = viewBoxDim.x;
        _y = this._normalizeYCoords(data, _val);
        _x2 = viewBoxDim.x + viewBoxDim.width;
        _y2 = this._normalizeYCoords(data, _val);
        dimensionMarkerStack.push({ x1: _x, y1: _y, x2: _x2, y2: _y2 });
        if (i % 2) {
          pushDimensionMarker('row', _x, _y, _x2, _y2, _val.toPrecision(14));
        }
      }

      if (i < rowsNegative) {
        _val = (i + 1) * ticksY;
        if (!this._between(0, data.minY, data.maxY)) {
          _val = data.minY + i * ticksY;
        }
        _x = viewBoxDim.x;
        _y = this._normalizeYCoords(data, _val);
        _x2 = viewBoxDim.x + viewBoxDim.width;
        _y2 = this._normalizeYCoords(data, _val);
        dimensionMarkerStack.push({ x1: _x, y1: _y, x2: _x2, y2: _y2 });
        if (i % 2) {
          pushDimensionMarker('row', _x, _y, _x2, _y2, _val.toPrecision(14));
        }
      }
      i++;
    }

    return {
      gridOrigin: originAxis,
      gridLines: dimensionMarkerStack,
      axisLeader: dimensionMarkerLeaderStack,
      axisLeaderLabel: dimensionMarkerLabelStack
    };
  };

  return AxisUtils;
}();

module.exports = AxisUtils;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy91dGlscy9BeGlzVXRpbHMuZXM2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0NBO0FBQ0E7O0FBRUE7Ozs7SUFJTSxTOzs7OztBQUVKO1lBQ08sYSwwQkFBYyxHLEVBQUssRyxFQUFLO0FBQzdCLFFBQU0sV0FBVyxDQUFqQjtBQUNBLFFBQU0sUUFBUSxNQUFNLEdBQXBCO0FBQ0EsUUFBTSxvQkFBb0IsU0FBUyxXQUFXLENBQXBCLENBQTFCOztBQUVBLFFBQU0sU0FBUyxNQUFPLEtBQUssSUFBTCxDQUFXLEtBQUssR0FBTCxDQUFTLGlCQUFULElBQThCLEtBQUssSUFBcEMsR0FBNEMsQ0FBdEQsQ0FBdEI7QUFDQSxRQUFNLG1CQUFtQixLQUFLLElBQUwsQ0FBVSxvQkFBb0IsTUFBOUIsSUFBd0MsTUFBakU7QUFDQSxXQUFPLGdCQUFQO0FBQ0QsRzs7WUFFTSxRLHFCQUFTLEcsRUFBSyxHLEVBQUssRyxFQUFLO0FBQzdCLFdBQVEsT0FBTyxHQUFSLElBQWlCLE9BQU8sR0FBL0I7QUFDRCxHOztZQUVNLGlCLDhCQUFrQixJLEVBQU0sTSxFQUFRO0FBQUEsUUFDN0IsVUFENkIsR0FDZCxJQURjLENBQzdCLFVBRDZCOztBQUVyQyxXQUFTLENBQUMsU0FBUyxLQUFLLElBQWYsS0FBd0IsS0FBSyxJQUFMLEdBQVksS0FBSyxJQUF6QyxDQUFELEdBQW1ELFdBQVcsS0FBL0QsR0FBd0UsV0FBVyxDQUExRjtBQUNELEc7O1lBRU0saUIsOEJBQWtCLEksRUFBTSxNLEVBQVE7QUFBQSxRQUM3QixVQUQ2QixHQUNkLElBRGMsQ0FDN0IsVUFENkI7O0FBRXJDLFdBQVMsRUFBRSxTQUFTLEtBQUssSUFBaEIsS0FBeUIsS0FBSyxJQUFMLEdBQVksS0FBSyxJQUExQyxDQUFELEdBQW9ELFdBQVcsTUFBaEUsR0FBMEUsV0FBVyxDQUFyRixHQUF5RixXQUFX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QWhCO0FBQ0EsYUFBSyxLQUFLLGlCQUFMLENBQXVCLElBQXZCLEVBQTZCLElBQTdCLENBQUw7QUFDQSxjQUFLLFdBQVcsQ0FBWCxHQUFlLFdBQVcsS0FBL0I7QUFDQSxjQUFLLEtBQUssaUJBQUwsQ0FBdUIsSUFBdkIsRUFBNkIsSUFBN0IsQ0FBTDtBQUNBLDZCQUFxQixJQUFyQixDQUEwQixFQUFFLE1BQUYsRUFBTSxNQUFOLEVBQVUsT0FBVixFQUFjLE9BQWQsRUFBMUI7QUFDQSxZQUFJLElBQUksQ0FBUixFQUFXO0FBQ1QsOEJBQW9CLEtBQXBCLEVBQTJCLEVBQTNCLEVBQStCLEVBQS9CLEVBQW1DLEdBQW5DLEVBQXVDLEdBQXZDLEVBQTJDLEtBQUksV0FBSixDQUFnQixFQUFoQixDQUEzQztBQUNEO0FBQ0Y7QUFDRDtBQUNEOztBQUVELFdBQU87QUFDTCxrQkFBWSxVQURQO0FBRUwsaUJBQVcsb0JBRk47QUFHTCxrQkFBWSwwQkFIUDtBQUlMLHVCQUFpQjtBQUpaLEtBQVA7QUFNRCxHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixTQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qIGdsb2JhbCBVdGlscyAqL1xuLy8gaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuZXM2JztcblxuLyogVG8gUmVmYWN0b3I6XG4gKiAgKiBtYXJrZXIgbGVhZGVyIGxpbmVzICsgbGFiZWxzIGNhbiBzdXJlbHkgYmUgZ3JvdXBlZCBvciBhdCBsZWFzdCB0aGUgbGluZXMgY2FuIGJlIGRlcml2ZWQgYXQgcHJlc2VudGF0aW9uIHRpbWVcbiAqL1xuXG5jbGFzcyBBeGlzVXRpbHMge1xuXG4gIC8vIENhbGMgdGljayBpbmNyZW1lbnRzIC0gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMjY2NzkvY2hvb3NpbmctYW4tYXR0cmFjdGl2ZS1saW5lYXItc2NhbGUtZm9yLWEtZ3JhcGhzLXktYXhpc1xuICBzdGF0aWMgX2dldFRpY2tSYW5nZShtYXgsIG1pbikge1xuICAgIGNvbnN0IG1heFRpY2tzID0gODtcbiAgICBjb25zdCByYW5nZSA9IG1heCAtIG1pbjtcbiAgICBjb25zdCB1bnJvdW5kZWRUaWNrU2l6ZSA9IHJhbmdlIC8gKG1heFRpY2tzIC0gMSk7XG5cbiAgICBjb25zdCBwb3cxMHggPSAxMCAqKiAoTWF0aC5jZWlsKChNYXRoLmxvZyh1bnJvdW5kZWRUaWNrU2l6ZSkgLyBNYXRoLkxOMTApIC0gMSkpO1xuICAgIGNvbnN0IHJvdW5kZWRUaWNrUmFuZ2UgPSBNYXRoLmNlaWwodW5yb3VuZGVkVGlja1NpemUgLyBwb3cxMHgpICogcG93MTB4O1xuICAgIHJldHVybiByb3VuZGVkVGlja1JhbmdlO1xuICB9XG5cbiAgc3RhdGljIF9iZXR3ZWVuKG51bSwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gKG51bSA+PSBtaW4pICYmIChudW0gPD0gbWF4KTtcbiAgfVxuXG4gIHN0YXRpYyBfbm9ybWFsaXplWENvb3JkcyhkYXRhLCBYY29vcmQpIHtcbiAgICBjb25zdCB7IHZpZXdCb3hEaW0gfSA9IGRhdGE7XG4gICAgcmV0dXJuICgoKFhjb29yZCAtIGRhdGEubWluWCkgLyAoZGF0YS5tYXhYIC0gZGF0YS5taW5YKSkgKiB2aWV3Qm94RGltLndpZHRoKSArIHZpZXdCb3hEaW0ueDtcbiAgfVxuXG4gIHN0YXRpYyBfbm9ybWFsaXplWUNvb3JkcyhkYXRhLCBZY29vcmQpIHtcbiAgICBjb25zdCB7IHZpZXdCb3hEaW0gfSA9IGRhdGE7XG4gICAgcmV0dXJuICgoLShZY29vcmQgLSBkYXRhLm1pblkpIC8gKGRhdGEubWF4WSAtIGRhdGEubWluWSkpICogdmlld0JveERpbS5oZWlnaHQpICsgdmlld0JveERpbS55ICsgdmlld0JveERpbS5oZWlnaHQ7XG4gIH1cblxuICAvLyBUT0RPIEtaIGNhbGN1bGF0aW9uIG9mIHggYXhpcyBhbmQgeSBheGlzIGFyZSBpbmRlcGVuZGVudCA/IElmIHNvLCB0aGVuIHNwbGl0IGludG8gYSByZXVzYWJsZSBmdW5jdGlvblxuICBzdGF0aWMgZ2V0QXhpc0RhdGFBcnJheXMocGxvdCwgZGF0YSwgdmlld0JveERpbSkge1xuICAgIC8vIGV4aXQgaWYgYWxsIHBvaW50cyBoYXZlIGJlZW4gZHJhZ2dlZCBvZmYgcGxvdFxuICAgIGlmICghKGRhdGEubGVuID4gMCkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBjb25zdCBkaW1lbnNpb25NYXJrZXJTdGFjayA9IFtdO1xuICAgIGNvbnN0IGRpbWVuc2lvbk1hcmtlckxlYWRlclN0YWNrID0gW107XG4gICAgY29uc3QgZGltZW5zaW9uTWFya2VyTGFiZWxTdGFjayA9IFtdO1xuXG4gICAgY29uc3QgcHVzaERpbWVuc2lvbk1hcmtlciA9IGZ1bmN0aW9uICh0eXBlLCB4MSwgeTEsIHgyLCB5MiwgbGFiZWwpIHtcbiAgICAgIGNvbnN0IGxlYWRlckxpbmVMZW4gPSBwbG90LmF4aXNMZWFkZXJMaW5lTGVuZ3RoO1xuICAgICAgY29uc3QgbGFiZWxIZWlnaHQgPSBfLm1heChbcGxvdC5heGlzRGltZW5zaW9uVGV4dC5yb3dNYXhIZWlnaHQsIHBsb3QuYXhpc0RpbWVuc2lvblRleHQuY29sTWF4SGVpZ2h0XSk7XG4gICAgICBjb25zdCB7IHhEZWNpbWFscywgeURlY2ltYWxzLCB4UHJlZml4LCB5UHJlZml4LCB4U3VmZml4LCB5U3VmZml4IH0gPSBwbG90O1xuXG4gICAgICBpZiAodHlwZSA9PT0gJ2NvbCcpIHtcbiAgICAgICAgZGltZW5zaW9uTWFya2VyTGVhZGVyU3RhY2sucHVzaCh7XG4gICAgICAgICAgeDEsXG4gICAgICAgICAgeTE6IHkyLFxuICAgICAgICAgIHgyOiB4MSxcbiAgICAgICAgICB5MjogeTIgKyBsZWFkZXJMaW5lTGVuLFxuICAgICAgICB9KTtcbiAgICAgICAgZGltZW5zaW9uTWFya2VyTGFiZWxTdGFjay5wdXNoKHtcbiAgICAgICAgICB4OiB4MSxcbiAgICAgICAgICB5OiB5MiArIGxlYWRlckxpbmVMZW4gKyBsYWJlbEhlaWdodCxcbiAgICAgICAgICBsYWJlbDogVXRpbHMuZ2V0Rm9ybWF0dGVkTnVtKGxhYmVsLCB4RGVjaW1hbHMsIHhQcmVmaXgsIHhTdWZmaXgpLFxuICAgICAgICAgIGFuY2hvcjogJ21pZGRsZScsXG4gICAgICAgICAgdHlwZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09PSAncm93Jykge1xuICAgICAgICBkaW1lbnNpb25NYXJrZXJMZWFkZXJTdGFjay5wdXNoKHtcbiAgICAgICAgICB4MTogeDEgLSBsZWFkZXJMaW5lTGVuLFxuICAgICAgICAgIHkxLFxuICAgICAgICAgIHgyOiB4MSxcbiAgICAgICAgICB5MixcbiAgICAgICAgfSk7XG4gICAgICAgIGRpbWVuc2lvbk1hcmtlckxhYmVsU3RhY2sucHVzaCh7XG4gICAgICAgICAgeDogeDEgLSBsZWFkZXJMaW5lTGVuLFxuICAgICAgICAgIHk6IHkyICsgKGxhYmVsSGVpZ2h0IC8gMyksXG4gICAgICAgICAgbGFiZWw6IFV0aWxzLmdldEZvcm1hdHRlZE51bShsYWJlbCwgeURlY2ltYWxzLCB5UHJlZml4LCB5U3VmZml4KSxcbiAgICAgICAgICBhbmNob3I6ICdlbmQnLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUT0RPIEtaIChhbm90aGVyKSBVbmVjZXNzYXJ5IGNhbGwgdG8gY2FsY3VsYXRlTWluTWF4ID8/XG4gICAgZGF0YS5jYWxjdWxhdGVNaW5NYXgoKTtcblxuICAgIGxldCB0aWNrc1ggPSBudWxsO1xuICAgIGxldCB0aWNrc1kgPSBudWxsO1xuXG4gICAgaWYgKFV0aWxzLmlzTnVtKHBsb3QueEJvdW5kc1VuaXRzTWFqb3IpKSB7XG4gICAgICB0aWNrc1ggPSBwbG90LnhCb3VuZHNVbml0c01ham9yIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGlja3NYID0gdGhpcy5fZ2V0VGlja1JhbmdlKGRhdGEubWF4WCwgZGF0YS5taW5YKTtcbiAgICB9XG5cbiAgICBpZiAoVXRpbHMuaXNOdW0ocGxvdC55Qm91bmRzVW5pdHNNYWpvcikpIHtcbiAgICAgIHRpY2tzWSA9IHBsb3QueUJvdW5kc1VuaXRzTWFqb3IgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aWNrc1kgPSB0aGlzLl9nZXRUaWNrUmFuZ2UoZGF0YS5tYXhZLCBkYXRhLm1pblkpO1xuICAgIH1cblxuICAgIC8vIENvbXB1dGUgb3JpZ2lucyBpZiB0aGV5IGFyZSB3aXRoaW4gYm91bmRzXG5cbiAgICBjb25zdCBvcmlnaW5BeGlzID0gW107XG4gICAgY29uc3QgeUNvb3JkT2ZYQXhpc09yaWdpbiA9IHRoaXMuX25vcm1hbGl6ZVlDb29yZHMoZGF0YSwgMCk7XG4gICAgaWYgKCh5Q29vcmRPZlhBeGlzT3JpZ2luIDw9ICh2aWV3Qm94RGltLnkgKyB2aWV3Qm94RGltLmhlaWdodCkpICYmICh5Q29vcmRPZlhBeGlzT3JpZ2luID49IHZpZXdCb3hEaW0ueSkpIHtcbiAgICAgIGNvbnN0IHhBeGlzT3JpZ2luID0ge1xuICAgICAgICB4MTogdmlld0JveERpbS54LFxuICAgICAgICB5MTogeUNvb3JkT2ZYQXhpc09yaWdpbixcbiAgICAgICAgeDI6IHZpZXdCb3hEaW0ueCArIHZpZXdCb3hEaW0ud2lkdGgsXG4gICAgICAgIHkyOiB5Q29vcmRPZlhBeGlzT3JpZ2luLFxuICAgICAgfTtcbiAgICAgIHB1c2hEaW1lbnNpb25NYXJrZXIoJ3JvdycsIHhBeGlzT3JpZ2luLngxLCB4QXhpc09yaWdpbi55MSwgeEF4aXNPcmlnaW4ueDIsIHhBeGlzT3JpZ2luLnkyLCAwKTtcbiAgICAgIGlmICgoZGF0YS5taW5ZICE9PSAwKSAmJiAoZGF0YS5tYXhZICE9PSAwKSkge1xuICAgICAgICBvcmlnaW5BeGlzLnB1c2goeEF4aXNPcmlnaW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHhDb29yZE9mWUF4aXNPcmlnaW4gPSB0aGlzLl9ub3JtYWxpemVYQ29vcmRzKGRhdGEsIDApO1xuICAgIGlmICgoeENvb3JkT2ZZQXhpc09yaWdpbiA+PSB2aWV3Qm94RGltLngpICYmICh4Q29vcmRPZllBeGlzT3JpZ2luIDw9ICh2aWV3Qm94RGltLnggKyB2aWV3Qm94RGltLndpZHRoKSkpIHtcbiAgICAgIGNvbnN0IHlBeGlzT3JpZ2luID0ge1xuICAgICAgICB4MTogeENvb3JkT2ZZQXhpc09yaWdpbixcbiAgICAgICAgeTE6IHZpZXdCb3hEaW0ueSxcbiAgICAgICAgeDI6IHhDb29yZE9mWUF4aXNPcmlnaW4sXG4gICAgICAgIHkyOiB2aWV3Qm94RGltLnkgKyB2aWV3Qm94RGltLmhlaWdodCxcbiAgICAgIH07XG4gICAgICBwdXNoRGltZW5zaW9uTWFya2VyKCdjb2wnLCB5QXhpc09yaWdpbi54MSwgeUF4aXNPcmlnaW4ueTEsIHlBeGlzT3JpZ2luLngyLCB5QXhpc09yaWdpbi55MiwgMCk7XG4gICAgICBpZiAoKGRhdGEubWluWCAhPT0gMCkgJiYgKGRhdGEubWF4WCAhPT0gMCkpIHtcbiAgICAgICAgb3JpZ2luQXhpcy5wdXNoKHlBeGlzT3JpZ2luKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjYWxjdWxhdGUgbnVtYmVyIG9mIGRpbWVuc2lvbiBtYXJrZXJzXG5cbiAgICBsZXQgY29sc1Bvc2l0aXZlID0gMDtcbiAgICBsZXQgY29sc05lZ2F0aXZlID0gMDtcbiAgICBpZiAodGhpcy5fYmV0d2VlbigwLCBkYXRhLm1pblgsIGRhdGEubWF4WCkpIHtcbiAgICAgIGNvbHNQb3NpdGl2ZSA9IChkYXRhLm1heFggLyB0aWNrc1gpIC0gMTtcbiAgICAgIGNvbHNOZWdhdGl2ZSA9IE1hdGguYWJzKGRhdGEubWluWCAvIHRpY2tzWCkgLSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBudW1Db2x1bW5zID0gKGRhdGEubWF4WCAtIGRhdGEubWluWCkgLyB0aWNrc1g7XG4gICAgICBpZiAoZGF0YS5taW5YIDwgMCkge1xuICAgICAgICBjb2xzTmVnYXRpdmUgPSBudW1Db2x1bW5zO1xuICAgICAgICBjb2xzUG9zaXRpdmUgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sc05lZ2F0aXZlID0gMDtcbiAgICAgICAgY29sc1Bvc2l0aXZlID0gbnVtQ29sdW1ucztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcm93c1Bvc2l0aXZlID0gMDtcbiAgICBsZXQgcm93c05lZ2F0aXZlID0gMDtcbiAgICBpZiAodGhpcy5fYmV0d2VlbigwLCBkYXRhLm1pblksIGRhdGEubWF4WSkpIHtcbiAgICAgIHJvd3NQb3NpdGl2ZSA9IE1hdGguYWJzKGRhdGEubWluWSAvIHRpY2tzWSkgLSAxO1xuICAgICAgcm93c05lZ2F0aXZlID0gKGRhdGEubWF4WSAvIHRpY2tzWSkgLSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBudW1Sb3dzID0gKGRhdGEubWF4WSAtIGRhdGEubWluWSkgLyB0aWNrc1k7XG4gICAgICBpZiAoZGF0YS5taW5ZIDwgMCkge1xuICAgICAgICByb3dzTmVnYXRpdmUgPSAwO1xuICAgICAgICByb3dzUG9zaXRpdmUgPSBudW1Sb3dzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcm93c05lZ2F0aXZlID0gbnVtUm93cztcbiAgICAgICAgcm93c1Bvc2l0aXZlID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBNYXRoLm1heChjb2xzUG9zaXRpdmUsIGNvbHNOZWdhdGl2ZSkpIHtcbiAgICAgIGxldCB2YWwsIHgxLCB4MiwgeTEsIHkyID0gbnVsbDtcblxuICAgICAgaWYgKGkgPCBjb2xzUG9zaXRpdmUpIHtcbiAgICAgICAgdmFsID0gKGkgKyAxKSAqIHRpY2tzWDtcbiAgICAgICAgaWYgKCF0aGlzLl9iZXR3ZWVuKDAsIGRhdGEubWluWCwgZGF0YS5tYXhYKSkge1xuICAgICAgICAgIHZhbCA9IGRhdGEubWluWCArIChpICogdGlja3NYKTtcbiAgICAgICAgfVxuICAgICAgICB4MSA9IHRoaXMuX25vcm1hbGl6ZVhDb29yZHMoZGF0YSwgdmFsKTtcbiAgICAgICAgeTEgPSB2aWV3Qm94RGltLnk7XG4gICAgICAgIHgyID0gdGhpcy5fbm9ybWFsaXplWENvb3JkcyhkYXRhLCB2YWwpO1xuICAgICAgICB5MiA9IHZpZXdCb3hEaW0ueSArIHZpZXdCb3hEaW0uaGVpZ2h0O1xuXG4gICAgICAgIGRpbWVuc2lvbk1hcmtlclN0YWNrLnB1c2goeyB4MSwgeTEsIHgyLCB5MiB9KTtcbiAgICAgICAgaWYgKGkgJSAyKSB7XG4gICAgICAgICAgcHVzaERpbWVuc2lvbk1hcmtlcignY29sJywgeDEsIHkxLCB4MiwgeTIsIHZhbC50b1ByZWNpc2lvbigxNCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgY29sc05lZ2F0aXZlKSB7XG4gICAgICAgIHZhbCA9IC0oaSArIDEpICogdGlja3NYO1xuICAgICAgICB4MSA9IHRoaXMuX25vcm1hbGl6ZVhDb29yZHMoZGF0YSwgdmFsKTtcbiAgICAgICAgeTEgPSB2aWV3Qm94RGltLnk7XG4gICAgICAgIHgyID0gdGhpcy5fbm9ybWFsaXplWENvb3JkcyhkYXRhLCB2YWwpO1xuICAgICAgICB5MiA9IHZpZXdCb3hEaW0ueSArIHZpZXdCb3hEaW0uaGVpZ2h0O1xuICAgICAgICBkaW1lbnNpb25NYXJrZXJTdGFjay5wdXNoKHsgeDEsIHkxLCB4MiwgeTIgfSk7XG4gICAgICAgIGlmIChpICUgMikge1xuICAgICAgICAgIHB1c2hEaW1lbnNpb25NYXJrZXIoJ2NvbCcsIHgxLCB5MSwgeDIsIHkyLCB2YWwudG9QcmVjaXNpb24oMTQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgTWF0aC5tYXgocm93c1Bvc2l0aXZlLCByb3dzTmVnYXRpdmUpKSB7XG4gICAgICBsZXQgdmFsLCB4MSwgeDIsIHkxLCB5MiA9IG51bGw7XG5cbiAgICAgIGlmIChpIDwgcm93c1Bvc2l0aXZlKSB7XG4gICAgICAgIHZhbCA9IC0oaSArIDEpICogdGlja3NZO1xuICAgICAgICB4MSA9IHZpZXdCb3hEaW0ueDtcbiAgICAgICAgeTEgPSB0aGlzLl9ub3JtYWxpemVZQ29vcmRzKGRhdGEsIHZhbCk7XG4gICAgICAgIHgyID0gdmlld0JveERpbS54ICsgdmlld0JveERpbS53aWR0aDtcbiAgICAgICAgeTIgPSB0aGlzLl9ub3JtYWxpemVZQ29vcmRzKGRhdGEsIHZhbCk7XG4gICAgICAgIGRpbWVuc2lvbk1hcmtlclN0YWNrLnB1c2goeyB4MSwgeTEsIHgyLCB5MiB9KTtcbiAgICAgICAgaWYgKGkgJSAyKSB7XG4gICAgICAgICAgcHVzaERpbWVuc2lvbk1hcmtlcigncm93JywgeDEsIHkxLCB4MiwgeTIsIHZhbC50b1ByZWNpc2lvbigxNCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgcm93c05lZ2F0aXZlKSB7XG4gICAgICAgIHZhbCA9IChpICsgMSkgKiB0aWNrc1k7XG4gICAgICAgIGlmICghdGhpcy5fYmV0d2VlbigwLCBkYXRhLm1pblksIGRhdGEubWF4WSkpIHtcbiAgICAgICAgICB2YWwgPSBkYXRhLm1pblkgKyAoaSAqIHRpY2tzWSk7XG4gICAgICAgIH1cbiAgICAgICAgeDEgPSB2aWV3Qm94RGltLng7XG4gICAgICAgIHkxID0gdGhpcy5fbm9ybWFsaXplWUNvb3JkcyhkYXRhLCB2YWwpO1xuICAgICAgICB4MiA9IHZpZXdCb3hEaW0ueCArIHZpZXdCb3hEaW0ud2lkdGg7XG4gICAgICAgIHkyID0gdGhpcy5fbm9ybWFsaXplWUNvb3JkcyhkYXRhLCB2YWwpO1xuICAgICAgICBkaW1lbnNpb25NYXJrZXJTdGFjay5wdXNoKHsgeDEsIHkxLCB4MiwgeTIgfSk7XG4gICAgICAgIGlmIChpICUgMikge1xuICAgICAgICAgIHB1c2hEaW1lbnNpb25NYXJrZXIoJ3JvdycsIHgxLCB5MSwgeDIsIHkyLCB2YWwudG9QcmVjaXNpb24oMTQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBncmlkT3JpZ2luOiBvcmlnaW5BeGlzLFxuICAgICAgZ3JpZExpbmVzOiBkaW1lbnNpb25NYXJrZXJTdGFjayxcbiAgICAgIGF4aXNMZWFkZXI6IGRpbWVuc2lvbk1hcmtlckxlYWRlclN0YWNrLFxuICAgICAgYXhpc0xlYWRlckxhYmVsOiBkaW1lbnNpb25NYXJrZXJMYWJlbFN0YWNrLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBeGlzVXRpbHM7Il19

//# sourceMappingURL=../utils/AxisUtils.es6.js.map