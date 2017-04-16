(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DisplayError = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// NB local require statements cannot be enabled until the ES6 porting is complete
// const $ = require('jquery')
// const Utils = require('./utils/Utils')
/* global Utils */
/* global $ */

/* To Refactor:
 *   * use a data uri instead of an S3 asset pointing at Kyles S3 account
 *   * Are we allowed to use this image ?
 *
 */

var DisplayError = function () {
  function DisplayError() {
    _classCallCheck(this, DisplayError);
  }

  DisplayError.checkIfArrayOfNums = function checkIfArrayOfNums(candidateArray, svg, errorMsg) {
    if (!Utils.isArrOfNums(candidateArray)) {
      this.displayErrorMessage(svg, errorMsg);
    }
  };

  DisplayError.displayErrorMessage = function displayErrorMessage(svg, msg) {
    var errorContainer = $('<div class="rhtml-error-container">');
    var errorImage = $('<img width="32px" height="32px" src="' + this.getErrorImgUrl() + '"/>');
    var errorText = $('<span style="color:red;">').html(msg.toString());

    errorContainer.append(errorImage);
    errorContainer.append(errorText);

    $(svg).empty();
    $(svg).append(errorContainer);

    throw new Error(msg);
  };

  DisplayError.getErrorImgUrl = function getErrorImgUrl() {
    return 'https://s3-ap-southeast-2.amazonaws.com/kyle-public-numbers-assets/htmlwidgets/CroppedImage/error_128.png';
  };

  return DisplayError;
}();

module.exports = DisplayError;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9EaXNwbGF5RXJyb3IuZXM2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7OztJQU1NLFk7Ozs7O2VBQ0csa0IsK0JBQW1CLGMsRUFBZ0IsRyxFQUFLLFEsRUFBVTtBQUN2RCxRQUFJLENBQUMsTUFBTSxXQUFOLENBQWtCLGNBQWxCLENBQUwsRUFBd0M7QUFDdEMsV0FBSyxtQkFBTCxDQUF5QixHQUF6QixFQUE4QixRQUE5QjtBQUNEO0FBQ0YsRzs7ZUFFTSxtQixnQ0FBb0IsRyxFQUFLLEcsRUFBSztBQUNuQyxRQUFNLGlCQUFpQixFQUFFLHFDQUFGLENBQXZCO0FBQ0EsUUFBTSxhQUFhLDRDQUEwQyxLQUFLLGNBQUwsRUFBMUMsU0FBbkI7QUFDQSxRQUFNLFlBQVksRUFBRSwyQkFBRixFQUNmLElBRGUsQ0FDVixJQUFJLFFBQUosRUFEVSxDQUFsQjs7QUFHQSxtQkFBZSxNQUFmLENBQXNCLFVBQXRCO0FBQ0EsbUJBQWUsTUFBZixDQUFzQixTQUF0Qjs7QUFFQSxNQUFFLEdBQUYsRUFBTyxLQUFQO0FBQ0EsTUFBRSxHQUFGLEVBQU8sTUFBUCxDQUFjLGNBQWQ7O0FBRUEsVUFBTSxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQU47QUFDRCxHOztlQUVNLGMsNkJBQWlCO0FBQ3RCLFdBQU8sMkdBQVA7QUFDRCxHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixZQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBOQiBsb2NhbCByZXF1aXJlIHN0YXRlbWVudHMgY2Fubm90IGJlIGVuYWJsZWQgdW50aWwgdGhlIEVTNiBwb3J0aW5nIGlzIGNvbXBsZXRlXG4vLyBjb25zdCAkID0gcmVxdWlyZSgnanF1ZXJ5Jylcbi8vIGNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy9VdGlscycpXG4vKiBnbG9iYWwgVXRpbHMgKi9cbi8qIGdsb2JhbCAkICovXG5cbi8qIFRvIFJlZmFjdG9yOlxuICogICAqIHVzZSBhIGRhdGEgdXJpIGluc3RlYWQgb2YgYW4gUzMgYXNzZXQgcG9pbnRpbmcgYXQgS3lsZXMgUzMgYWNjb3VudFxuICogICAqIEFyZSB3ZSBhbGxvd2VkIHRvIHVzZSB0aGlzIGltYWdlID9cbiAqXG4gKi9cblxuY2xhc3MgRGlzcGxheUVycm9yIHtcbiAgc3RhdGljIGNoZWNrSWZBcnJheU9mTnVtcyhjYW5kaWRhdGVBcnJheSwgc3ZnLCBlcnJvck1zZykge1xuICAgIGlmICghVXRpbHMuaXNBcnJPZk51bXMoY2FuZGlkYXRlQXJyYXkpKSB7XG4gICAgICB0aGlzLmRpc3BsYXlFcnJvck1lc3NhZ2Uoc3ZnLCBlcnJvck1zZyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGRpc3BsYXlFcnJvck1lc3NhZ2Uoc3ZnLCBtc2cpIHtcbiAgICBjb25zdCBlcnJvckNvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJyaHRtbC1lcnJvci1jb250YWluZXJcIj4nKTtcbiAgICBjb25zdCBlcnJvckltYWdlID0gJChgPGltZyB3aWR0aD1cIjMycHhcIiBoZWlnaHQ9XCIzMnB4XCIgc3JjPVwiJHt0aGlzLmdldEVycm9ySW1nVXJsKCl9XCIvPmApO1xuICAgIGNvbnN0IGVycm9yVGV4dCA9ICQoJzxzcGFuIHN0eWxlPVwiY29sb3I6cmVkO1wiPicpXG4gICAgICAuaHRtbChtc2cudG9TdHJpbmcoKSk7XG5cbiAgICBlcnJvckNvbnRhaW5lci5hcHBlbmQoZXJyb3JJbWFnZSk7XG4gICAgZXJyb3JDb250YWluZXIuYXBwZW5kKGVycm9yVGV4dCk7XG5cbiAgICAkKHN2ZykuZW1wdHkoKTtcbiAgICAkKHN2ZykuYXBwZW5kKGVycm9yQ29udGFpbmVyKTtcblxuICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICB9XG5cbiAgc3RhdGljIGdldEVycm9ySW1nVXJsKCkge1xuICAgIHJldHVybiAnaHR0cHM6Ly9zMy1hcC1zb3V0aGVhc3QtMi5hbWF6b25hd3MuY29tL2t5bGUtcHVibGljLW51bWJlcnMtYXNzZXRzL2h0bWx3aWRnZXRzL0Nyb3BwZWRJbWFnZS9lcnJvcl8xMjgucG5nJztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpc3BsYXlFcnJvcjtcbiJdfQ==

//# sourceMappingURL=DisplayError.es6.js.map