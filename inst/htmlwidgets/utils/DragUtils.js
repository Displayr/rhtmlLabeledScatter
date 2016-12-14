// Generated by CoffeeScript 1.8.0
var DragUtils,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

DragUtils = (function() {
  var DU, instance;

  function DragUtils() {}

  instance = null;

  DragUtils.get = function() {
    if (instance == null) {
      instance = new DU();
    }
    return instance;
  };

  DU = (function() {
    function DU() {
      this.getLegendLabelDragAndDrop = __bind(this.getLegendLabelDragAndDrop, this);
    }

    DU.prototype.getLabelDragAndDrop = function(plot, showTrendLine) {
      var dragEnd, dragMove, dragStart;
      if (showTrendLine == null) {
        showTrendLine = false;
      }
      dragStart = function() {
        return plot.svg.selectAll('.link').remove();
      };
      dragMove = function() {
        var id, label;
        d3.select(this).attr('x', d3.event.x).attr('y', d3.event.y);
        id = d3.select(this).attr('id');
        label = _.find(plot.data.lab, function(l) {
          return l.id === Number(id);
        });
        if ($(this).prop("tagName") === 'image') {
          label.x = d3.event.x + label.width / 2;
          return label.y = d3.event.y + label.height;
        } else {
          label.x = d3.event.x;
          return label.y = d3.event.y;
        }
      };
      dragEnd = function() {
        var anc, ancToHide, id, lab, _ref, _ref1;
        id = Number(d3.select(this).attr('id'));
        lab = _.find(plot.data.lab, function(l) {
          return l.id === id;
        });
        anc = _.find(plot.data.pts, function(a) {
          return a.id === id;
        });
        if (plot.data.isOutsideViewBox(lab) && !showTrendLine) {
          plot.data.addElemToLegend(id);
          plot.state.pushLegendPt(id);
          console.log('pushed lp');
          return plot.resetPlotAfterDragEvent();
        } else if (((lab.x - lab.width / 2 < (_ref = anc.x) && _ref < lab.x + lab.width / 2)) && ((lab.y > (_ref1 = anc.y) && _ref1 > lab.y - lab.height))) {
          return ancToHide = plot.svg.select("#anc-" + id).attr('fill-opacity', 0);
        } else {
          plot.state.pushUserPositionedLabel(id, lab.x, lab.y, plot.viewBoxDim);
          ancToHide = plot.svg.select("#anc-" + id).attr('fill-opacity', function(d) {
            return d.fillOpacity;
          });
          if (!showTrendLine) {
            return plot.drawLinks();
          }
        }
      };
      return d3.behavior.drag().origin(function() {
        return {
          x: d3.select(this).attr("x"),
          y: d3.select(this).attr("y")
        };
      }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
    };

    DU.prototype.getLegendLabelDragAndDrop = function(plot, data) {
      var dragEnd, dragMove, dragStart;
      dragStart = function() {};
      dragMove = function() {
        var id, legendPt;
        d3.select(this).attr('x', d3.select(this).x = d3.event.x).attr('y', d3.select(this).y = d3.event.y);
        id = d3.select(this).attr('id').split('legend-')[1];
        legendPt = _.find(data.legendPts, function(l) {
          return l.id === Number(id);
        });
        legendPt.lab.x = d3.event.x;
        return legendPt.lab.y = d3.event.y;
      };
      dragEnd = function() {
        var id, legendPt;
        id = Number(d3.select(this).attr('id').split('legend-')[1]);
        legendPt = _.find(data.legendPts, function(l) {
          return l.id === Number(id);
        });
        if (plot.data.isLegendPtOutsideViewBox(legendPt.lab)) {
          return d3.select(this).attr('x', d3.select(this).x = legendPt.x).attr('y', d3.select(this).y = legendPt.y);
        } else {
          plot.data.removeElemFromLegend(id);
          plot.state.pullLegendPt(id);
          return plot.resetPlotAfterDragEvent();
        }
      };
      return d3.behavior.drag().origin(function() {
        return {
          x: d3.select(this).attr("x"),
          y: d3.select(this).attr("y")
        };
      }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
    };

    return DU;

  })();

  return DragUtils;

})();
