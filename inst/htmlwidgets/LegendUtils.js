// Generated by CoffeeScript 1.8.0
var LegendUtils;

LegendUtils = (function() {
  var LU, instance;

  function LegendUtils() {}

  instance = null;

  LegendUtils.get = function() {
    if (instance == null) {
      instance = new LU();
    }
    return instance;
  };

  LU = (function() {
    var exponentialShortForms;

    exponentialShortForms = {
      3: 'k',
      6: 'm',
      9: 'b',
      12: 't',
      15: 'qd',
      18: 'qt',
      21: 'sxt',
      24: 'spt',
      27: 'oct',
      30: 'nn',
      33: 'dc'
    };

    function LU() {}

    LU.prototype.getExponentialShortForm = function(val) {
      return exponentialShortForms[val];
    };

    LU.prototype.normalizedZtoRadius = function(viewBoxDim, normZval) {
      return Math.sqrt(viewBoxDim.width * viewBoxDim.height / 16 / Math.PI) * normZval;
    };

    LU.prototype.calcZQuartiles = function(data, maxZ) {
      var botQ, digitsBtwnShortForms, exp, expDecimal, final_base, final_shortForm, getZLabel, midQ, originalNum, topQ;
      getZLabel = function(val, maxZ, precision) {
        return Math.sqrt((maxZ * val).toPrecision(precision) / maxZ / Math.PI);
      };
      topQ = 0.8;
      midQ = 0.4;
      botQ = 0.1;
      originalNum = (maxZ * topQ).toPrecision(2);
      exp = Math.log(originalNum);
      exp = Math.round(exp * 100000) / 100000;
      exp /= Math.LN10;
      expDecimal = exp % 1;
      exp -= expDecimal;
      digitsBtwnShortForms = exp % 3;
      exp -= digitsBtwnShortForms;
      final_base = originalNum / Math.pow(10, exp);
      final_shortForm = this.getExponentialShortForm(exp);
      if (final_shortForm == null) {
        final_shortForm = '';
      }
      return data.Zquartiles = {
        top: {
          val: final_base + final_shortForm,
          lab: getZLabel(topQ, maxZ, 2)
        },
        mid: {
          val: (maxZ * midQ).toPrecision(1) / Math.pow(10, exp),
          lab: getZLabel(midQ, maxZ, 1)
        },
        bot: {
          val: (maxZ * botQ).toPrecision(1) / Math.pow(10, exp),
          lab: getZLabel(botQ, maxZ, 1)
        }
      };
    };

    LU.prototype.normalizeZValues = function(data, maxZ) {
      var i, normalizedArea, z, _i, _len, _ref, _results;
      _ref = data.Z;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        z = _ref[i];
        normalizedArea = z / maxZ;
        _results.push(data.normZ[i] = Math.sqrt(normalizedArea / Math.PI));
      }
      return _results;
    };

    LU.prototype.setupBubbles = function(data) {
      var Zquartiles, bubbleTextPadding, cx, legendDim, rBot, rMid, rTop, viewBoxDim, viewBoxYBottom;
      viewBoxDim = data.viewBoxDim;
      Zquartiles = data.Zquartiles;
      legendDim = data.legendDim;
      rTop = this.normalizedZtoRadius(viewBoxDim, Zquartiles.top.lab);
      rMid = this.normalizedZtoRadius(viewBoxDim, Zquartiles.mid.lab);
      rBot = this.normalizedZtoRadius(viewBoxDim, Zquartiles.bot.lab);
      cx = viewBoxDim.x + viewBoxDim.width + legendDim.width / 2;
      viewBoxYBottom = viewBoxDim.y + viewBoxDim.height;
      bubbleTextPadding = 5;
      data.legendBubblesMaxWidth = rTop * 2;
      data.legendBubbles = [
        {
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
        }
      ];
      return data.legendBubblesTitle = [
        {
          x: cx,
          y: viewBoxYBottom - 2 * rTop - bubbleTextPadding
        }
      ];
    };

    return LU;

  })();

  return LegendUtils;

})();
