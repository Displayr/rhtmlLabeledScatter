// Generated by CoffeeScript 1.8.0
var PlotData;

PlotData = (function() {
  function PlotData(X, Y, group, label, viewBoxDim, colors) {
    this.X = X;
    this.Y = Y;
    this.origX = X.slice(0);
    this.origY = Y.slice(0);
    this.group = group;
    this.label = label;
    this.viewBoxDim = viewBoxDim;
    this.colorWheel = colors ? colors : ['#5B9BD5', '#ED7D31', '#A5A5A5', '#1EC000', '#4472C4', '#70AD47', '#255E91', '#9E480E', '#636363', '#997300', '#264478', '#43682B', '#FF2323'];
    this.cIndex = 0;
    if (this.X.length === this.Y.length) {
      this.len = X.length;
      this.normalizeData();
      this.initDataArrays();
    } else {
      throw new Error("Inputs X and Y lengths do not match!");
    }
  }

  PlotData.prototype.normalizeData = function() {
    var i, threshold;
    this.minX = Infinity;
    this.maxX = -Infinity;
    this.minY = Infinity;
    this.maxY = -Infinity;
    i = 0;
    while (i < this.len) {
      if (this.minX > this.X[i]) {
        this.minX = this.X[i];
      }
      if (this.maxX < this.X[i]) {
        this.maxX = this.X[i];
      }
      if (this.minY > this.Y[i]) {
        this.minY = this.Y[i];
      }
      if (this.maxY < this.Y[i]) {
        this.maxY = this.Y[i];
      }
      i++;
    }
    threshold = 0.05;
    i = 0;
    while (i < this.len) {
      this.X[i] = (this.X[i] - this.minX) / (this.maxX - this.minX);
      this.Y[i] = (this.Y[i] - this.minY) / (this.maxY - this.minY);
      i++;
    }
  };

  PlotData.prototype.initDataArrays = function() {
    var group, i, newColor, thres, _results;
    this.pts = [];
    this.lab = [];
    this.anc = [];
    this.legend = [];
    group = this.group;
    i = 0;
    _results = [];
    while (i < this.len) {
      if (!(_.some(this.legend, function(e) {
        return e.text === group[i];
      }))) {
        newColor = this.getDefaultColor();
        this.legend.push({
          text: this.group[i],
          color: newColor
        });
      }
      thres = 0.08;
      this.pts.push({
        x: this.X[i] * (1 - 2 * thres) * this.viewBoxDim.width + this.viewBoxDim.x + this.viewBoxDim.width * thres,
        y: (1 - this.Y[i]) * this.viewBoxDim.height * (1 - 2 * thres) + this.viewBoxDim.y + this.viewBoxDim.height * thres,
        r: 2,
        label: this.label[i],
        labelX: this.origX[i].toPrecision(3).toString(),
        labelY: this.origY[i].toPrecision(3).toString(),
        group: this.group[i],
        color: newColor
      });
      this.lab.push({
        x: this.X[i] * (1 - 2 * thres) * this.viewBoxDim.width + this.viewBoxDim.x + this.viewBoxDim.width * thres,
        y: (1 - this.Y[i]) * this.viewBoxDim.height * (1 - 2 * thres) + this.viewBoxDim.y + this.viewBoxDim.height * thres,
        text: this.label[i],
        color: newColor
      });
      this.anc.push({
        x: this.X[i] * (1 - 2 * thres) * this.viewBoxDim.width + this.viewBoxDim.x + this.viewBoxDim.width * thres,
        y: (1 - this.Y[i]) * this.viewBoxDim.height * (1 - 2 * thres) + this.viewBoxDim.y + this.viewBoxDim.height * thres,
        r: 2
      });
      _results.push(i++);
    }
    return _results;
  };

  PlotData.prototype.getDefaultColor = function() {
    return this.colorWheel[(this.cIndex++) % this.colorWheel.length];
  };

  return PlotData;

})();
