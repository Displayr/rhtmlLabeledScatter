(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PlotColors = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// NB local require statements cannot be enabled until the ES6 porting is complete
// const Utils = require('./utils/Utils.es6')
/* global Utils */

/* To Refactor:
 *   * the constructor of PlotColors has a side effect that creates the legendGroup used by PlotData etc
 *
 */

// This class assigns colors to the plot data
// If group array is supplied, it will couple the array with the color wheel
// If no group array is supplied, colors are rotated through the color wheel
var PlotColors = function () {
  function PlotColors(plotData) {
    var _this = this;

    _classCallCheck(this, PlotColors);

    this.plotData = plotData;
    this.plotData.legendGroups = [];

    this.groupToColorMap = {};

    var uniqueGroups = _.uniq(this.plotData.group || []);
    _(uniqueGroups).each(function (groupName, index) {
      var newColor = _this.getNewColor(index);
      _this.plotData.legendGroups.push({
        text: groupName,
        color: newColor,
        r: _this.plotData.legendDim.ptRadius,
        anchor: 'start',
        fillOpacity: _this.getFillOpacity(_this.plotData.transparency)
      });
      _this.groupToColorMap[groupName] = newColor;
    });
  }

  PlotColors.prototype.getColorFromGroup = function getColorFromGroup(group) {
    return this.groupToColorMap[group];
  };

  PlotColors.prototype.getNewColor = function getNewColor(index) {
    return this.plotData.colorWheel[index % this.plotData.colorWheel.length];
  };

  PlotColors.prototype.getColor = function getColor(i) {
    if (Utils.isArr(this.plotData.group)) {
      return this.getColorFromGroup(this.plotData.group[i]);
    } else {
      return this.getNewColor(0); // takes the first color in the color wheel since all pts in same grp
    }
  };

  PlotColors.prototype.getFillOpacity = function getFillOpacity(transparency) {
    if (Utils.isNum(transparency)) {
      return transparency;
    } else if (Utils.isArr(this.plotData.Z)) {
      return 0.3; // If data has a Z dimension, then default to 0.3 (semi-transparent)
    } else {
      return 1; // If data has no Z dimension, then default to 1 (opaque)
    }
  };

  return PlotColors;
}();

module.exports = PlotColors;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9QbG90Q29sb3JzLmVzNi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7O0FBS0E7QUFDQTtBQUNBO0lBQ00sVTtBQUNKLHNCQUFZLFFBQVosRUFBc0I7QUFBQTs7QUFBQTs7QUFDcEIsU0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsU0FBSyxRQUFMLENBQWMsWUFBZCxHQUE2QixFQUE3Qjs7QUFFQSxTQUFLLGVBQUwsR0FBdUIsRUFBdkI7O0FBRUEsUUFBTSxlQUFlLEVBQUUsSUFBRixDQUFPLEtBQUssUUFBTCxDQUFjLEtBQWQsSUFBdUIsRUFBOUIsQ0FBckI7QUFDQSxNQUFFLFlBQUYsRUFBZ0IsSUFBaEIsQ0FBcUIsVUFBQyxTQUFELEVBQVksS0FBWixFQUFzQjtBQUN6QyxVQUFNLFdBQVcsTUFBSyxXQUFMLENBQWlCLEtBQWpCLENBQWpCO0FBQ0EsWUFBSyxRQUFMLENBQWMsWUFBZCxDQUEyQixJQUEzQixDQUFnQztBQUM5QixjQUFNLFNBRHdCO0FBRTlCLGVBQU8sUUFGdUI7QUFHOUIsV0FBRyxNQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLFFBSEc7QUFJOUIsZ0JBQVEsT0FKc0I7QUFLOUIscUJBQWEsTUFBSyxjQUFMLENBQW9CLE1BQUssUUFBTCxDQUFjLFlBQWxDO0FBTGlCLE9BQWhDO0FBT0EsWUFBSyxlQUFMLENBQXFCLFNBQXJCLElBQWtDLFFBQWxDO0FBQ0QsS0FWRDtBQVdEOzt1QkFFRCxpQiw4QkFBa0IsSyxFQUFPO0FBQ3ZCLFdBQU8sS0FBSyxlQUFMLENBQXFCLEtBQXJCLENBQVA7QUFDRCxHOzt1QkFFRCxXLHdCQUFZLEssRUFBTztBQUNqQixXQUFPLEtBQUssUUFBTCxDQUFjLFVBQWQsQ0FBeUIsUUFBUSxLQUFLLFFBQUwsQ0FBYyxVQUFkLENBQXlCLE1BQTFELENBQVA7QUFDRCxHOzt1QkFFRCxRLHFCQUFTLEMsRUFBRztBQUNWLFFBQUksTUFBTSxLQUFOLENBQVksS0FBSyxRQUFMLENBQWMsS0FBMUIsQ0FBSixFQUFzQztBQUNwQyxhQUFPLEtBQUssaUJBQUwsQ0FBdUIsS0FBSyxRQUFMLENBQWMsS0FBZCxDQUFvQixDQUFwQixDQUF2QixDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsQ0FBUCxDQURLLENBQ3VCO0FBQzdCO0FBQ0YsRzs7dUJBRUQsYywyQkFBZSxZLEVBQWM7QUFDM0IsUUFBSSxNQUFNLEtBQU4sQ0FBWSxZQUFaLENBQUosRUFBK0I7QUFDN0IsYUFBTyxZQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUksTUFBTSxLQUFOLENBQVksS0FBSyxRQUFMLENBQWMsQ0FBMUIsQ0FBSixFQUFrQztBQUN2QyxhQUFPLEdBQVAsQ0FEdUMsQ0FDM0I7QUFDYixLQUZNLE1BRUE7QUFDTCxhQUFPLENBQVAsQ0FESyxDQUNLO0FBQ1g7QUFDRixHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixVQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8vIE5CIGxvY2FsIHJlcXVpcmUgc3RhdGVtZW50cyBjYW5ub3QgYmUgZW5hYmxlZCB1bnRpbCB0aGUgRVM2IHBvcnRpbmcgaXMgY29tcGxldGVcbi8vIGNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy9VdGlscy5lczYnKVxuLyogZ2xvYmFsIFV0aWxzICovXG5cbi8qIFRvIFJlZmFjdG9yOlxuICogICAqIHRoZSBjb25zdHJ1Y3RvciBvZiBQbG90Q29sb3JzIGhhcyBhIHNpZGUgZWZmZWN0IHRoYXQgY3JlYXRlcyB0aGUgbGVnZW5kR3JvdXAgdXNlZCBieSBQbG90RGF0YSBldGNcbiAqXG4gKi9cblxuLy8gVGhpcyBjbGFzcyBhc3NpZ25zIGNvbG9ycyB0byB0aGUgcGxvdCBkYXRhXG4vLyBJZiBncm91cCBhcnJheSBpcyBzdXBwbGllZCwgaXQgd2lsbCBjb3VwbGUgdGhlIGFycmF5IHdpdGggdGhlIGNvbG9yIHdoZWVsXG4vLyBJZiBubyBncm91cCBhcnJheSBpcyBzdXBwbGllZCwgY29sb3JzIGFyZSByb3RhdGVkIHRocm91Z2ggdGhlIGNvbG9yIHdoZWVsXG5jbGFzcyBQbG90Q29sb3JzIHtcbiAgY29uc3RydWN0b3IocGxvdERhdGEpIHtcbiAgICB0aGlzLnBsb3REYXRhID0gcGxvdERhdGE7XG4gICAgdGhpcy5wbG90RGF0YS5sZWdlbmRHcm91cHMgPSBbXTtcblxuICAgIHRoaXMuZ3JvdXBUb0NvbG9yTWFwID0ge307XG5cbiAgICBjb25zdCB1bmlxdWVHcm91cHMgPSBfLnVuaXEodGhpcy5wbG90RGF0YS5ncm91cCB8fCBbXSk7XG4gICAgXyh1bmlxdWVHcm91cHMpLmVhY2goKGdyb3VwTmFtZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IG5ld0NvbG9yID0gdGhpcy5nZXROZXdDb2xvcihpbmRleCk7XG4gICAgICB0aGlzLnBsb3REYXRhLmxlZ2VuZEdyb3Vwcy5wdXNoKHtcbiAgICAgICAgdGV4dDogZ3JvdXBOYW1lLFxuICAgICAgICBjb2xvcjogbmV3Q29sb3IsXG4gICAgICAgIHI6IHRoaXMucGxvdERhdGEubGVnZW5kRGltLnB0UmFkaXVzLFxuICAgICAgICBhbmNob3I6ICdzdGFydCcsXG4gICAgICAgIGZpbGxPcGFjaXR5OiB0aGlzLmdldEZpbGxPcGFjaXR5KHRoaXMucGxvdERhdGEudHJhbnNwYXJlbmN5KSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5ncm91cFRvQ29sb3JNYXBbZ3JvdXBOYW1lXSA9IG5ld0NvbG9yO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29sb3JGcm9tR3JvdXAoZ3JvdXApIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cFRvQ29sb3JNYXBbZ3JvdXBdO1xuICB9XG5cbiAgZ2V0TmV3Q29sb3IoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5wbG90RGF0YS5jb2xvcldoZWVsW2luZGV4ICUgdGhpcy5wbG90RGF0YS5jb2xvcldoZWVsLmxlbmd0aF07XG4gIH1cblxuICBnZXRDb2xvcihpKSB7XG4gICAgaWYgKFV0aWxzLmlzQXJyKHRoaXMucGxvdERhdGEuZ3JvdXApKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDb2xvckZyb21Hcm91cCh0aGlzLnBsb3REYXRhLmdyb3VwW2ldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV3Q29sb3IoMCk7IC8vIHRha2VzIHRoZSBmaXJzdCBjb2xvciBpbiB0aGUgY29sb3Igd2hlZWwgc2luY2UgYWxsIHB0cyBpbiBzYW1lIGdycFxuICAgIH1cbiAgfVxuXG4gIGdldEZpbGxPcGFjaXR5KHRyYW5zcGFyZW5jeSkge1xuICAgIGlmIChVdGlscy5pc051bSh0cmFuc3BhcmVuY3kpKSB7XG4gICAgICByZXR1cm4gdHJhbnNwYXJlbmN5O1xuICAgIH0gZWxzZSBpZiAoVXRpbHMuaXNBcnIodGhpcy5wbG90RGF0YS5aKSkge1xuICAgICAgcmV0dXJuIDAuMzsgLy8gSWYgZGF0YSBoYXMgYSBaIGRpbWVuc2lvbiwgdGhlbiBkZWZhdWx0IHRvIDAuMyAoc2VtaS10cmFuc3BhcmVudClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDE7IC8vIElmIGRhdGEgaGFzIG5vIFogZGltZW5zaW9uLCB0aGVuIGRlZmF1bHQgdG8gMSAob3BhcXVlKVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsb3RDb2xvcnM7XG4iXX0=

//# sourceMappingURL=PlotColors.es6.js.map