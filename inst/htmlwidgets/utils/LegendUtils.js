(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LegendUtils = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LegendUtils = function () {
  function LegendUtils() {
    _classCallCheck(this, LegendUtils);
  }

  LegendUtils.getExponentialShortForm = function getExponentialShortForm(val) {
    return this.exponentialShortForms[val];
  };

  LegendUtils.normalizedZtoRadius = function normalizedZtoRadius(viewBoxDim, normZval) {
    return Math.sqrt(viewBoxDim.width * viewBoxDim.height / 16 / Math.PI) * normZval;
  };

  // KZ TODO remove 'data' side effect
  // TODO Po describe why


  LegendUtils.calcZQuartiles = function calcZQuartiles(data, maxZ) {
    var getZLabel = function getZLabel(val, max, precision) {
      return Math.sqrt((max * val).toPrecision(precision) / max / Math.PI);
    };

    var getExponential = function getExponential(num) {
      return num.toExponential().split('e')[1];
    };

    // Quartiles that determine size of each of the legend bubbles in proportion to maximum Z val
    var topQ = 0.9;
    var midQ = 0.4;
    var botQ = 0.1;

    var topQuartileZ = maxZ * topQ;

    // VIS-262: Compensate for inconsistent sig figs in legend
    var differenceInExponentials = Math.abs(getExponential(topQuartileZ) - getExponential(midQ * topQuartileZ));
    var isTopQuartileExponentialOne = getExponential(topQuartileZ) === 1;
    var precision = differenceInExponentials < 1 && isTopQuartileExponentialOne ? 1 : 2;
    topQuartileZ = topQuartileZ.toPrecision(precision);

    // Calculations necessary to figure out which short form to apply
    var exp = Math.log(topQuartileZ);
    exp = Math.round(exp * 100000) / 100000;
    exp /= Math.LN10;

    var expDecimal = exp % 1;
    exp -= expDecimal;
    var digitsBtwnShortForms = exp % 3;
    exp -= digitsBtwnShortForms;
    var expShortForm = this.getExponentialShortForm(exp) || '';

    var topQuartileVal = topQuartileZ / Math.pow(10, exp);

    data.Zquartiles = {
      top: {
        val: topQuartileVal + expShortForm,
        lab: getZLabel(topQ, maxZ, precision)
      },
      mid: {
        val: (topQuartileZ * midQ).toPrecision(1) / Math.pow(10, exp),
        lab: getZLabel(midQ, topQuartileZ, 1)
      },
      bot: {
        val: (topQuartileZ * botQ).toPrecision(1) / Math.pow(10, exp),
        lab: getZLabel(botQ, topQuartileZ, 1)
      }
    };
  };

  // TODO KZ remove side effect, just return the normalized array
  // TODO Po describe why


  LegendUtils.normalizeZValues = function normalizeZValues(data, maxZ) {
    data.normZ = data.Z.map(function (z) {
      var normalizedArea = z / maxZ;
      return Math.sqrt(normalizedArea / Math.PI);
    });
  };

  // TODO KZ remove side effect, just return the normalized array


  LegendUtils.setupBubbles = function setupBubbles(data) {
    var viewBoxDim = data.viewBoxDim,
        Zquartiles = data.Zquartiles,
        legendDim = data.legendDim;


    var rTop = this.normalizedZtoRadius(viewBoxDim, Zquartiles.top.lab);
    var rMid = this.normalizedZtoRadius(viewBoxDim, Zquartiles.mid.lab);
    var rBot = this.normalizedZtoRadius(viewBoxDim, Zquartiles.bot.lab);
    var cx = viewBoxDim.x + viewBoxDim.width + legendDim.width / 2;
    var viewBoxYBottom = viewBoxDim.y + viewBoxDim.height;
    var bubbleTextPadding = 5;

    data.legendBubblesMaxWidth = rTop * 2;

    data.legendBubbles = [{
      cx: cx,
      cy: viewBoxYBottom - rTop,
      r: rTop,
      x: cx,
      y: viewBoxYBottom - 2 * rTop - bubbleTextPadding,
      text: Zquartiles.top.val
    }, {
      cx: cx,
      cy: viewBoxYBottom - rMid,
      r: rMid,
      x: cx,
      y: viewBoxYBottom - 2 * rMid - bubbleTextPadding,
      text: Zquartiles.mid.val
    }, {
      cx: cx,
      cy: viewBoxYBottom - rBot,
      r: rBot,
      x: cx,
      y: viewBoxYBottom - 2 * rBot - bubbleTextPadding,
      text: Zquartiles.bot.val
    }];

    data.legendBubblesTitle = [{
      x: cx,
      y: viewBoxYBottom - 2 * rTop - bubbleTextPadding
    }];
  };

  _createClass(LegendUtils, null, [{
    key: 'exponentialShortForms',
    get: function get() {
      return {
        3: 'k', // thousand
        6: 'm', // million
        9: 'b', // billion
        12: 't', // trillion
        15: 'qd', // quadrillion
        18: 'qt', // quintillion
        21: 'sxt', // sextillion
        24: 'spt', // septillion
        27: 'oct', // octillian
        30: 'nn', // nonillian
        33: 'dc' };
    }
  }]);

  return LegendUtils;
}();

module.exports = LegendUtils;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy91dGlscy9MZWdlbmRVdGlscy5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7SUNBTSxXOzs7OztjQWtCRyx1QixvQ0FBd0IsRyxFQUFLO0FBQ2xDLFdBQU8sS0FBSyxxQkFBTCxDQUEyQixHQUEzQixDQUFQO0FBQ0QsRzs7Y0FFTSxtQixnQ0FBb0IsVSxFQUFZLFEsRUFBVTtBQUMvQyxXQUFPLEtBQUssSUFBTCxDQUFXLFdBQVcsS0FBWCxHQUFtQixXQUFXLE1BQS9CLEdBQXlDLEVBQXpDLEdBQThDLEtBQUssRUFBN0QsSUFBbUUsUUFBMUU7QUFDRCxHOztBQUVEO0FBQ0E7OztjQUNPLGMsMkJBQWUsSSxFQUFNLEksRUFBTTtBQUNoQyxRQUFNLFlBQVksU0FBWixTQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxTQUFYO0FBQUEsYUFBeUIsS0FBSyxJQUFMLENBQVUsQ0FBQyxNQUFNLEdBQVAsRUFBWSxXQUFaLENBQXdCLFNBQXhCLElBQXFDLEdBQXJDLEdBQTJDLEtBQUssRUFBMUQsQ0FBekI7QUFBQSxLQUFsQjs7QUFFQSxRQUFNLGlCQUFpQixTQUFqQixjQUFpQjtBQUFBLGFBQU8sSUFBSSxhQUFKLEdBQW9CLEtBQXBCLENBQTBCLEdBQTFCLEVBQStCLENBQS9CLENBQVA7QUFBQSxLQUF2Qjs7QUFFQTtBQUNBLFFBQU0sT0FBTyxHQUFiO0FBQ0EsUUFBTSxPQUFPLEdBQWI7QUFDQSxRQUFNLE9BQU8sR0FBYjs7QUFFQSxRQUFJLGVBQWdCLE9BQU8sSUFBM0I7O0FBRUE7QUFDQSxRQUFNLDJCQUEyQixLQUFLLEdBQUwsQ0FBUyxlQUFlLFlBQWYsSUFBK0IsZUFBZSxPQUFPLFlBQXRCLENBQXhDLENBQWpDO0FBQ0EsUUFBTSw4QkFBK0IsZUFBZSxZQUFmLE1BQWlDLENBQXRFO0FBQ0EsUUFBTSxZQUFhLDJCQUEyQixDQUEz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QU0sV0FBVyxHQUFYLENBQWU7QUFOdkIsS0FUbUIsRUFpQm5CO0FBQ0UsWUFERjtBQUVFLFVBQUksaUJBQWlCLElBRnZCO0FBR0UsU0FBRyxJQUhMO0FBSUUsU0FBRyxFQUpMO0FBS0UsU0FBRyxpQkFBa0IsSUFBSSxJQUF0QixHQUE4QixpQkFMbkM7QUFNRSxZQUFNLFdBQVcsR0FBWCxDQUFlO0FBTnZCLEtBakJtQixDQUFyQjs7QUEyQkEsU0FBSyxrQkFBTCxHQUEwQixDQUN4QjtBQUNFLFNBQUcsRUFETDtBQUVFLFNBQUcsaUJBQWtCLElBQUksSUFBdEIsR0FBOEI7QUFGbkMsS0FEd0IsQ0FBMUI7QUFNRCxHOzs7O3dCQWhJa0M7QUFDakMsYUFBTztBQUNMLFdBQUcsR0FERSxFQUNNO0FBQ1gsV0FBRyxHQUZFLEVBRU07QUFDWCxXQUFHLEdBSEUsRUFHTTtBQUNYLFlBQUksR0FKQyxFQUlNO0FBQ1gsWUFBSSxJQUxDLEVBS007QUFDWCxZQUFJLElBTkMsRUFNTTtBQUNYLFlBQUksS0FQQyxFQU9NO0FBQ1gsWUFBSSxLQVJDLEVBUU07QUFDWCxZQUFJLEtBVEMsRUFTTTtBQUNYLFlBQUksSUFWQyxFQVVNO0FBQ1gsWUFBSSxJQVhDLEVBQVA7QUFhRDs7Ozs7O0FBcUhILE9BQU8sT0FBUCxHQUFpQixXQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBMZWdlbmRVdGlscyB7XG5cbiAgc3RhdGljIGdldCBleHBvbmVudGlhbFNob3J0Rm9ybXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIDM6ICdrJywgICAgLy8gdGhvdXNhbmRcbiAgICAgIDY6ICdtJywgICAgLy8gbWlsbGlvblxuICAgICAgOTogJ2InLCAgICAvLyBiaWxsaW9uXG4gICAgICAxMjogJ3QnLCAgIC8vIHRyaWxsaW9uXG4gICAgICAxNTogJ3FkJywgIC8vIHF1YWRyaWxsaW9uXG4gICAgICAxODogJ3F0JywgIC8vIHF1aW50aWxsaW9uXG4gICAgICAyMTogJ3N4dCcsIC8vIHNleHRpbGxpb25cbiAgICAgIDI0OiAnc3B0JywgLy8gc2VwdGlsbGlvblxuICAgICAgMjc6ICdvY3QnLCAvLyBvY3RpbGxpYW5cbiAgICAgIDMwOiAnbm4nLCAgLy8gbm9uaWxsaWFuXG4gICAgICAzMzogJ2RjJywgIC8vIGRlY2lsbGlhblxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0RXhwb25lbnRpYWxTaG9ydEZvcm0odmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwb25lbnRpYWxTaG9ydEZvcm1zW3ZhbF07XG4gIH1cblxuICBzdGF0aWMgbm9ybWFsaXplZFp0b1JhZGl1cyh2aWV3Qm94RGltLCBub3JtWnZhbCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHZpZXdCb3hEaW0ud2lkdGggKiB2aWV3Qm94RGltLmhlaWdodCkgLyAxNiAvIE1hdGguUEkpICogbm9ybVp2YWw7XG4gIH1cblxuICAvLyBLWiBUT0RPIHJlbW92ZSAnZGF0YScgc2lkZSBlZmZlY3RcbiAgLy8gVE9ETyBQbyBkZXNjcmliZSB3aHlcbiAgc3RhdGljIGNhbGNaUXVhcnRpbGVzKGRhdGEsIG1heFopIHtcbiAgICBjb25zdCBnZXRaTGFiZWwgPSAodmFsLCBtYXgsIHByZWNpc2lvbikgPT4gTWF0aC5zcXJ0KChtYXggKiB2YWwpLnRvUHJlY2lzaW9uKHByZWNpc2lvbikgLyBtYXggLyBNYXRoLlBJKTtcblxuICAgIGNvbnN0IGdldEV4cG9uZW50aWFsID0gbnVtID0+IG51bS50b0V4cG9uZW50aWFsKCkuc3BsaXQoJ2UnKVsxXTtcblxuICAgIC8vIFF1YXJ0aWxlcyB0aGF0IGRldGVybWluZSBzaXplIG9mIGVhY2ggb2YgdGhlIGxlZ2VuZCBidWJibGVzIGluIHByb3BvcnRpb24gdG8gbWF4aW11bSBaIHZhbFxuICAgIGNvbnN0IHRvcFEgPSAwLjk7XG4gICAgY29uc3QgbWlkUSA9IDAuNDtcbiAgICBjb25zdCBib3RRID0gMC4xO1xuXG4gICAgbGV0IHRvcFF1YXJ0aWxlWiA9IChtYXhaICogdG9wUSk7XG5cbiAgICAvLyBWSVMtMjYyOiBDb21wZW5zYXRlIGZvciBpbmNvbnNpc3RlbnQgc2lnIGZpZ3MgaW4gbGVnZW5kXG4gICAgY29uc3QgZGlmZmVyZW5jZUluRXhwb25lbnRpYWxzID0gTWF0aC5hYnMoZ2V0RXhwb25lbnRpYWwodG9wUXVhcnRpbGVaKSAtIGdldEV4cG9uZW50aWFsKG1pZFEgKiB0b3BRdWFydGlsZVopKTtcbiAgICBjb25zdCBpc1RvcFF1YXJ0aWxlRXhwb25lbnRpYWxPbmUgPSAoZ2V0RXhwb25lbnRpYWwodG9wUXVhcnRpbGVaKSA9PT0gMSk7XG4gICAgY29uc3QgcHJlY2lzaW9uID0gKGRpZmZlcmVuY2VJbkV4cG9uZW50aWFscyA8IDEgJiYgaXNUb3BRdWFydGlsZUV4cG9uZW50aWFsT25lKSA/IDEgOiAyO1xuICAgIHRvcFF1YXJ0aWxlWiA9IHRvcFF1YXJ0aWxlWi50b1ByZWNpc2lvbihwcmVjaXNpb24pO1xuXG4gICAgLy8gQ2FsY3VsYXRpb25zIG5lY2Vzc2FyeSB0byBmaWd1cmUgb3V0IHdoaWNoIHNob3J0IGZvcm0gdG8gYXBwbHlcbiAgICBsZXQgZXhwID0gTWF0aC5sb2codG9wUXVhcnRpbGVaKTtcbiAgICBleHAgPSBNYXRoLnJvdW5kKGV4cCAqIDEwMDAwMCkgLyAxMDAwMDA7XG4gICAgZXhwIC89IE1hdGguTE4xMDtcblxuICAgIGNvbnN0IGV4cERlY2ltYWwgPSBleHAgJSAxO1xuICAgIGV4cCAtPSBleHBEZWNpbWFsO1xuICAgIGNvbnN0IGRpZ2l0c0J0d25TaG9ydEZvcm1zID0gZXhwICUgMztcbiAgICBleHAgLT0gZGlnaXRzQnR3blNob3J0Rm9ybXM7XG4gICAgY29uc3QgZXhwU2hvcnRGb3JtID0gdGhpcy5nZXRFeHBvbmVudGlhbFNob3J0Rm9ybShleHApIHx8ICcnO1xuXG4gICAgY29uc3QgdG9wUXVhcnRpbGVWYWwgPSB0b3BRdWFydGlsZVogLyAoMTAgKiogZXhwKTtcblxuICAgIGRhdGEuWnF1YXJ0aWxlcyA9IHtcbiAgICAgIHRvcDoge1xuICAgICAgICB2YWw6IHRvcFF1YXJ0aWxlVmFsICsgZXhwU2hvcnRGb3JtLFxuICAgICAgICBsYWI6IGdldFpMYWJlbCh0b3BRLCBtYXhaLCBwcmVjaXNpb24pLFxuICAgICAgfSxcbiAgICAgIG1pZDoge1xuICAgICAgICB2YWw6ICh0b3BRdWFydGlsZVogKiBtaWRRKS50b1ByZWNpc2lvbigxKSAvICgxMCAqKiBleHApLFxuICAgICAgICBsYWI6IGdldFpMYWJlbChtaWRRLCB0b3BRdWFydGlsZVosIDEpLFxuICAgICAgfSxcbiAgICAgIGJvdDoge1xuICAgICAgICB2YWw6ICh0b3BRdWFydGlsZVogKiBib3RRKS50b1ByZWNpc2lvbigxKSAvICgxMCAqKiBleHApLFxuICAgICAgICBsYWI6IGdldFpMYWJlbChib3RRLCB0b3BRdWFydGlsZVosIDEpLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBLWiByZW1vdmUgc2lkZSBlZmZlY3QsIGp1c3QgcmV0dXJuIHRoZSBub3JtYWxpemVkIGFycmF5XG4gIC8vIFRPRE8gUG8gZGVzY3JpYmUgd2h5XG4gIHN0YXRpYyBub3JtYWxpemVaVmFsdWVzKGRhdGEsIG1heFopIHtcbiAgICBkYXRhLm5vcm1aID0gZGF0YS5aLm1hcCgoeikgPT4ge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZEFyZWEgPSB6IC8gbWF4WjtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQobm9ybWFsaXplZEFyZWEgLyBNYXRoLlBJKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE8gS1ogcmVtb3ZlIHNpZGUgZWZmZWN0LCBqdXN0IHJldHVybiB0aGUgbm9ybWFsaXplZCBhcnJheVxuICBzdGF0aWMgc2V0dXBCdWJibGVzKGRhdGEpIHtcbiAgICBjb25zdCB7IHZpZXdCb3hEaW0sIFpxdWFydGlsZXMsIGxlZ2VuZERpbSB9ID0gZGF0YTtcblxuICAgIGNvbnN0IHJUb3AgPSB0aGlzLm5vcm1hbGl6ZWRadG9SYWRpdXModmlld0JveERpbSwgWnF1YXJ0aWxlcy50b3AubGFiKTtcbiAgICBjb25zdCByTWlkID0gdGhpcy5ub3JtYWxpemVkWnRvUmFkaXVzKHZpZXdCb3hEaW0sIFpxdWFydGlsZXMubWlkLmxhYik7XG4gICAgY29uc3QgckJvdCA9IHRoaXMubm9ybWFsaXplZFp0b1JhZGl1cyh2aWV3Qm94RGltLCBacXVhcnRpbGVzLmJvdC5sYWIpO1xuICAgIGNvbnN0IGN4ID0gdmlld0JveERpbS54ICsgdmlld0JveERpbS53aWR0aCArIChsZWdlbmREaW0ud2lkdGggLyAyKTtcbiAgICBjb25zdCB2aWV3Qm94WUJvdHRvbSA9IHZpZXdCb3hEaW0ueSArIHZpZXdCb3hEaW0uaGVpZ2h0O1xuICAgIGNvbnN0IGJ1YmJsZVRleHRQYWRkaW5nID0gNTtcblxuICAgIGRhdGEubGVnZW5kQnViYmxlc01heFdpZHRoID0gclRvcCAqIDI7XG5cbiAgICBkYXRhLmxlZ2VuZEJ1YmJsZXMgPSBbXG4gICAgICB7XG4gICAgICAgIGN4LFxuICAgICAgICBjeTogdmlld0JveFlCb3R0b20gLSByVG9wLFxuICAgICAgICByOiByVG9wLFxuICAgICAgICB4OiBjeCxcbiAgICAgICAgeTogdmlld0JveFlCb3R0b20gLSAoMiAqIHJUb3ApIC0gYnViYmxlVGV4dFBhZGRpbmcsXG4gICAgICAgIHRleHQ6IFpxdWFydGlsZXMudG9wLnZhbCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGN4LFxuICAgICAgICBjeTogdmlld0JveFlCb3R0b20gLSByTWlkLFxuICAgICAgICByOiByTWlkLFxuICAgICAgICB4OiBjeCxcbiAgICAgICAgeTogdmlld0JveFlCb3R0b20gLSAoMiAqIHJNaWQpIC0gYnViYmxlVGV4dFBhZGRpbmcsXG4gICAgICAgIHRleHQ6IFpxdWFydGlsZXMubWlkLnZhbCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGN4LFxuICAgICAgICBjeTogdmlld0JveFlCb3R0b20gLSByQm90LFxuICAgICAgICByOiByQm90LFxuICAgICAgICB4OiBjeCxcbiAgICAgICAgeTogdmlld0JveFlCb3R0b20gLSAoMiAqIHJCb3QpIC0gYnViYmxlVGV4dFBhZGRpbmcsXG4gICAgICAgIHRleHQ6IFpxdWFydGlsZXMuYm90LnZhbCxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIGRhdGEubGVnZW5kQnViYmxlc1RpdGxlID0gW1xuICAgICAge1xuICAgICAgICB4OiBjeCxcbiAgICAgICAgeTogdmlld0JveFlCb3R0b20gLSAoMiAqIHJUb3ApIC0gYnViYmxlVGV4dFBhZGRpbmcsXG4gICAgICB9LFxuICAgIF07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMZWdlbmRVdGlscztcblxuIl19

//# sourceMappingURL=../utils/LegendUtils.es6.js.map