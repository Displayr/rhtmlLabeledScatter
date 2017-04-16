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

<<<<<<< HEAD
    var getExponential = function getExponential(num) {
      return num.toExponential().split('e')[1];
=======
    LU.prototype.calcZQuartiles = function(data, maxZ) {
      var botQ, differenceInExponentials, digitsBtwnShortForms, exp, expDecimal, exp_shortForm, getExponential, getZLabel, midQ, precision, topQ, topQuartileVal, topQuartileZ;
      getZLabel = function(val, maxZ, precision) {
        return Math.sqrt((maxZ * val).toPrecision(precision) / maxZ / Math.PI);
      };
      getExponential = function(num) {
        return num.toExponential().split('e')[1];
      };
      topQ = 0.9;
      midQ = 0.4;
      botQ = 0.1;
      topQuartileZ = maxZ * topQ;
      differenceInExponentials = Math.abs(getExponential(topQuartileZ) - getExponential(midQ * topQuartileZ));
      precision = differenceInExponentials < 1 ? 1 : 2;
      topQuartileZ = topQuartileZ.toPrecision(precision);
      exp = Math.log(topQuartileZ);
      exp = Math.round(exp * 100000) / 100000;
      exp /= Math.LN10;
      expDecimal = exp % 1;
      exp -= expDecimal;
      digitsBtwnShortForms = exp % 3;
      exp -= digitsBtwnShortForms;
      exp_shortForm = this.getExponentialShortForm(exp);
      if (exp_shortForm == null) {
        exp_shortForm = '';
      }
      topQuartileVal = topQuartileZ / Math.pow(10, exp);
      return data.Zquartiles = {
        top: {
          val: topQuartileVal + exp_shortForm,
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
>>>>>>> Changes to fix legend bubbles
    };

    // Quartiles that determine size of each of the legend bubbles in proportion to maximum Z val
    var topQ = 0.8;
    var midQ = 0.4;
    var botQ = 0.1;

    var topQuartileZ = maxZ * topQ;

    // VIS-262: Compensate for inconsistent sig figs in legend
    var differenceInExponentials = Math.abs(getExponential(topQuartileZ) - getExponential(midQ * topQuartileZ));
    var precision = differenceInExponentials < 1 ? 1 : 2;
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

    var topQuartileVal = topQuartileZ / 10 ** exp;

    data.Zquartiles = {
      top: {
        val: topQuartileVal + expShortForm,
        lab: getZLabel(topQ, maxZ, precision)
      },
      mid: {
        val: (topQuartileZ * midQ).toPrecision(1) / 10 ** exp,
        lab: getZLabel(midQ, topQuartileZ, 1)
      },
      bot: {
        val: (topQuartileZ * botQ).toPrecision(1) / 10 ** exp,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy91dGlscy9MZWdlbmRVdGlscy5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7SUNBTSxXOzs7OztjQWtCRyx1QixvQ0FBd0IsRyxFQUFLO0FBQ2xDLFdBQU8sS0FBSyxxQkFBTCxDQUEyQixHQUEzQixDQUFQO0FBQ0QsRzs7Y0FFTSxtQixnQ0FBb0IsVSxFQUFZLFEsRUFBVTtBQUMvQyxXQUFPLEtBQUssSUFBTCxDQUFXLFdBQVcsS0FBWCxHQUFtQixXQUFXLE1BQS9CLEdBQXlDLEVBQXpDLEdBQThDLEtBQUssRUFBN0QsSUFBbUUsUUFBMUU7QUFDRCxHOztBQUVEO0FBQ0E7OztjQUNPLGMsMkJBQWUsSSxFQUFNLEksRUFBTTtBQUNoQyxRQUFNLFlBQVksU0FBWixTQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxTQUFYO0FBQUEsYUFBeUIsS0FBSyxJQUFMLENBQVUsQ0FBQyxNQUFNLEdBQVAsRUFBWSxXQUFaLENBQXdCLFNBQXhCLElBQXFDLEdBQXJDLEdBQTJDLEtBQUssRUFBMUQsQ0FBekI7QUFBQSxLQUFsQjs7QUFFQSxRQUFNLGlCQUFpQixTQUFqQixjQUFpQjtBQUFBLGFBQU8sSUFBSSxhQUFKLEdBQW9CLEtBQXBCLENBQTBCLEdBQTFCLEVBQStCLENBQS9CLENBQVA7QUFBQSxLQUF2Qjs7QUFFQTtBQUNBLFFBQU0sT0FBTyxHQUFiO0FBQ0EsUUFBTSxPQUFPLEdBQWI7QUFDQSxRQUFNLE9BQU8sR0FBYjs7QUFFQSxRQUFJLGVBQWdCLE9BQU8sSUFBM0I7O0FBRUE7QUFDQSxRQUFNLDJCQUEyQixLQUFLLEdBQUwsQ0FBUyxlQUFlLFlBQWYsSUFBK0IsZUFBZSxPQUFPLFlBQXRCLENBQXhDLENBQWpDO0FBQ0EsUUFBTSxZQUFZLDJCQUEyQixDQUEzQixHQUErQixDQUEvQixHQUFtQyxDQUFyRDtBQUNBLG1CQUFlLGFB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U0FBRyxFQUpMO0FBS0UsU0FBRyxpQkFBa0IsSUFBSSxJQUF0QixHQUE4QixpQkFMbkM7QUFNRSxZQUFNLFdBQVcsR0FBWCxDQUFlO0FBTnZCLEtBakJtQixDQUFyQjs7QUEyQkEsU0FBSyxrQkFBTCxHQUEwQixDQUN4QjtBQUNFLFNBQUcsRUFETDtBQUVFLFNBQUcsaUJBQWtCLElBQUksSUFBdEIsR0FBOEI7QUFGbkMsS0FEd0IsQ0FBMUI7QUFNRCxHOzs7O3dCQS9Ia0M7QUFDakMsYUFBTztBQUNMLFdBQUcsR0FERSxFQUNNO0FBQ1gsV0FBRyxHQUZFLEVBRU07QUFDWCxXQUFHLEdBSEUsRUFHTTtBQUNYLFlBQUksR0FKQyxFQUlNO0FBQ1gsWUFBSSxJQUxDLEVBS007QUFDWCxZQUFJLElBTkMsRUFNTTtBQUNYLFlBQUksS0FQQyxFQU9NO0FBQ1gsWUFBSSxLQVJDLEVBUU07QUFDWCxZQUFJLEtBVEMsRUFTTTtBQUNYLFlBQUksSUFWQyxFQVVNO0FBQ1gsWUFBSSxJQVhDLEVBQVA7QUFhRDs7Ozs7O0FBb0hILE9BQU8sT0FBUCxHQUFpQixXQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBMZWdlbmRVdGlscyB7XG5cbiAgc3RhdGljIGdldCBleHBvbmVudGlhbFNob3J0Rm9ybXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIDM6ICdrJywgICAgLy8gdGhvdXNhbmRcbiAgICAgIDY6ICdtJywgICAgLy8gbWlsbGlvblxuICAgICAgOTogJ2InLCAgICAvLyBiaWxsaW9uXG4gICAgICAxMjogJ3QnLCAgIC8vIHRyaWxsaW9uXG4gICAgICAxNTogJ3FkJywgIC8vIHF1YWRyaWxsaW9uXG4gICAgICAxODogJ3F0JywgIC8vIHF1aW50aWxsaW9uXG4gICAgICAyMTogJ3N4dCcsIC8vIHNleHRpbGxpb25cbiAgICAgIDI0OiAnc3B0JywgLy8gc2VwdGlsbGlvblxuICAgICAgMjc6ICdvY3QnLCAvLyBvY3RpbGxpYW5cbiAgICAgIDMwOiAnbm4nLCAgLy8gbm9uaWxsaWFuXG4gICAgICAzMzogJ2RjJywgIC8vIGRlY2lsbGlhblxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0RXhwb25lbnRpYWxTaG9ydEZvcm0odmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwb25lbnRpYWxTaG9ydEZvcm1zW3ZhbF07XG4gIH1cblxuICBzdGF0aWMgbm9ybWFsaXplZFp0b1JhZGl1cyh2aWV3Qm94RGltLCBub3JtWnZhbCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHZpZXdCb3hEaW0ud2lkdGggKiB2aWV3Qm94RGltLmhlaWdodCkgLyAxNiAvIE1hdGguUEkpICogbm9ybVp2YWw7XG4gIH1cblxuICAvLyBLWiBUT0RPIHJlbW92ZSAnZGF0YScgc2lkZSBlZmZlY3RcbiAgLy8gVE9ETyBQbyBkZXNjcmliZSB3aHlcbiAgc3RhdGljIGNhbGNaUXVhcnRpbGVzKGRhdGEsIG1heFopIHtcbiAgICBjb25zdCBnZXRaTGFiZWwgPSAodmFsLCBtYXgsIHByZWNpc2lvbikgPT4gTWF0aC5zcXJ0KChtYXggKiB2YWwpLnRvUHJlY2lzaW9uKHByZWNpc2lvbikgLyBtYXggLyBNYXRoLlBJKTtcblxuICAgIGNvbnN0IGdldEV4cG9uZW50aWFsID0gbnVtID0+IG51bS50b0V4cG9uZW50aWFsKCkuc3BsaXQoJ2UnKVsxXTtcblxuICAgIC8vIFF1YXJ0aWxlcyB0aGF0IGRldGVybWluZSBzaXplIG9mIGVhY2ggb2YgdGhlIGxlZ2VuZCBidWJibGVzIGluIHByb3BvcnRpb24gdG8gbWF4aW11bSBaIHZhbFxuICAgIGNvbnN0IHRvcFEgPSAwLjg7XG4gICAgY29uc3QgbWlkUSA9IDAuNDtcbiAgICBjb25zdCBib3RRID0gMC4xO1xuXG4gICAgbGV0IHRvcFF1YXJ0aWxlWiA9IChtYXhaICogdG9wUSk7XG5cbiAgICAvLyBWSVMtMjYyOiBDb21wZW5zYXRlIGZvciBpbmNvbnNpc3RlbnQgc2lnIGZpZ3MgaW4gbGVnZW5kXG4gICAgY29uc3QgZGlmZmVyZW5jZUluRXhwb25lbnRpYWxzID0gTWF0aC5hYnMoZ2V0RXhwb25lbnRpYWwodG9wUXVhcnRpbGVaKSAtIGdldEV4cG9uZW50aWFsKG1pZFEgKiB0b3BRdWFydGlsZVopKTtcbiAgICBjb25zdCBwcmVjaXNpb24gPSBkaWZmZXJlbmNlSW5FeHBvbmVudGlhbHMgPCAxID8gMSA6IDI7XG4gICAgdG9wUXVhcnRpbGVaID0gdG9wUXVhcnRpbGVaLnRvUHJlY2lzaW9uKHByZWNpc2lvbik7XG5cbiAgICAvLyBDYWxjdWxhdGlvbnMgbmVjZXNzYXJ5IHRvIGZpZ3VyZSBvdXQgd2hpY2ggc2hvcnQgZm9ybSB0byBhcHBseVxuICAgIGxldCBleHAgPSBNYXRoLmxvZyh0b3BRdWFydGlsZVopO1xuICAgIGV4cCA9IE1hdGgucm91bmQoZXhwICogMTAwMDAwKSAvIDEwMDAwMDtcbiAgICBleHAgLz0gTWF0aC5MTjEwO1xuXG4gICAgY29uc3QgZXhwRGVjaW1hbCA9IGV4cCAlIDE7XG4gICAgZXhwIC09IGV4cERlY2ltYWw7XG4gICAgY29uc3QgZGlnaXRzQnR3blNob3J0Rm9ybXMgPSBleHAgJSAzO1xuICAgIGV4cCAtPSBkaWdpdHNCdHduU2hvcnRGb3JtcztcbiAgICBjb25zdCBleHBTaG9ydEZvcm0gPSB0aGlzLmdldEV4cG9uZW50aWFsU2hvcnRGb3JtKGV4cCkgfHwgJyc7XG5cbiAgICBjb25zdCB0b3BRdWFydGlsZVZhbCA9IHRvcFF1YXJ0aWxlWiAvICgxMCAqKiBleHApO1xuXG4gICAgZGF0YS5acXVhcnRpbGVzID0ge1xuICAgICAgdG9wOiB7XG4gICAgICAgIHZhbDogdG9wUXVhcnRpbGVWYWwgKyBleHBTaG9ydEZvcm0sXG4gICAgICAgIGxhYjogZ2V0WkxhYmVsKHRvcFEsIG1heFosIHByZWNpc2lvbiksXG4gICAgICB9LFxuICAgICAgbWlkOiB7XG4gICAgICAgIHZhbDogKHRvcFF1YXJ0aWxlWiAqIG1pZFEpLnRvUHJlY2lzaW9uKDEpIC8gKDEwICoqIGV4cCksXG4gICAgICAgIGxhYjogZ2V0WkxhYmVsKG1pZFEsIHRvcFF1YXJ0aWxlWiwgMSksXG4gICAgICB9LFxuICAgICAgYm90OiB7XG4gICAgICAgIHZhbDogKHRvcFF1YXJ0aWxlWiAqIGJvdFEpLnRvUHJlY2lzaW9uKDEpIC8gKDEwICoqIGV4cCksXG4gICAgICAgIGxhYjogZ2V0WkxhYmVsKGJvdFEsIHRvcFF1YXJ0aWxlWiwgMSksXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICAvLyBUT0RPIEtaIHJlbW92ZSBzaWRlIGVmZmVjdCwganVzdCByZXR1cm4gdGhlIG5vcm1hbGl6ZWQgYXJyYXlcbiAgLy8gVE9ETyBQbyBkZXNjcmliZSB3aHlcbiAgc3RhdGljIG5vcm1hbGl6ZVpWYWx1ZXMoZGF0YSwgbWF4Wikge1xuICAgIGRhdGEubm9ybVogPSBkYXRhLloubWFwKCh6KSA9PiB7XG4gICAgICBjb25zdCBub3JtYWxpemVkQXJlYSA9IHogLyBtYXhaO1xuICAgICAgcmV0dXJuIE1hdGguc3FydChub3JtYWxpemVkQXJlYSAvIE1hdGguUEkpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVE9ETyBLWiByZW1vdmUgc2lkZSBlZmZlY3QsIGp1c3QgcmV0dXJuIHRoZSBub3JtYWxpemVkIGFycmF5XG4gIHN0YXRpYyBzZXR1cEJ1YmJsZXMoZGF0YSkge1xuICAgIGNvbnN0IHsgdmlld0JveERpbSwgWnF1YXJ0aWxlcywgbGVnZW5kRGltIH0gPSBkYXRhO1xuXG4gICAgY29uc3QgclRvcCA9IHRoaXMubm9ybWFsaXplZFp0b1JhZGl1cyh2aWV3Qm94RGltLCBacXVhcnRpbGVzLnRvcC5sYWIpO1xuICAgIGNvbnN0IHJNaWQgPSB0aGlzLm5vcm1hbGl6ZWRadG9SYWRpdXModmlld0JveERpbSwgWnF1YXJ0aWxlcy5taWQubGFiKTtcbiAgICBjb25zdCByQm90ID0gdGhpcy5ub3JtYWxpemVkWnRvUmFkaXVzKHZpZXdCb3hEaW0sIFpxdWFydGlsZXMuYm90LmxhYik7XG4gICAgY29uc3QgY3ggPSB2aWV3Qm94RGltLnggKyB2aWV3Qm94RGltLndpZHRoICsgKGxlZ2VuZERpbS53aWR0aCAvIDIpO1xuICAgIGNvbnN0IHZpZXdCb3hZQm90dG9tID0gdmlld0JveERpbS55ICsgdmlld0JveERpbS5oZWlnaHQ7XG4gICAgY29uc3QgYnViYmxlVGV4dFBhZGRpbmcgPSA1O1xuXG4gICAgZGF0YS5sZWdlbmRCdWJibGVzTWF4V2lkdGggPSByVG9wICogMjtcblxuICAgIGRhdGEubGVnZW5kQnViYmxlcyA9IFtcbiAgICAgIHtcbiAgICAgICAgY3gsXG4gICAgICAgIGN5OiB2aWV3Qm94WUJvdHRvbSAtIHJUb3AsXG4gICAgICAgIHI6IHJUb3AsXG4gICAgICAgIHg6IGN4LFxuICAgICAgICB5OiB2aWV3Qm94WUJvdHRvbSAtICgyICogclRvcCkgLSBidWJibGVUZXh0UGFkZGluZyxcbiAgICAgICAgdGV4dDogWnF1YXJ0aWxlcy50b3AudmFsLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY3gsXG4gICAgICAgIGN5OiB2aWV3Qm94WUJvdHRvbSAtIHJNaWQsXG4gICAgICAgIHI6IHJNaWQsXG4gICAgICAgIHg6IGN4LFxuICAgICAgICB5OiB2aWV3Qm94WUJvdHRvbSAtICgyICogck1pZCkgLSBidWJibGVUZXh0UGFkZGluZyxcbiAgICAgICAgdGV4dDogWnF1YXJ0aWxlcy5taWQudmFsLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY3gsXG4gICAgICAgIGN5OiB2aWV3Qm94WUJvdHRvbSAtIHJCb3QsXG4gICAgICAgIHI6IHJCb3QsXG4gICAgICAgIHg6IGN4LFxuICAgICAgICB5OiB2aWV3Qm94WUJvdHRvbSAtICgyICogckJvdCkgLSBidWJibGVUZXh0UGFkZGluZyxcbiAgICAgICAgdGV4dDogWnF1YXJ0aWxlcy5ib3QudmFsLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgZGF0YS5sZWdlbmRCdWJibGVzVGl0bGUgPSBbXG4gICAgICB7XG4gICAgICAgIHg6IGN4LFxuICAgICAgICB5OiB2aWV3Qm94WUJvdHRvbSAtICgyICogclRvcCkgLSBidWJibGVUZXh0UGFkZGluZyxcbiAgICAgIH0sXG4gICAgXTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExlZ2VuZFV0aWxzO1xuXG4iXX0=

//# sourceMappingURL=../utils/LegendUtils.es6.js.map