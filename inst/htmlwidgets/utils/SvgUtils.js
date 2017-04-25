(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SvgUtils = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global _ */
// import _ from 'lodash';

var SvgUtils = function () {
  function SvgUtils() {
    _classCallCheck(this, SvgUtils);
  }

  SvgUtils.setSvgBBoxWidthAndHeight = function setSvgBBoxWidthAndHeight(dataArray, svgArray) {
    _(dataArray).each(function (dataElem, index) {
      if (!dataElem.width && !dataElem.height) {
        dataElem.width = svgArray[0][index].getBBox().width;
        dataElem.height = svgArray[0][index].getBBox().height;
      }
    });
  };

  return SvgUtils;
}();

module.exports = SvgUtils;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy91dGlscy9TdmdVdGlscy5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7QUFDQTs7SUFFTSxROzs7OztXQUNHLHdCLHFDQUF5QixTLEVBQVcsUSxFQUFVO0FBQ25ELE1BQUUsU0FBRixFQUFhLElBQWIsQ0FBa0IsVUFBQyxRQUFELEVBQVcsS0FBWCxFQUFxQjtBQUNyQyxVQUFJLENBQUMsU0FBUyxLQUFWLElBQW1CLENBQUMsU0FBUyxNQUFqQyxFQUF5QztBQUN2QyxpQkFBUyxLQUFULEdBQWlCLFNBQVMsQ0FBVCxFQUFZLEtBQVosRUFBbUIsT0FBbkIsR0FBNkIsS0FBOUM7QUFDQSxpQkFBUyxNQUFULEdBQWtCLFNBQVMsQ0FBVCxFQUFZLEtBQVosRUFBbUIsT0FBbkIsR0FBNkIsTUFBL0M7QUFDRDtBQUNGLEtBTEQ7QUFNRCxHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixRQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgXyAqL1xuLy8gaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuY2xhc3MgU3ZnVXRpbHMge1xuICBzdGF0aWMgc2V0U3ZnQkJveFdpZHRoQW5kSGVpZ2h0KGRhdGFBcnJheSwgc3ZnQXJyYXkpIHtcbiAgICBfKGRhdGFBcnJheSkuZWFjaCgoZGF0YUVsZW0sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoIWRhdGFFbGVtLndpZHRoICYmICFkYXRhRWxlbS5oZWlnaHQpIHtcbiAgICAgICAgZGF0YUVsZW0ud2lkdGggPSBzdmdBcnJheVswXVtpbmRleF0uZ2V0QkJveCgpLndpZHRoO1xuICAgICAgICBkYXRhRWxlbS5oZWlnaHQgPSBzdmdBcnJheVswXVtpbmRleF0uZ2V0QkJveCgpLmhlaWdodDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z1V0aWxzO1xuIl19

//# sourceMappingURL=../utils/SvgUtils.es6.js.map