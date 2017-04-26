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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy91dGlscy9MZWdlbmRVdGlscy5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7SUNBTSxXOzs7OztjQWtCRyx1QixvQ0FBd0IsRyxFQUFLO0FBQ2xDLFdBQU8sS0FBSyxxQkFBTCxDQUEyQixHQUEzQixDQUFQO0FBQ0QsRzs7Y0FFTSxtQixnQ0FBb0IsVSxFQUFZLFEsRUFBVTtBQUMvQyxXQUFPLEtBQUssSUFBTCxDQUFXLFdBQVcsS0FBWCxHQUFtQixXQUFXLE1BQS9CLEdBQXlDLEVBQXpDLEdBQThDLEtBQUssRUFBN0QsSUFBbUUsUUFBMUU7QUFDRCxHOztBQUVEO0FBQ0E7OztjQUNPLGMsMkJBQWUsSSxFQUFNLEksRUFBTTtBQUNoQyxRQUFNLFlBQVksU0FBWixTQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxTQUFYO0FBQUEsYUFBeUIsS0FBSyxJQUFMLENBQVUsQ0FBQyxNQUFNLEdBQVAsRUFBWSxXQUFaLENBQXdCLFNBQXhCLElBQXFDLEdBQXJDLEdBQTJDLEtBQUssRUFBMUQsQ0FBekI7QUFBQSxLQUFsQjs7QUFFQSxRQUFNLGlCQUFpQixTQUFqQixjQUFpQjtBQUFBLGFBQU8sSUFBSSxhQUFKLEdBQW9CLEtBQXBCLENBQTBCLEdBQTFCLEVBQStCLENBQS9CLENBQVA7QUFBQSxLQUF2Qjs7QUFFQTtBQUNBLFFBQU0sT0FBTyxHQUFiO0FBQ0EsUUFBTSxPQUFPLEdBQWI7QUFDQSxRQUFNLE9BQU8sR0FBYjs7QUFFQSxRQUFJLGVBQWdCLE9BQU8sSUFBM0I7O0FBRUE7QUFDQSxRQUFNLDJCQUEyQixLQUFLLEdBQUwsQ0FBUyxlQUFlLFlBQWYsSUFBK0IsZUFBZSxPQUFPLFlBQXRCLENBQXhDLENBQWpDO0FBQ0EsUUFBTSxZQUFZLDJCQUEyQixDQUEzQixHQUErQixDQUEvQixHQUFtQyxDQUFyRDtBQUNBLG1CQUFlLGFB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VUFBSSxpQkFBaUIsSUFGdkI7QUFHRSxTQUFHLElBSEw7QUFJRSxTQUFHLEVBSkw7QUFLRSxTQUFHLGlCQUFrQixJQUFJLElBQXRCLEdBQThCLGlCQUxuQztBQU1FLFlBQU0sV0FBVyxHQUFYLENBQWU7QUFOdkIsS0FqQm1CLENBQXJCOztBQTJCQSxTQUFLLGtCQUFMLEdBQTBCLENBQ3hCO0FBQ0UsU0FBRyxFQURMO0FBRUUsU0FBRyxpQkFBa0IsSUFBSSxJQUF0QixHQUE4QjtBQUZuQyxLQUR3QixDQUExQjtBQU1ELEc7Ozs7d0JBL0hrQztBQUNqQyxhQUFPO0FBQ0wsV0FBRyxHQURFLEVBQ007QUFDWCxXQUFHLEdBRkUsRUFFTTtBQUNYLFdBQUcsR0FIRSxFQUdNO0FBQ1gsWUFBSSxHQUpDLEVBSU07QUFDWCxZQUFJLElBTEMsRUFLTTtBQUNYLFlBQUksSUFOQyxFQU1NO0FBQ1gsWUFBSSxLQVBDLEVBT007QUFDWCxZQUFJLEtBUkMsRUFRTTtBQUNYLFlBQUksS0FUQyxFQVNNO0FBQ1gsWUFBSSxJQVZDLEVBVU07QUFDWCxZQUFJLElBWEMsRUFBUDtBQWFEOzs7Ozs7QUFvSEgsT0FBTyxPQUFQLEdBQWlCLFdBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIExlZ2VuZFV0aWxzIHtcblxuICBzdGF0aWMgZ2V0IGV4cG9uZW50aWFsU2hvcnRGb3JtcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgMzogJ2snLCAgICAvLyB0aG91c2FuZFxuICAgICAgNjogJ20nLCAgICAvLyBtaWxsaW9uXG4gICAgICA5OiAnYicsICAgIC8vIGJpbGxpb25cbiAgICAgIDEyOiAndCcsICAgLy8gdHJpbGxpb25cbiAgICAgIDE1OiAncWQnLCAgLy8gcXVhZHJpbGxpb25cbiAgICAgIDE4OiAncXQnLCAgLy8gcXVpbnRpbGxpb25cbiAgICAgIDIxOiAnc3h0JywgLy8gc2V4dGlsbGlvblxuICAgICAgMjQ6ICdzcHQnLCAvLyBzZXB0aWxsaW9uXG4gICAgICAyNzogJ29jdCcsIC8vIG9jdGlsbGlhblxuICAgICAgMzA6ICdubicsICAvLyBub25pbGxpYW5cbiAgICAgIDMzOiAnZGMnLCAgLy8gZGVjaWxsaWFuXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFeHBvbmVudGlhbFNob3J0Rm9ybSh2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5leHBvbmVudGlhbFNob3J0Rm9ybXNbdmFsXTtcbiAgfVxuXG4gIHN0YXRpYyBub3JtYWxpemVkWnRvUmFkaXVzKHZpZXdCb3hEaW0sIG5vcm1admFsKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCgodmlld0JveERpbS53aWR0aCAqIHZpZXdCb3hEaW0uaGVpZ2h0KSAvIDE2IC8gTWF0aC5QSSkgKiBub3JtWnZhbDtcbiAgfVxuXG4gIC8vIEtaIFRPRE8gcmVtb3ZlICdkYXRhJyBzaWRlIGVmZmVjdFxuICAvLyBUT0RPIFBvIGRlc2NyaWJlIHdoeVxuICBzdGF0aWMgY2FsY1pRdWFydGlsZXMoZGF0YSwgbWF4Wikge1xuICAgIGNvbnN0IGdldFpMYWJlbCA9ICh2YWwsIG1heCwgcHJlY2lzaW9uKSA9PiBNYXRoLnNxcnQoKG1heCAqIHZhbCkudG9QcmVjaXNpb24ocHJlY2lzaW9uKSAvIG1heCAvIE1hdGguUEkpO1xuXG4gICAgY29uc3QgZ2V0RXhwb25lbnRpYWwgPSBudW0gPT4gbnVtLnRvRXhwb25lbnRpYWwoKS5zcGxpdCgnZScpWzFdO1xuXG4gICAgLy8gUXVhcnRpbGVzIHRoYXQgZGV0ZXJtaW5lIHNpemUgb2YgZWFjaCBvZiB0aGUgbGVnZW5kIGJ1YmJsZXMgaW4gcHJvcG9ydGlvbiB0byBtYXhpbXVtIFogdmFsXG4gICAgY29uc3QgdG9wUSA9IDAuODtcbiAgICBjb25zdCBtaWRRID0gMC40O1xuICAgIGNvbnN0IGJvdFEgPSAwLjE7XG5cbiAgICBsZXQgdG9wUXVhcnRpbGVaID0gKG1heFogKiB0b3BRKTtcblxuICAgIC8vIFZJUy0yNjI6IENvbXBlbnNhdGUgZm9yIGluY29uc2lzdGVudCBzaWcgZmlncyBpbiBsZWdlbmRcbiAgICBjb25zdCBkaWZmZXJlbmNlSW5FeHBvbmVudGlhbHMgPSBNYXRoLmFicyhnZXRFeHBvbmVudGlhbCh0b3BRdWFydGlsZVopIC0gZ2V0RXhwb25lbnRpYWwobWlkUSAqIHRvcFF1YXJ0aWxlWikpO1xuICAgIGNvbnN0IHByZWNpc2lvbiA9IGRpZmZlcmVuY2VJbkV4cG9uZW50aWFscyA8IDEgPyAxIDogMjtcbiAgICB0b3BRdWFydGlsZVogPSB0b3BRdWFydGlsZVoudG9QcmVjaXNpb24ocHJlY2lzaW9uKTtcblxuICAgIC8vIENhbGN1bGF0aW9ucyBuZWNlc3NhcnkgdG8gZmlndXJlIG91dCB3aGljaCBzaG9ydCBmb3JtIHRvIGFwcGx5XG4gICAgbGV0IGV4cCA9IE1hdGgubG9nKHRvcFF1YXJ0aWxlWik7XG4gICAgZXhwID0gTWF0aC5yb3VuZChleHAgKiAxMDAwMDApIC8gMTAwMDAwO1xuICAgIGV4cCAvPSBNYXRoLkxOMTA7XG5cbiAgICBjb25zdCBleHBEZWNpbWFsID0gZXhwICUgMTtcbiAgICBleHAgLT0gZXhwRGVjaW1hbDtcbiAgICBjb25zdCBkaWdpdHNCdHduU2hvcnRGb3JtcyA9IGV4cCAlIDM7XG4gICAgZXhwIC09IGRpZ2l0c0J0d25TaG9ydEZvcm1zO1xuICAgIGNvbnN0IGV4cFNob3J0Rm9ybSA9IHRoaXMuZ2V0RXhwb25lbnRpYWxTaG9ydEZvcm0oZXhwKSB8fCAnJztcblxuICAgIGNvbnN0IHRvcFF1YXJ0aWxlVmFsID0gdG9wUXVhcnRpbGVaIC8gKDEwICoqIGV4cCk7XG5cbiAgICBkYXRhLlpxdWFydGlsZXMgPSB7XG4gICAgICB0b3A6IHtcbiAgICAgICAgdmFsOiB0b3BRdWFydGlsZVZhbCArIGV4cFNob3J0Rm9ybSxcbiAgICAgICAgbGFiOiBnZXRaTGFiZWwodG9wUSwgbWF4WiwgcHJlY2lzaW9uKSxcbiAgICAgIH0sXG4gICAgICBtaWQ6IHtcbiAgICAgICAgdmFsOiAodG9wUXVhcnRpbGVaICogbWlkUSkudG9QcmVjaXNpb24oMSkgLyAoMTAgKiogZXhwKSxcbiAgICAgICAgbGFiOiBnZXRaTGFiZWwobWlkUSwgdG9wUXVhcnRpbGVaLCAxKSxcbiAgICAgIH0sXG4gICAgICBib3Q6IHtcbiAgICAgICAgdmFsOiAodG9wUXVhcnRpbGVaICogYm90USkudG9QcmVjaXNpb24oMSkgLyAoMTAgKiogZXhwKSxcbiAgICAgICAgbGFiOiBnZXRaTGFiZWwoYm90USwgdG9wUXVhcnRpbGVaLCAxKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE8gS1ogcmVtb3ZlIHNpZGUgZWZmZWN0LCBqdXN0IHJldHVybiB0aGUgbm9ybWFsaXplZCBhcnJheVxuICAvLyBUT0RPIFBvIGRlc2NyaWJlIHdoeVxuICBzdGF0aWMgbm9ybWFsaXplWlZhbHVlcyhkYXRhLCBtYXhaKSB7XG4gICAgZGF0YS5ub3JtWiA9IGRhdGEuWi5tYXAoKHopID0+IHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRBcmVhID0geiAvIG1heFo7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KG5vcm1hbGl6ZWRBcmVhIC8gTWF0aC5QSSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPIEtaIHJlbW92ZSBzaWRlIGVmZmVjdCwganVzdCByZXR1cm4gdGhlIG5vcm1hbGl6ZWQgYXJyYXlcbiAgc3RhdGljIHNldHVwQnViYmxlcyhkYXRhKSB7XG4gICAgY29uc3QgeyB2aWV3Qm94RGltLCBacXVhcnRpbGVzLCBsZWdlbmREaW0gfSA9IGRhdGE7XG5cbiAgICBjb25zdCByVG9wID0gdGhpcy5ub3JtYWxpemVkWnRvUmFkaXVzKHZpZXdCb3hEaW0sIFpxdWFydGlsZXMudG9wLmxhYik7XG4gICAgY29uc3Qgck1pZCA9IHRoaXMubm9ybWFsaXplZFp0b1JhZGl1cyh2aWV3Qm94RGltLCBacXVhcnRpbGVzLm1pZC5sYWIpO1xuICAgIGNvbnN0IHJCb3QgPSB0aGlzLm5vcm1hbGl6ZWRadG9SYWRpdXModmlld0JveERpbSwgWnF1YXJ0aWxlcy5ib3QubGFiKTtcbiAgICBjb25zdCBjeCA9IHZpZXdCb3hEaW0ueCArIHZpZXdCb3hEaW0ud2lkdGggKyAobGVnZW5kRGltLndpZHRoIC8gMik7XG4gICAgY29uc3Qgdmlld0JveFlCb3R0b20gPSB2aWV3Qm94RGltLnkgKyB2aWV3Qm94RGltLmhlaWdodDtcbiAgICBjb25zdCBidWJibGVUZXh0UGFkZGluZyA9IDU7XG5cbiAgICBkYXRhLmxlZ2VuZEJ1YmJsZXNNYXhXaWR0aCA9IHJUb3AgKiAyO1xuXG4gICAgZGF0YS5sZWdlbmRCdWJibGVzID0gW1xuICAgICAge1xuICAgICAgICBjeCxcbiAgICAgICAgY3k6IHZpZXdCb3hZQm90dG9tIC0gclRvcCxcbiAgICAgICAgcjogclRvcCxcbiAgICAgICAgeDogY3gsXG4gICAgICAgIHk6IHZpZXdCb3hZQm90dG9tIC0gKDIgKiByVG9wKSAtIGJ1YmJsZVRleHRQYWRkaW5nLFxuICAgICAgICB0ZXh0OiBacXVhcnRpbGVzLnRvcC52YWwsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjeCxcbiAgICAgICAgY3k6IHZpZXdCb3hZQm90dG9tIC0gck1pZCxcbiAgICAgICAgcjogck1pZCxcbiAgICAgICAgeDogY3gsXG4gICAgICAgIHk6IHZpZXdCb3hZQm90dG9tIC0gKDIgKiByTWlkKSAtIGJ1YmJsZVRleHRQYWRkaW5nLFxuICAgICAgICB0ZXh0OiBacXVhcnRpbGVzLm1pZC52YWwsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjeCxcbiAgICAgICAgY3k6IHZpZXdCb3hZQm90dG9tIC0gckJvdCxcbiAgICAgICAgcjogckJvdCxcbiAgICAgICAgeDogY3gsXG4gICAgICAgIHk6IHZpZXdCb3hZQm90dG9tIC0gKDIgKiByQm90KSAtIGJ1YmJsZVRleHRQYWRkaW5nLFxuICAgICAgICB0ZXh0OiBacXVhcnRpbGVzLmJvdC52YWwsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBkYXRhLmxlZ2VuZEJ1YmJsZXNUaXRsZSA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogY3gsXG4gICAgICAgIHk6IHZpZXdCb3hZQm90dG9tIC0gKDIgKiByVG9wKSAtIGJ1YmJsZVRleHRQYWRkaW5nLFxuICAgICAgfSxcbiAgICBdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGVnZW5kVXRpbHM7XG5cbiJdfQ==

//# sourceMappingURL=../utils/LegendUtils.es6.js.map