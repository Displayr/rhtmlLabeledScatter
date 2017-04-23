(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PlotLabel = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// NB local require statements cannot be enabled until the ES6 porting is complete
// const DisplayError = require('DisplayError')
/* global DisplayError */
/* global Image */ // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image


/* To Refactor:
 * *no method to access the label promises (PlotData accesses the internal directly)
 */

// PlotLabel class
// The primary purpose of this class is to support images as the labels and
// to parse them apart from the regular text labels

var PlotLabel = function () {
  function PlotLabel(givenLabelArray, labelAlt, logoScale) {
    var _this = this;

    _classCallCheck(this, PlotLabel);

    this.givenLabelArray = givenLabelArray;
    this.labelAlt = labelAlt;
    this.logoScale = logoScale;
    this.promiseLabelArray = this.givenLabelArray.map(function (label, index) {
      if (PlotLabel._isStringLinkToImg(label)) {
        return _this._makeImgLabPromise(label, _this.labelAlt[index] || '', _this.logoScale[index]);
      } else {
        return _this._makeLabPromise(label);
      }
    });
  }

  PlotLabel.prototype.getLabels = function getLabels() {
    return this.promiseLabelArray;
  };

  PlotLabel.prototype._makeLabPromise = function _makeLabPromise(label) {
    return Promise.resolve({
      width: null,
      height: null,
      label: label,
      url: ''
    });
  };

  PlotLabel.prototype._makeImgLabPromise = function _makeImgLabPromise(labelLink, labelAlt) {
    var scalingFactor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    return new Promise(function (resolve) {
      var img = new Image();
      var imgLoaded = false;

      img.onload = function () {
        var defaultArea = 10000 * scalingFactor;
        var height = this.height || 0;
        var width = this.width || 0;
        var aspectRatio = width / height;

        var adjW = Math.sqrt(defaultArea * aspectRatio);
        var adjH = adjW / aspectRatio;
        img.src = ''; // remove img
        imgLoaded = true;
        return resolve({
          width: adjW,
          height: adjH,
          label: labelAlt,
          url: labelLink
        });
      };

      img.onerror = function () {
        if (imgLoaded) {
          return null;
        }

        console.log('Error: Image URL not valid - ' + labelLink);
        var defaultErrorLogoSize = 20;

        return resolve({
          width: defaultErrorLogoSize,
          height: defaultErrorLogoSize,
          label: '',
          url: DisplayError.getErrorImgUrl()
        });
      };

      img.src = labelLink;
    });
  };

  PlotLabel._isStringLinkToImg = function _isStringLinkToImg(label) {
    var isUrl = /^(https:|http:|\/images\/)/.test(label);
    var correctExtension = /\.(png|svg|jpg|gif)/.test(label);
    return isUrl && correctExtension;
  };

  return PlotLabel;
}();

module.exports = PlotLabel;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9QbG90TGFiZWwuZXM2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBLGtCLENBQW1COzs7QUFHbkI7Ozs7QUFJQTtBQUNBO0FBQ0E7O0lBRU0sUztBQUNKLHFCQUFZLGVBQVosRUFBNkIsUUFBN0IsRUFBdUMsU0FBdkMsRUFBa0Q7QUFBQTs7QUFBQTs7QUFDaEQsU0FBSyxlQUFMLEdBQXVCLGVBQXZCO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLFNBQWpCO0FBQ0EsU0FBSyxpQkFBTCxHQUF5QixLQUFLLGVBQUwsQ0FBcUIsR0FBckIsQ0FBeUIsVUFBQyxLQUFELEVBQVEsS0FBUixFQUFrQjtBQUNsRSxVQUFJLFVBQVUsa0JBQVYsQ0FBNkIsS0FBN0IsQ0FBSixFQUF5QztBQUN2QyxlQUFPLE1BQUssa0JBQUwsQ0FBd0IsS0FBeEIsRUFBK0IsTUFBSyxRQUFMLENBQWMsS0FBZCxLQUF3QixFQUF2RCxFQUEyRCxNQUFLLFNBQUwsQ0FBZSxLQUFmLENBQTNELENBQVA7QUFDRCxPQUZELE1BRU87QUFDTCxlQUFPLE1BQUssZUFBTCxDQUFxQixLQUFyQixDQUFQO0FBQ0Q7QUFDRixLQU53QixDQUF6QjtBQU9EOztzQkFFRCxTLHdCQUFZO0FBQ1YsV0FBTyxLQUFLLGlCQUFaO0FBQ0QsRzs7c0JBRUQsZSw0QkFBZ0IsSyxFQUFPO0FBQ3JCLFdBQU8sUUFBUSxPQUFSLENBQWdCO0FBQ3JCLGFBQU8sSUFEYztBQUVyQixjQUFRLElBRmE7QUFHckIsa0JBSHFCO0FBSXJCLFdBQUs7QUFKZ0IsS0FBaEIsQ0FBUDtBQU1ELEc7O3NCQUVELGtCLCtCQUFtQixTLEVBQVcsUSxFQUE2QjtBQUFBLFFBQW5CLGFBQW1CLHVFQUFILENBQUc7O0FBQ3pELFdBQU8sSUFBSSxPQUFKLENBQVksVUFBVSxPQUFWLEVBQW1CO0FBQ3BDLFVBQU0sTUFBTSxJQUFJLEtBQUosRUFBWjtBQUNBLFVBQUksWUFBWSxLQUFoQjs7QUFFQSxVQUFJLE1BQUosR0FBYSxZQUFZO0FBQ3ZCLFlBQU0sY0FBYyxRQUFRLGFBQTVCO0FBQ0EsWUFBTSxTQUFTLEtBQUssTUFBTCxJQUFlLENBQTlCO0FBQ0EsWUFBTSxRQUFRLEtBQUssS0FBTCxJQUFjLENBQTVCO0FBQ0EsWUFBTSxjQUFjLFFBQVEsTUFBNUI7O0FBRUEsWUFBTSxPQUFPLEtBQUssSUFBTCxDQUFVLGNBQWMsV0FBeEIsQ0FBYjtBQUNBLFlBQU0sT0FBTyxPQUFPLFdBQXBCO0FBQ0EsWUFBSSxHQUFKLEdBQVUsRUFBVixDQVJ1QixDQVFUO0FBQ2Qsb0JBQVksSUFBWjtBQUNBLGVBQU8sUUFBUTtBQUNiLGlCQUFPLElBRE07QUFFYixrQkFBUSxJQUZLO0FBR2IsaUJBQU8sUUFITTtBQUliLGVBQUs7QUFKUSxTQUFSLENBQVA7QUFNRCxPQWhCRDs7QUFrQkEsVUFBSSxPQUFKLEdBQWMsWUFBWTtBQUN4QixZQUFJLFNBQUosRUFBZTtBQUFFLGlCQUFPLElBQVA7QUFBYzs7QUFFL0IsZ0JBQVEsR0FBUixtQ0FBNEMsU0FBNUM7QUFDQSxZQUFNLHVCQUF1QixFQUE3Qjs7QUFFQSxlQUFPLFFBQVE7QUFDYixpQkFBTyxvQkFETTtBQUViLGtCQUFRLG9CQUZLO0FBR2IsaUJBQU8sRUFITTtBQUliLGVBQUssYUFBYSxjQUFiO0FBSlEsU0FBUixDQUFQO0FBTUQsT0FaRDs7QUFjQSxVQUFJLEdBQUosR0FBVSxTQUFWO0FBQ0QsS0FyQ00sQ0FBUDtBQXNDRCxHOztZQUVNLGtCLCtCQUFtQixLLEVBQU87QUFDL0IsUUFBTSxRQUFRLDZCQUE2QixJQUE3QixDQUFrQyxLQUFsQyxDQUFkO0FBQ0EsUUFBTSxtQkFBbUIsc0JBQXNCLElBQXRCLENBQTJCLEtBQTNCLENBQXpCO0FBQ0EsV0FBUSxTQUFTLGdCQUFqQjtBQUNELEc7Ozs7O0FBR0gsT0FBTyxPQUFQLEdBQWlCLFNBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE5CIGxvY2FsIHJlcXVpcmUgc3RhdGVtZW50cyBjYW5ub3QgYmUgZW5hYmxlZCB1bnRpbCB0aGUgRVM2IHBvcnRpbmcgaXMgY29tcGxldGVcbi8vIGNvbnN0IERpc3BsYXlFcnJvciA9IHJlcXVpcmUoJ0Rpc3BsYXlFcnJvcicpXG4vKiBnbG9iYWwgRGlzcGxheUVycm9yICovXG4vKiBnbG9iYWwgSW1hZ2UgKi8gLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxJbWFnZUVsZW1lbnQvSW1hZ2VcblxuXG4vKiBUbyBSZWZhY3RvcjpcbiAqICpubyBtZXRob2QgdG8gYWNjZXNzIHRoZSBsYWJlbCBwcm9taXNlcyAoUGxvdERhdGEgYWNjZXNzZXMgdGhlIGludGVybmFsIGRpcmVjdGx5KVxuICovXG5cbi8vIFBsb3RMYWJlbCBjbGFzc1xuLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIGNsYXNzIGlzIHRvIHN1cHBvcnQgaW1hZ2VzIGFzIHRoZSBsYWJlbHMgYW5kXG4vLyB0byBwYXJzZSB0aGVtIGFwYXJ0IGZyb20gdGhlIHJlZ3VsYXIgdGV4dCBsYWJlbHNcblxuY2xhc3MgUGxvdExhYmVsIHtcbiAgY29uc3RydWN0b3IoZ2l2ZW5MYWJlbEFycmF5LCBsYWJlbEFsdCwgbG9nb1NjYWxlKSB7XG4gICAgdGhpcy5naXZlbkxhYmVsQXJyYXkgPSBnaXZlbkxhYmVsQXJyYXk7XG4gICAgdGhpcy5sYWJlbEFsdCA9IGxhYmVsQWx0O1xuICAgIHRoaXMubG9nb1NjYWxlID0gbG9nb1NjYWxlO1xuICAgIHRoaXMucHJvbWlzZUxhYmVsQXJyYXkgPSB0aGlzLmdpdmVuTGFiZWxBcnJheS5tYXAoKGxhYmVsLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKFBsb3RMYWJlbC5faXNTdHJpbmdMaW5rVG9JbWcobGFiZWwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlSW1nTGFiUHJvbWlzZShsYWJlbCwgdGhpcy5sYWJlbEFsdFtpbmRleF0gfHwgJycsIHRoaXMubG9nb1NjYWxlW2luZGV4XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZUxhYlByb21pc2UobGFiZWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0TGFiZWxzKCkge1xuICAgIHJldHVybiB0aGlzLnByb21pc2VMYWJlbEFycmF5O1xuICB9XG5cbiAgX21ha2VMYWJQcm9taXNlKGxhYmVsKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICB3aWR0aDogbnVsbCxcbiAgICAgIGhlaWdodDogbnVsbCxcbiAgICAgIGxhYmVsLFxuICAgICAgdXJsOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIF9tYWtlSW1nTGFiUHJvbWlzZShsYWJlbExpbmssIGxhYmVsQWx0LCBzY2FsaW5nRmFjdG9yID0gMSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBsZXQgaW1nTG9hZGVkID0gZmFsc2U7XG5cbiAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRBcmVhID0gMTAwMDAgKiBzY2FsaW5nRmFjdG9yO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmhlaWdodCB8fCAwO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMud2lkdGggfHwgMDtcbiAgICAgICAgY29uc3QgYXNwZWN0UmF0aW8gPSB3aWR0aCAvIGhlaWdodDtcblxuICAgICAgICBjb25zdCBhZGpXID0gTWF0aC5zcXJ0KGRlZmF1bHRBcmVhICogYXNwZWN0UmF0aW8pO1xuICAgICAgICBjb25zdCBhZGpIID0gYWRqVyAvIGFzcGVjdFJhdGlvO1xuICAgICAgICBpbWcuc3JjID0gJyc7IC8vIHJlbW92ZSBpbWdcbiAgICAgICAgaW1nTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoe1xuICAgICAgICAgIHdpZHRoOiBhZGpXLFxuICAgICAgICAgIGhlaWdodDogYWRqSCxcbiAgICAgICAgICBsYWJlbDogbGFiZWxBbHQsXG4gICAgICAgICAgdXJsOiBsYWJlbExpbmssXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpbWdMb2FkZWQpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgRXJyb3I6IEltYWdlIFVSTCBub3QgdmFsaWQgLSAke2xhYmVsTGlua31gKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yTG9nb1NpemUgPSAyMDtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh7XG4gICAgICAgICAgd2lkdGg6IGRlZmF1bHRFcnJvckxvZ29TaXplLFxuICAgICAgICAgIGhlaWdodDogZGVmYXVsdEVycm9yTG9nb1NpemUsXG4gICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgIHVybDogRGlzcGxheUVycm9yLmdldEVycm9ySW1nVXJsKCksXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgaW1nLnNyYyA9IGxhYmVsTGluaztcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBfaXNTdHJpbmdMaW5rVG9JbWcobGFiZWwpIHtcbiAgICBjb25zdCBpc1VybCA9IC9eKGh0dHBzOnxodHRwOnxcXC9pbWFnZXNcXC8pLy50ZXN0KGxhYmVsKTtcbiAgICBjb25zdCBjb3JyZWN0RXh0ZW5zaW9uID0gL1xcLihwbmd8c3ZnfGpwZ3xnaWYpLy50ZXN0KGxhYmVsKTtcbiAgICByZXR1cm4gKGlzVXJsICYmIGNvcnJlY3RFeHRlbnNpb24pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxvdExhYmVsO1xuIl19

//# sourceMappingURL=PlotLabel.es6.js.map