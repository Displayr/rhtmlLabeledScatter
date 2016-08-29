// Generated by CoffeeScript 1.8.0
'use strict';
var LabeledScatter;

LabeledScatter = (function() {
  LabeledScatter.plot = null;

  LabeledScatter.data = null;

  function LabeledScatter(width, height) {
    this.width = width;
    this.height = height;
  }

  LabeledScatter.prototype.resize = function(el, width, height) {
    var svg;
    console.log('resize');
    this.width = width;
    this.height = height;
    d3.select('.plot-container').remove();
    svg = d3.select(el).append('svg').attr('width', this.width).attr('height', this.height).attr('class', 'plot-container');
    this.plot.setDim(svg, this.width, this.height);
    this.plot.draw();
    return this;
  };

  LabeledScatter.prototype.draw = function(data, el) {
    var svg;
    svg = d3.select(el).append('svg').attr('width', this.width).attr('height', this.height).attr('class', 'plot-container');
    if ((data.X != null) && (data.Y != null)) {
      this.data = data;
    } else {
      this.data = testData2;
    }
    this.plot = new RectPlot(this.width, this.height, this.data.X, this.data.Y, this.data.Z, this.data.group, this.data.label, svg, this.data.fixedAspectRatio, this.data.xTitle, this.data.yTitle, this.data.title, this.data.colors, this.data.grid, this.data.origin, this.data.originAlign, this.data.titleFontFamily, this.data.titleFontSize, this.data.titleFontColor, this.data.xTitleFontFamily, this.data.xTitleFontSize, this.data.xTitleFontColor, this.data.yTitleFontFamily, this.data.yTitleFontSize, this.data.yTitleFontColor, this.data.labelsFontFamily, this.data.labelsFontSize, this.data.labelsFontColor, this.data.xDecimals, this.data.yDecimals, this.data.xPrefix, this.data.yPrefix, this.data.legendShow, this.data.legendFontFamily, this.data.legendFontSize, this.data.legendFontColor);
    this.plot.draw();
    return this;
  };

  return LabeledScatter;

})();
