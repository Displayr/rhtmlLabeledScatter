// Generated by CoffeeScript 1.8.0
var LabeledScatter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LabeledScatter = (function(_super) {
  var calcViewBoxDim;

  __extends(LabeledScatter, _super);

  function LabeledScatter(el, width, height) {
    LabeledScatter.__super__.constructor.call(this, el, width, height);
    this.width = width;
    this.height = height;
    this._initializeState({
      selected: null
    });
  }

  LabeledScatter.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    return _redraw();
  };

  LabeledScatter.prototype._processConfig = function() {
    console.log('_processConfig. Change this function in your rhtmlWidget');
    console.log('the config has already been added to the context at @config, you must now "process" it');
    return console.log(this.config);
  };

  LabeledScatter.prototype._redraw = function() {
    var anc, data, i, lab, labeler, labels_svg, maxX, maxY, minX, minY, originX, originY, pts, threshold, viewBoxDim;
    console.log('_redraw. Change this function in your rhtmlWidget');
    console.log('the outer SVG has already been created and added to the DOM. You should do things with it');
    console.log(this.outerSvg);
    console.log(testData);
    data = testData;
    viewBoxDim = calcViewBoxDim(testData.X, testData.Y, this.width, this.height);
    viewBoxDim['x'] = this.width / 5;
    viewBoxDim['y'] = this.height / 5;
    this.outerSvg.append('rect').attr('class', 'plot-viewbox').attr('x', viewBoxDim.x).attr('y', viewBoxDim.y).attr('width', viewBoxDim.width).attr('height', viewBoxDim.height).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', '1px');
    minX = Infinity;
    maxX = -Infinity;
    minY = Infinity;
    maxY = -Infinity;
    i = 0;
    while (i < data.X.length) {
      if (minX > data.X[i]) {
        minX = data.X[i];
      }
      if (maxX < data.X[i]) {
        maxX = data.X[i];
      }
      if (minY > data.Y[i]) {
        minY = data.Y[i];
      }
      if (maxY < data.Y[i]) {
        maxY = data.Y[i];
      }
      i++;
    }
    threshold = 0.05;
    i = 0;
    while (i < data.X.length) {
      data.X[i] = threshold + (data.X[i] - minX) / (maxX - minX) * (1 - 2 * threshold);
      data.Y[i] = threshold + (data.Y[i] - minY) / (maxY - minY) * (1 - 2 * threshold);
      i++;
    }
    originX = (-minX) / (maxX - minX) * viewBoxDim.width + viewBoxDim.x;
    originY = (-minY) / (maxY - minY) * viewBoxDim.height + viewBoxDim.y;
    pts = [];
    i = 0;
    while (i < data.X.length) {
      pts.push({
        x: data.X[i] * viewBoxDim.width + viewBoxDim.x,
        y: data.Y[i] * viewBoxDim.height + viewBoxDim.y,
        r: 2,
        label: data.label[i],
        labelX: data.X[i] * viewBoxDim.width + viewBoxDim.x,
        labelY: data.Y[i] * viewBoxDim.height + viewBoxDim.y,
        group: data.group[i]
      });
      i++;
    }
    lab = [];
    anc = [];
    i = 0;
    while (i < data.X.length) {
      lab.push({
        x: data.X[i] * viewBoxDim.width + viewBoxDim.x,
        y: data.Y[i] * viewBoxDim.height + viewBoxDim.y,
        text: data.label[i]
      });
      anc.push({
        x: data.X[i] * viewBoxDim.width + viewBoxDim.x,
        y: data.Y[i] * viewBoxDim.height + viewBoxDim.y,
        r: 2
      });
      i++;
    }
    this.outerSvg.selectAll('.anc').data(pts).enter().append('circle').attr('class', 'anc').attr('cx', function(d) {
      return d.x;
    }).attr('cy', function(d) {
      return d.y;
    }).attr('r', function(d) {
      return d.r;
    });
    labels_svg = this.outerSvg.selectAll('.label').data(lab).enter().append('text').attr('class', 'init-labs').attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', 'Arial Narrow').text(function(d) {
      return d.text;
    });
    i = 0;
    while (i < data.X.length) {
      lab[i].width = labels_svg[0][i].getBBox().width;
      lab[i].height = labels_svg[0][i].getBBox().height;
      i++;
    }
    labels_svg.remove();
    labels_svg = this.outerSvg.selectAll('.label').data(lab).enter().append('text').attr('x', function(d) {
      return d.x - d.width / 2;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', 'Arial Narrow').text(function(d) {
      return d.text;
    });
    labeler = d3.labeler().svg(this.outerSvg).w1(viewBoxDim.x).w2(viewBoxDim.x + viewBoxDim.width).h1(viewBoxDim.y).h2(viewBoxDim.y + viewBoxDim.height).anchor(anc).label(lab).start(500);
    labels_svg.transition().duration(800).attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    });
    this.outerSvg.append('line').attr('class', 'origin').attr('x1', viewBoxDim.x).attr('y1', originY).attr('x2', viewBoxDim.x + viewBoxDim.width).attr('y2', originY).attr('stroke-width', 1).attr('stroke', 'black').style("stroke-dasharray", "3, 3");
    return this.outerSvg.append('line').attr('class', 'origin').attr('x1', originX).attr('y1', viewBoxDim.y).attr('x2', originX).attr('y2', viewBoxDim.y + viewBoxDim.height).attr('stroke-width', 1).attr('stroke', 'black').style("stroke-dasharray", "3, 3");
  };

  calcViewBoxDim = function(X, Y, width, height) {
    return {
      width: width / 2,
      height: height / 2,
      rangeX: Math.max.apply(null, X) - Math.min.apply(null, X),
      rangeY: Math.max.apply(null, Y) - Math.min.apply(null, Y)
    };
  };

  return LabeledScatter;

})(RhtmlSvgWidget);
