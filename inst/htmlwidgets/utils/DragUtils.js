(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DragUtils = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global d3 */
/* global _ */

// import _ from 'lodash';

var DragUtils = function () {
  function DragUtils() {
    _classCallCheck(this, DragUtils);
  }

  // address "extreme" coupling to plot
  DragUtils.getLabelDragAndDrop = function getLabelDragAndDrop(plot) {
    var showTrendLine = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var dragStart = function dragStart() {
      return plot.svg.selectAll('.link').remove();
    };

    var dragMove = function dragMove() {
      d3.select(this).attr('x', d3.event.x).attr('y', d3.event.y);

      // Save the new location of text so links can be redrawn
      var id = d3.select(this).attr('id');
      var label = _.find(plot.data.lab, function (l) {
        return l.id === Number(id);
      });
      if ($(this).prop('tagName') === 'image') {
        label.x = d3.event.x + label.width / 2;
        label.y = d3.event.y + label.height;
      } else {
        label.x = d3.event.x;
        label.y = d3.event.y;
      }
    };

    var dragEnd = function dragEnd() {
      // If label is dragged out of viewBox, remove the lab and add to legend
      var id = Number(d3.select(this).attr('id'));
      var lab = _.find(plot.data.lab, function (l) {
        return l.id === id;
      });
      var anc = _.find(plot.data.pts, function (a) {
        return a.id === id;
      });

      if (plot.data.isOutsideViewBox(lab) && !showTrendLine) {
        // Element dragged off plot
        plot.data.addElemToLegend(id);
        plot.state.pushLegendPt(id);
        plot.resetPlotAfterDragEvent();
        //  TODO KZ what does this statement mean ?
      } else if (lab.x - lab.width / 2 < anc.x && anc.x < lab.x + lab.width / 2 && lab.y > anc.y && anc.y > lab.y - lab.height) {
        plot.svg.select('#anc-' + id).attr('fill-opacity', 0);
      } else {
        plot.state.pushUserPositionedLabel(id, lab.x, lab.y, plot.viewBoxDim);
        plot.svg.select('#anc-' + id).attr('fill-opacity', function (d) {
          return d.fillOpacity;
        });
        if (!showTrendLine) {
          plot.drawLinks();
        }
      }
    };

    return d3.behavior.drag().origin(function () {
      return {
        x: d3.select(this).attr('x'),
        y: d3.select(this).attr('y')
      };
    }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
  };

  DragUtils.getLegendLabelDragAndDrop = function getLegendLabelDragAndDrop(plot, data) {
    var dragStart = _.noop;

    var dragMove = function dragMove() {
      d3.select(this).attr('x', d3.select(this).x = d3.event.x).attr('y', d3.select(this).y = d3.event.y);

      // Save the new location of text so links can be redrawn
      var id = d3.select(this).attr('id').split('legend-')[1];
      var legendPt = _.find(data.legendPts, function (l) {
        return l.id === Number(id);
      });
      legendPt.lab.x = d3.event.x;
      legendPt.lab.y = d3.event.y;
    };

    var dragEnd = function dragEnd() {
      var id = Number(d3.select(this).attr('id').split('legend-')[1]);
      var legendPt = _.find(data.legendPts, function (l) {
        return l.id === Number(id);
      });
      if (plot.data.isLegendPtOutsideViewBox(legendPt.lab)) {
        d3.select(this).attr('x', d3.select(this).x = legendPt.x).attr('y', d3.select(this).y = legendPt.y);
      } else {
        // Element dragged onto plot
        plot.data.removeElemFromLegend(id);
        plot.state.pullLegendPt(id);
        plot.resetPlotAfterDragEvent();
      }
    };

    return d3.behavior.drag().origin(function () {
      return {
        x: d3.select(this).attr('x'),
        y: d3.select(this).attr('y')
      };
    }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
  };

  return DragUtils;
}();

module.exports = DragUtils;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy91dGlscy9EcmFnVXRpbHMuZXM2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBO0FBQ0E7O0FBRUE7O0lBRU0sUzs7Ozs7QUFFSjtZQUNPLG1CLGdDQUFvQixJLEVBQTZCO0FBQUEsUUFBdkIsYUFBdUIsdUVBQVAsS0FBTzs7QUFDdEQsUUFBTSxZQUFZLFNBQVosU0FBWTtBQUFBLGFBQU0sS0FBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixPQUFuQixFQUE0QixNQUE1QixFQUFOO0FBQUEsS0FBbEI7O0FBRUEsUUFBTSxXQUFXLFNBQVgsUUFBVyxHQUFZO0FBQzNCLFNBQUcsTUFBSCxDQUFVLElBQVYsRUFDRyxJQURILENBQ1EsR0FEUixFQUNhLEdBQUcsS0FBSCxDQUFTLENBRHRCLEVBRUcsSUFGSCxDQUVRLEdBRlIsRUFFYSxHQUFHLEtBQUgsQ0FBUyxDQUZ0Qjs7QUFJQTtBQUNBLFVBQU0sS0FBSyxHQUFHLE1BQUgsQ0FBVSxJQUFWLEVBQWdCLElBQWhCLENBQXFCLElBQXJCLENBQVg7QUFDQSxVQUFNLFFBQVEsRUFBRSxJQUFGLENBQU8sS0FBSyxJQUFMLENBQVUsR0FBakIsRUFBc0I7QUFBQSxlQUFLLEVBQUUsRUFBRixLQUFTLE9BQU8sRUFBUCxDQUFkO0FBQUEsT0FBdEIsQ0FBZDtBQUNBLFVBQUksRUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLFNBQWIsTUFBNEIsT0FBaEMsRUFBeUM7QUFDdkMsY0FBTSxDQUFOLEdBQVUsR0FBRyxLQUFILENBQVMsQ0FBVCxHQUFjLE1BQU0sS0FBTixHQUFjLENBQXRDO0FBQ0EsY0FBTSxDQUFOLEdBQVUsR0FBRyxLQUFILENBQVMsQ0FBVCxHQUFhLE1BQU0sTUFBN0I7QUFDRCxPQUhELE1BR087QUFDTCxjQUFNLENBQU4sR0FBVSxHQUFHLEtBQUgsQ0FBUyxDQUFuQjtBQUNBLGNBQU0sQ0FB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R0FBckIsQ0FERTtBQUVMLFdBQUcsR0FBRyxNQUFILENBQVUsSUFBVixFQUFnQixJQUFoQixDQUFxQixHQUFyQjtBQUZFLE9BQVA7QUFJRCxLQU5JLEVBT0osRUFQSSxDQU9ELFdBUEMsRUFPWSxTQVBaLEVBUUosRUFSSSxDQVFELE1BUkMsRUFRTyxRQVJQLEVBU0osRUFUSSxDQVNELFNBVEMsRUFTVSxPQVRWLENBQVA7QUFVRCxHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixTQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgZDMgKi9cbi8qIGdsb2JhbCBfICovXG5cbi8vIGltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmNsYXNzIERyYWdVdGlscyB7XG5cbiAgLy8gYWRkcmVzcyBcImV4dHJlbWVcIiBjb3VwbGluZyB0byBwbG90XG4gIHN0YXRpYyBnZXRMYWJlbERyYWdBbmREcm9wKHBsb3QsIHNob3dUcmVuZExpbmUgPSBmYWxzZSkge1xuICAgIGNvbnN0IGRyYWdTdGFydCA9ICgpID0+IHBsb3Quc3ZnLnNlbGVjdEFsbCgnLmxpbmsnKS5yZW1vdmUoKTtcblxuICAgIGNvbnN0IGRyYWdNb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgIC5hdHRyKCd4JywgZDMuZXZlbnQueClcbiAgICAgICAgLmF0dHIoJ3knLCBkMy5ldmVudC55KTtcblxuICAgICAgLy8gU2F2ZSB0aGUgbmV3IGxvY2F0aW9uIG9mIHRleHQgc28gbGlua3MgY2FuIGJlIHJlZHJhd25cbiAgICAgIGNvbnN0IGlkID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgICBjb25zdCBsYWJlbCA9IF8uZmluZChwbG90LmRhdGEubGFiLCBsID0+IGwuaWQgPT09IE51bWJlcihpZCkpO1xuICAgICAgaWYgKCQodGhpcykucHJvcCgndGFnTmFtZScpID09PSAnaW1hZ2UnKSB7XG4gICAgICAgIGxhYmVsLnggPSBkMy5ldmVudC54ICsgKGxhYmVsLndpZHRoIC8gMik7XG4gICAgICAgIGxhYmVsLnkgPSBkMy5ldmVudC55ICsgbGFiZWwuaGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFiZWwueCA9IGQzLmV2ZW50Lng7XG4gICAgICAgIGxhYmVsLnkgPSBkMy5ldmVudC55O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBkcmFnRW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gSWYgbGFiZWwgaXMgZHJhZ2dlZCBvdXQgb2Ygdmlld0JveCwgcmVtb3ZlIHRoZSBsYWIgYW5kIGFkZCB0byBsZWdlbmRcbiAgICAgIGNvbnN0IGlkID0gTnVtYmVyKGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdpZCcpKTtcbiAgICAgIGNvbnN0IGxhYiA9IF8uZmluZChwbG90LmRhdGEubGFiLCBsID0+IGwuaWQgPT09IGlkKTtcbiAgICAgIGNvbnN0IGFuYyA9IF8uZmluZChwbG90LmRhdGEucHRzLCBhID0+IGEuaWQgPT09IGlkKTtcblxuICAgICAgaWYgKHBsb3QuZGF0YS5pc091dHNpZGVWaWV3Qm94KGxhYikgJiYgIXNob3dUcmVuZExpbmUpIHtcbiAgICAgICAgLy8gRWxlbWVudCBkcmFnZ2VkIG9mZiBwbG90XG4gICAgICAgIHBsb3QuZGF0YS5hZGRFbGVtVG9MZWdlbmQoaWQpO1xuICAgICAgICBwbG90LnN0YXRlLnB1c2hMZWdlbmRQdChpZCk7XG4gICAgICAgIHBsb3QucmVzZXRQbG90QWZ0ZXJEcmFnRXZlbnQoKTtcbiAgICAgIC8vICBUT0RPIEtaIHdoYXQgZG9lcyB0aGlzIHN0YXRlbWVudCBtZWFuID9cbiAgICAgIH0gZWxzZSBpZiAoKGxhYi54IC0gKGxhYi53aWR0aCAvIDIpIDwgYW5jLnggJiYgYW5jLnggPCBsYWIueCArIChsYWIud2lkdGggLyAyKSkgJiYgKGxhYi55ID4gYW5jLnkgJiYgYW5jLnkgPiBsYWIueSAtIGxhYi5oZWlnaHQpKSB7XG4gICAgICAgIHBsb3Quc3ZnLnNlbGVjdChgI2FuYy0ke2lkfWApLmF0dHIoJ2ZpbGwtb3BhY2l0eScsIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGxvdC5zdGF0ZS5wdXNoVXNlclBvc2l0aW9uZWRMYWJlbChpZCwgbGFiLngsIGxhYi55LCBwbG90LnZpZXdCb3hEaW0pO1xuICAgICAgICBwbG90LnN2Zy5zZWxlY3QoYCNhbmMtJHtpZH1gKS5hdHRyKCdmaWxsLW9wYWNpdHknLCBkID0+IGQuZmlsbE9wYWNpdHkpO1xuICAgICAgICBpZiAoIXNob3dUcmVuZExpbmUpIHtcbiAgICAgICAgICBwbG90LmRyYXdMaW5rcygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgIC5vcmlnaW4oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd4JyksXG4gICAgICAgICAgeTogZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3knKSxcbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgICAub24oJ2RyYWdzdGFydCcsIGRyYWdTdGFydClcbiAgICAgIC5vbignZHJhZycsIGRyYWdNb3ZlKVxuICAgICAgLm9uKCdkcmFnZW5kJywgZHJhZ0VuZCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0TGVnZW5kTGFiZWxEcmFnQW5kRHJvcChwbG90LCBkYXRhKSB7XG4gICAgY29uc3QgZHJhZ1N0YXJ0ID0gXy5ub29wO1xuXG4gICAgY29uc3QgZHJhZ01vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgLmF0dHIoJ3gnLCAoZDMuc2VsZWN0KHRoaXMpLnggPSBkMy5ldmVudC54KSlcbiAgICAgICAgLmF0dHIoJ3knLCAoZDMuc2VsZWN0KHRoaXMpLnkgPSBkMy5ldmVudC55KSk7XG5cbiAgICAgIC8vIFNhdmUgdGhlIG5ldyBsb2NhdGlvbiBvZiB0ZXh0IHNvIGxpbmtzIGNhbiBiZSByZWRyYXduXG4gICAgICBjb25zdCBpZCA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdpZCcpLnNwbGl0KCdsZWdlbmQtJylbMV07XG4gICAgICBjb25zdCBsZWdlbmRQdCA9IF8uZmluZChkYXRhLmxlZ2VuZFB0cywgbCA9PiBsLmlkID09PSBOdW1iZXIoaWQpKTtcbiAgICAgIGxlZ2VuZFB0LmxhYi54ID0gZDMuZXZlbnQueDtcbiAgICAgIGxlZ2VuZFB0LmxhYi55ID0gZDMuZXZlbnQueTtcbiAgICB9O1xuXG4gICAgY29uc3QgZHJhZ0VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGlkID0gTnVtYmVyKGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdpZCcpLnNwbGl0KCdsZWdlbmQtJylbMV0pO1xuICAgICAgY29uc3QgbGVnZW5kUHQgPSBfLmZpbmQoZGF0YS5sZWdlbmRQdHMsIGwgPT4gbC5pZCA9PT0gTnVtYmVyKGlkKSk7XG4gICAgICBpZiAocGxvdC5kYXRhLmlzTGVnZW5kUHRPdXRzaWRlVmlld0JveChsZWdlbmRQdC5sYWIpKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgIC5hdHRyKCd4JywgKGQzLnNlbGVjdCh0aGlzKS54ID0gbGVnZW5kUHQueCkpXG4gICAgICAgICAgLmF0dHIoJ3knLCAoZDMuc2VsZWN0KHRoaXMpLnkgPSBsZWdlbmRQdC55KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFbGVtZW50IGRyYWdnZWQgb250byBwbG90XG4gICAgICAgIHBsb3QuZGF0YS5yZW1vdmVFbGVtRnJvbUxlZ2VuZChpZCk7XG4gICAgICAgIHBsb3Quc3RhdGUucHVsbExlZ2VuZFB0KGlkKTtcbiAgICAgICAgcGxvdC5yZXNldFBsb3RBZnRlckRyYWdFdmVudCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAub3JpZ2luKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiBkMy5zZWxlY3QodGhpcykuYXR0cigneCcpLFxuICAgICAgICAgIHk6IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd5JyksXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICAgLm9uKCdkcmFnc3RhcnQnLCBkcmFnU3RhcnQpXG4gICAgICAub24oJ2RyYWcnLCBkcmFnTW92ZSlcbiAgICAgIC5vbignZHJhZ2VuZCcsIGRyYWdFbmQpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ1V0aWxzO1xuIl19

//# sourceMappingURL=../utils/DragUtils.es6.js.map