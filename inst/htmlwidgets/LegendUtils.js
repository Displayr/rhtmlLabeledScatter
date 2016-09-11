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

    LU.prototype.getDefaultColor = function(colorWheel, cIndex) {
      return colorWheel[cIndex % colorWheel.length];
    };

    LU.prototype.setupColors = function(data) {
      var group, groupToColorMap, i, legendDim, newColor;
      legendDim = data.legendDim;
      data.legendGroups = [];
      groupToColorMap = {};
      group = data.group;
      i = 0;
      while (i < group.length) {
        if (!(_.some(data.legendGroups, function(e) {
          return e.text === group[i];
        }))) {
          newColor = this.getDefaultColor(data.colorWheel, data.cIndex);
          data.cIndex++;
          data.legendGroups.push({
            text: group[i],
            color: newColor,
            r: legendDim.ptRadius,
            anchor: 'start'
          });
          groupToColorMap[group[i]] = newColor;
        }
        i++;
      }
      return groupToColorMap;
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
      exp = Math.log10(originalNum);
      expDecimal = exp % 1;
      exp -= expDecimal;
      digitsBtwnShortForms = exp % 3;
      exp -= digitsBtwnShortForms;
      final_base = originalNum / Math.pow(10, exp);
      final_shortForm = this.getExponentialShortForm(exp);
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
      var i, normalizedArea, _results;
      i = 0;
      _results = [];
      while (i < data.Z.length) {
        normalizedArea = data.Z[i] / maxZ;
        data.normZ[i] = Math.sqrt(normalizedArea / Math.PI);
        _results.push(i++);
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
