// Generated by CoffeeScript 1.8.0
var RectPlot;

RectPlot = (function() {
  function RectPlot(width, height, X, Y, group, label, svg) {
    this.svg = svg;
    this.yAxisPadding = 50;
    this.xAxisPadding = 40;
    this.legendDim = {
      width: 300,
      heightOfRow: 25,
      rightPadding: 10,
      ptRadius: 6,
      leftPadding: 30,
      ptToTextSpace: 15,
      maxTextWidth: -Infinity
    };
    this.viewBoxDim = {
      svgWidth: width,
      svgHeight: height,
      width: width - this.legendDim.width,
      height: height - this.xAxisPadding - 20,
      x: this.yAxisPadding + 25,
      y: 10
    };
    this.legendDim.x = this.viewBoxDim.x + this.viewBoxDim.width;
    this.data = new PlotData(X, Y, group, label, this.viewBoxDim, this.legendDim);
  }

  RectPlot.prototype.draw = function() {
    this.drawLegend(this.svg, this.data, this.drawLegend);
    this.svg.append('rect').attr('class', 'plot-viewbox').attr('x', this.viewBoxDim.x).attr('y', this.viewBoxDim.y).attr('width', this.viewBoxDim.width).attr('height', this.viewBoxDim.height).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', '1px');
    this.drawDimensionMarkers(this.svg, this.viewBoxDim, this.data);
    this.drawAxisLabels(this.svg, this.viewBoxDim, this.xAxisPadding, this.yAxisPadding);
    this.drawAnc(this.svg, this.data);
    return this.drawLabs(this.svg, this.data, this.drawAnc, this.viewBoxDim, this.drawLinks, this.drawLabs, this.xAxisPadding, this.yAxisPadding, this.drawAxisLabels, this.drawDimensionMarkers);
  };

  RectPlot.prototype.redraw = function() {
    var elem, plotElems, _i, _len;
    plotElems = ['.plot-viewbox', '.origin', '.dim-marker', '.dim-marker-leader', '.dim-marker-label', '.axis-label', '.legend-pts', '.legend-text', '.anc', '.lab', '.link'];
    for (_i = 0, _len = plotElems.length; _i < _len; _i++) {
      elem = plotElems[_i];
      this.svg.selectAll(elem).remove();
    }
    return this.draw();
  };

  RectPlot.prototype.drawDimensionMarkers = function(svg, viewBoxDim, data) {
    var between, colsNegative, colsPositive, dimensionMarkerLabelStack, dimensionMarkerLeaderStack, dimensionMarkerStack, getTickRange, i, normalizeXCoords, normalizeYCoords, oax, oay, originAxis, pushDimensionMarker, rowsNegative, rowsPositive, ticksX, ticksY, val, x1, x2, y1, y2;
    getTickRange = function(max, min) {
      var maxTicks, pow10x, range, roundedTickRange, unroundedTickSize, x;
      maxTicks = 8;
      range = max - min;
      unroundedTickSize = range / (maxTicks - 1);
      x = Math.ceil(Math.log10(unroundedTickSize) - 1);
      pow10x = Math.pow(10, x);
      roundedTickRange = Math.ceil(unroundedTickSize / pow10x) * pow10x;
      return roundedTickRange;
    };
    between = function(num, min, max) {
      return num > min && num < max;
    };
    pushDimensionMarker = function(type, x1, y1, x2, y2, label) {
      var labelHeight, leaderLineLen, numShown;
      leaderLineLen = 5;
      labelHeight = 15;
      numShown = label.toFixed(1);
      if (type === 'c') {
        dimensionMarkerLeaderStack.push({
          x1: x1,
          y1: y2,
          x2: x1,
          y2: y2 + leaderLineLen
        });
        dimensionMarkerLabelStack.push({
          x: x1,
          y: y2 + leaderLineLen + labelHeight,
          label: numShown,
          anchor: 'middle'
        });
      }
      if (type === 'r') {
        dimensionMarkerLeaderStack.push({
          x1: x1 - leaderLineLen,
          y1: y1,
          x2: x1,
          y2: y2
        });
        return dimensionMarkerLabelStack.push({
          x: x1 - leaderLineLen,
          y: y2 + labelHeight / 3,
          label: numShown,
          anchor: 'end'
        });
      }
    };
    normalizeXCoords = function(Xcoord) {
      return (Xcoord - data.minX) / (data.maxX - data.minX) * viewBoxDim.width + viewBoxDim.x;
    };
    normalizeYCoords = function(Ycoord) {
      return -(Ycoord - data.minY) / (data.maxY - data.minY) * viewBoxDim.height + viewBoxDim.y + viewBoxDim.height;
    };
    dimensionMarkerStack = [];
    dimensionMarkerLeaderStack = [];
    dimensionMarkerLabelStack = [];
    ticksX = getTickRange(data.maxX, data.minX);
    ticksY = getTickRange(data.maxY, data.minY);
    originAxis = [];
    oax = {
      x1: viewBoxDim.x,
      y1: normalizeYCoords(0),
      x2: viewBoxDim.x + viewBoxDim.width,
      y2: normalizeYCoords(0)
    };
    pushDimensionMarker('r', oax.x1, oax.y1, oax.x2, oax.y2, 0);
    if (!((data.minY === 0) || (data.maxY === 0))) {
      originAxis.push(oax);
    }
    oay = {
      x1: normalizeXCoords(0),
      y1: viewBoxDim.y,
      x2: normalizeXCoords(0),
      y2: viewBoxDim.y + viewBoxDim.height
    };
    pushDimensionMarker('c', oay.x1, oay.y1, oay.x2, oay.y2, 0);
    if (!((data.minX === 0) || (data.maxX === 0))) {
      originAxis.push(oay);
    }
    svg.selectAll('.origin').remove();
    svg.selectAll('.origin').data(originAxis).enter().append('line').attr('class', 'origin').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', 1).attr('stroke', 'black').style('stroke-dasharray', '4, 6');
    colsPositive = 0;
    colsNegative = 0;
    i = ticksX;
    while (between(i, data.minX, data.maxX) || between(-i, data.minX, data.maxX)) {
      if (between(i, data.minX, data.maxX)) {
        colsPositive++;
      }
      if (between(-i, data.minX, data.maxX)) {
        colsNegative++;
      }
      i += ticksX;
    }
    rowsPositive = 0;
    rowsNegative = 0;
    i = ticksY;
    while (between(i, data.minY, data.maxY) || between(-i, data.minY, data.maxY)) {
      if (between(i, data.minY, data.maxY)) {
        rowsNegative++;
      }
      if (between(-i, data.minY, data.maxY)) {
        rowsPositive++;
      }
      i += ticksY;
    }
    i = 0;
    while (i < Math.max(colsPositive, colsNegative)) {
      if (i < colsPositive) {
        val = (i + 1) * ticksX;
        x1 = normalizeXCoords(val);
        y1 = viewBoxDim.y;
        x2 = normalizeXCoords(val);
        y2 = viewBoxDim.y + viewBoxDim.height;
        dimensionMarkerStack.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
        if (i % 2) {
          pushDimensionMarker('c', x1, y1, x2, y2, val);
        }
      }
      if (i < colsNegative) {
        val = -(i + 1) * ticksX;
        x1 = normalizeXCoords(val);
        y1 = viewBoxDim.y;
        x2 = normalizeXCoords(val);
        y2 = viewBoxDim.y + viewBoxDim.height;
        dimensionMarkerStack.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
        if (i % 2) {
          pushDimensionMarker('c', x1, y1, x2, y2, val);
        }
      }
      i++;
    }
    i = 0;
    while (i < Math.max(rowsPositive, rowsNegative)) {
      x1 = y1 = x2 = y2 = 0;
      if (i < rowsPositive) {
        val = -(i + 1) * ticksY;
        x1 = viewBoxDim.x;
        y1 = normalizeYCoords(val);
        x2 = viewBoxDim.x + viewBoxDim.width;
        y2 = normalizeYCoords(val);
        dimensionMarkerStack.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
        if (i % 2) {
          pushDimensionMarker('r', x1, y1, x2, y2, val);
        }
      }
      if (i < rowsNegative) {
        val = (i + 1) * ticksY;
        x1 = viewBoxDim.x;
        y1 = normalizeYCoords(val);
        x2 = viewBoxDim.x + viewBoxDim.width;
        y2 = normalizeYCoords(val);
        dimensionMarkerStack.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        });
        if (i % 2) {
          pushDimensionMarker('r', x1, y1, x2, y2, val);
        }
      }
      i++;
    }
    svg.selectAll('.dim-marker').remove();
    svg.selectAll('.dim-marker').data(dimensionMarkerStack).enter().append('line').attr('class', 'dim-marker').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', 0.2).attr('stroke', 'grey');
    svg.selectAll('.dim-marker-leader').remove();
    svg.selectAll('.dim-marker-leader').data(dimensionMarkerLeaderStack).enter().append('line').attr('class', 'dim-marker-leader').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', 1).attr('stroke', 'black');
    svg.selectAll('.dim-marker-label').remove();
    return svg.selectAll('.dim-marker-label').data(dimensionMarkerLabelStack).enter().append('text').attr('class', 'dim-marker-label').attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', 'Arial').text(function(d) {
      return d.label;
    }).attr('text-anchor', function(d) {
      return d.anchor;
    });
  };

  RectPlot.prototype.drawAxisLabels = function(svg, viewBoxDim, xAxisPadding, yAxisPadding) {
    var axisLabels;
    axisLabels = [
      {
        x: viewBoxDim.x + viewBoxDim.width / 2,
        y: viewBoxDim.y + viewBoxDim.height + xAxisPadding,
        text: 'Dimension 1 (64%)',
        anchor: 'middle',
        transform: 'rotate(0)'
      }, {
        x: viewBoxDim.x - yAxisPadding,
        y: viewBoxDim.y + viewBoxDim.height / 2,
        text: 'Dimension 2 (24%)',
        anchor: 'middle',
        transform: 'rotate(270,' + (viewBoxDim.x - yAxisPadding) + ', ' + (viewBoxDim.y + viewBoxDim.height / 2) + ')'
      }
    ];
    svg.selectAll('.axis-label').remove();
    return svg.selectAll('.axis-label').data(axisLabels).enter().append('text').attr('class', 'axis-label').attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', 'Arial').attr('text-anchor', function(d) {
      return d.anchor;
    }).attr('transform', function(d) {
      return d.transform;
    }).text(function(d) {
      return d.text;
    }).style('font-weight', 'bold');
  };

  RectPlot.prototype.drawLegend = function(svg, data, drawLegend) {
    var i, legendGroupsLab;
    svg.selectAll('.legend-groups-pts').remove();
    svg.selectAll('.legend-groups-text').remove();
    data.setupLegendGroups(data.legendGroups, data.legendDim);
    svg.selectAll('.legend-groups-pts').data(data.legendGroups).enter().append('circle').attr('class', 'legend-groups-pts').attr('cx', function(d) {
      return d.cx;
    }).attr('cy', function(d) {
      return d.cy;
    }).attr('r', function(d) {
      return d.r;
    }).attr('fill', function(d) {
      return d.color;
    }).attr('stroke', function(d) {
      return d.stroke;
    }).attr('stroke-opacity', function(d) {
      return d['stroke-opacity'];
    });
    svg.selectAll('.legend-groups-text').data(data.legendGroups).enter().append('text').attr('class', 'legend-groups-text').attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', 'Arial').text(function(d) {
      return d.text;
    }).attr('text-anchor', function(d) {
      return d.anchor;
    });
    legendGroupsLab = svg.selectAll('.legend-groups-text');
    i = 0;
    while (i < data.legendGroups.length) {
      data.legendGroups[i].width = legendGroupsLab[0][i].getBBox().width;
      data.legendGroups[i].height = legendGroupsLab[0][i].getBBox().height;
      i++;
    }
    if (data.resizedAfterLegendGroupsDrawn()) {
      console.log('Legend resize triggered');
      drawLegend(svg, data, drawLegend);
      return data.calcDataArrays();
    }
  };

  RectPlot.prototype.drawAnc = function(svg, data) {
    svg.selectAll('.anc').remove();
    return svg.selectAll('.anc').data(data.pts).enter().append('circle').attr('class', 'anc').attr('cx', function(d) {
      return d.x;
    }).attr('cy', function(d) {
      return d.y;
    }).attr('r', function(d) {
      return d.r;
    }).attr('fill', function(d) {
      return d.color;
    }).append('title').text(function(d) {
      return "" + d.label + "\n" + d.group + "\n[" + d.labelX + ", " + d.labelY + "]";
    });
  };

  RectPlot.prototype.drawLabs = function(svg, data, drawAnc, viewBoxDim, drawLinks, drawLabs, xAxisPadding, yAxisPadding, drawAxisLabels, drawDimensionMarkers) {
    var drag, i, labelDragAndDrop, labeler, labels_svg;
    labelDragAndDrop = function(svg, drawLinks, data, drawLabs, drawAnc, viewBoxDim, drawDimensionMarkers) {
      var dragEnd, dragMove, dragStart;
      dragStart = function() {
        return svg.selectAll('.link').remove();
      };
      dragMove = function() {
        var id, label;
        d3.select(this).attr('x', d3.select(this).x = d3.event.x).attr('y', d3.select(this).y = d3.event.y);
        id = d3.select(this).attr('id');
        label = _.find(data.lab, function(l) {
          return l.id === Number(id);
        });
        label.x = d3.event.x;
        return label.y = d3.event.y;
      };
      dragEnd = function() {
        var id, lab;
        id = Number(d3.select(this).attr('id'));
        lab = _.find(data.lab, function(l) {
          return l.id === id;
        });
        if (data.isOutsideViewBox(lab)) {
          data.moveElemToLegend(id);
          drawAxisLabels(svg, viewBoxDim, xAxisPadding, yAxisPadding);
          drawDimensionMarkers(svg, viewBoxDim, data);
          drawAnc(svg, data);
          return drawLabs(svg, data, drawAnc, viewBoxDim, drawLinks, drawLabs, xAxisPadding, yAxisPadding, drawAxisLabels, drawDimensionMarkers);
        } else {
          return drawLinks(svg, data);
        }
      };
      return d3.behavior.drag().origin(function() {
        return {
          x: d3.select(this).attr("x"),
          y: d3.select(this).attr("y")
        };
      }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
    };
    drag = labelDragAndDrop(svg, drawLinks, data, drawLabs, drawAnc, viewBoxDim, drawDimensionMarkers);
    svg.selectAll('.lab').remove();
    svg.selectAll('.lab').data(data.lab).enter().append('text').attr('class', 'lab').attr('id', function(d) {
      return d.id;
    }).attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('font-family', 'Arial').text(function(d) {
      return d.text;
    }).attr('text-anchor', 'middle').attr('fill', function(d) {
      return d.color;
    }).call(drag);
    labels_svg = svg.selectAll('.lab');
    i = 0;
    while (i < data.len) {
      data.lab[i].width = labels_svg[0][i].getBBox().width;
      data.lab[i].height = labels_svg[0][i].getBBox().height;
      i++;
    }
    labeler = d3.labeler().svg(svg).w1(viewBoxDim.x).w2(viewBoxDim.x + viewBoxDim.width).h1(viewBoxDim.y).h2(viewBoxDim.y + viewBoxDim.height).anchor(data.anc).label(data.lab).start(500);
    labels_svg.transition().duration(800).attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    });
    return drawLinks(svg, data);
  };

  RectPlot.prototype.drawLinks = function(svg, data) {
    var i, links, newLinkPt, newPtOnLabelBorder;
    newPtOnLabelBorder = function(label, anchor, anchor_array) {
      var a, above, aboveMid, abovePadded, ambiguityFactor, ancNearby, below, belowMid, belowPadded, centered, labelBorder, left, leftPadded, padB, padL, padR, padT, paddedCenter, padding, right, rightPadded, _i, _len;
      labelBorder = {
        botL: [label.x - label.width / 2, label.y],
        botC: [label.x, label.y],
        botR: [label.x + label.width / 2, label.y],
        topL: [label.x - label.width / 2, label.y - label.height + 8],
        topC: [label.x, label.y - label.height + 8],
        topR: [label.x + label.width / 2, label.y - label.height + 8],
        midL: [label.x - label.width / 2, label.y - label.height / 2],
        midR: [label.x + label.width / 2, label.y - label.height / 2]
      };
      padding = 10;
      centered = (anchor.x > label.x - label.width / 2) && (anchor.x < label.x + label.width / 2);
      paddedCenter = (anchor.x > label.x - label.width / 2 - padding) && (anchor.x < label.x + label.width / 2 + padding);
      abovePadded = anchor.y < label.y - label.height - padding;
      above = anchor.y < label.y - label.height;
      aboveMid = anchor.y < label.y - label.height / 2;
      belowPadded = anchor.y > label.y + padding;
      below = anchor.y > label.y;
      belowMid = anchor.y >= label.y - label.height / 2;
      left = anchor.x < label.x - label.width / 2;
      right = anchor.x > label.x + label.width / 2;
      leftPadded = anchor.x < label.x - label.width / 2 - padding;
      rightPadded = anchor.x > label.x + label.width / 2 + padding;
      if (centered && abovePadded) {
        return labelBorder.topC;
      } else if (centered && belowPadded) {
        return labelBorder.botC;
      } else if (above && left) {
        return labelBorder.topL;
      } else if (above && right) {
        return labelBorder.topR;
      } else if (below && left) {
        return labelBorder.botL;
      } else if (below && right) {
        return labelBorder.botR;
      } else if (leftPadded) {
        return labelBorder.midL;
      } else if (rightPadded) {
        return labelBorder.midR;
      } else {
        ambiguityFactor = 10;
        padL = labelBorder.topL[0] - ambiguityFactor;
        padR = labelBorder.topR[0] + ambiguityFactor;
        padT = labelBorder.topL[1] - ambiguityFactor;
        padB = labelBorder.botR[1] + ambiguityFactor;
        ancNearby = 0;
        for (_i = 0, _len = anchor_array.length; _i < _len; _i++) {
          a = anchor_array[_i];
          if ((a.x > padL && a.x < padR) && (a.y > padT && a.y < padB)) {
            ancNearby++;
          }
        }
        if (ancNearby > 1) {
          if (!left && !right && !above && !below) {
            return labelBorder.botC;
          } else if (centered && above) {
            return labelBorder.topC;
          } else if (centered && below) {
            return labelBorder.botC;
          } else if (left && above) {
            return labelBorder.topL;
          } else if (left && below) {
            return labelBorder.botL;
          } else if (right && above) {
            return labelBorder.topR;
          } else if (right && below) {
            return labelBorder.botR;
          } else if (left) {
            return labelBorder.midL;
          } else if (right) {
            return labelBorder.midR;
          }
        }
      }
    };
    links = [];
    i = 0;
    while (i < data.len) {
      newLinkPt = newPtOnLabelBorder(data.lab[i], data.anc[i], data.pts);
      if (newLinkPt != null) {
        links.push({
          x1: data.anc[i].x,
          y1: data.anc[i].y,
          x2: newLinkPt[0],
          y2: newLinkPt[1],
          width: 1
        });
      }
      i++;
    }
    return svg.selectAll('.link').data(links).enter().append('line').attr('class', 'link').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', function(d) {
      return d.width;
    }).attr('stroke', 'gray');
  };

  return RectPlot;

})();
