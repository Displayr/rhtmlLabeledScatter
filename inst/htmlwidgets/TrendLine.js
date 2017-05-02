(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TrendLine = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TrendLine = function () {
  function TrendLine(pts, labs) {
    var _this = this;

    _classCallCheck(this, TrendLine);

    this._createLineArrays = this._createLineArrays.bind(this);
    this.getLineArray = this.getLineArray.bind(this);
    this.getUniqueGroups = this.getUniqueGroups.bind(this);
    this.pts = pts;
    this.labs = labs;
    this.linePts = {};
    this.arrowheadLabels = {};
    this.groupToLabel = {};

    _.map(this.pts, function (pt, i) {
      if (_this.linePts[pt.group] == null) {
        _this.linePts[pt.group] = [];
      }

      if (_this.groupToLabel[pt.group] == null || _this.arrowheadLabels[pt.group] == null) {
        _this.groupToLabel[pt.group] = _this.labs[i];
        _this.arrowheadLabels[pt.group] = _this.labs[i];
      }

      return _this.linePts[pt.group].push({
        x: pt.x,
        y: pt.y,
        z: pt.r,
        r: pt.r
      });
    });

    this.groups = _.keys(this.linePts);

    this._createLineArrays();
  }

  TrendLine.prototype._createLineArrays = function _createLineArrays() {
    var _this2 = this;

    this.linesMapped = {};
    this.lines = {};
    this.arrowheadPts = [];

    _.map(this.linePts, function (groupPts, groupName) {
      var i = void 0;
      _this2.lines[groupName] = [];
      _this2.linesMapped[groupName] = [];

      switch (groupPts.length) {
        case 0:
          return;
        case 1:
          _this2.arrowheadPts.push(groupPts[0]);
          return;
        case 2:
          _this2.lines[groupName] = [[groupPts[0].x, groupPts[0].y, groupPts[1].x, groupPts[1].y]];
          _this2.arrowheadPts.push(groupPts[1]);

          _this2.arrowheadLabels[groupName].r = groupPts[1].r;
          _this2.arrowheadLabels[groupName].x = groupPts[1].x - _this2.arrowheadLabels[groupName].width / 2;
          _this2.arrowheadLabels[groupName].y = groupPts[1].y - _this2.arrowheadLabels[groupName].height / 2;
          return;
        default:
          // Adds another point for every "middle" point
          for (i = 0; i < groupPts.length; i++) {
            var pt = groupPts[i];
            _this2.linesMapped[groupName].push(pt);

            if (i !== 0 && i !== groupPts.length - 1) {
              _this2.linesMapped[groupName].push(pt);
            }
          }

          // Constructs the line array
          i = 0;
          while (i < _this2.linesMapped[groupName].length) {
            _this2.lines[groupName].push([_this2.linesMapped[groupName][i].x, _this2.linesMapped[groupName][i].y, _this2.linesMapped[groupName][i + 1].x, _this2.linesMapped[groupName][i + 1].y]);
            i += 2;
          }

          var lastLinePt = _.last(_this2.linesMapped[groupName]);
          _this2.arrowheadPts.push(lastLinePt);

          _this2.arrowheadLabels[groupName].r = lastLinePt.r;
          _this2.arrowheadLabels[groupName].x = lastLinePt.x - _this2.arrowheadLabels[groupName].width / 2;
          _this2.arrowheadLabels[groupName].y = lastLinePt.y - _this2.arrowheadLabels[groupName].height / 2;
      }
    });
    this.arrowheadLabels = _.values(this.arrowheadLabels);
    return this.lines;
  };

  TrendLine.prototype.getLineArray = function getLineArray(group) {
    if (this.lines == null) {
      this._createLineArrays();
    }

    return this.lines[group];
  };

  TrendLine.prototype.getUniqueGroups = function getUniqueGroups() {
    return this.groups;
  };

  return TrendLine;
}();

module.exports = TrendLine;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9UcmVuZExpbmUuZXM2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztJQ0FNLFM7QUFDSixxQkFBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCO0FBQUE7O0FBQUE7O0FBQ3JCLFNBQUssaUJBQUwsR0FBeUIsS0FBSyxpQkFBTCxDQUF1QixJQUF2QixDQUE0QixJQUE1QixDQUF6QjtBQUNBLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBcEI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsS0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCLENBQXZCO0FBQ0EsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLE9BQUwsR0FBZSxFQUFmO0FBQ0EsU0FBSyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEVBQXBCOztBQUVBLE1BQUUsR0FBRixDQUFNLEtBQUssR0FBWCxFQUFnQixVQUFDLEVBQUQsRUFBSyxDQUFMLEVBQVc7QUFDekIsVUFBSSxNQUFLLE9BQUwsQ0FBYSxHQUFHLEtBQWhCLEtBQTBCLElBQTlCLEVBQW9DO0FBQ2xDLGNBQUssT0FBTCxDQUFhLEdBQUcsS0FBaEIsSUFBeUIsRUFBekI7QUFDRDs7QUFFRCxVQUFLLE1BQUssWUFBTCxDQUFrQixHQUFHLEtBQXJCLEtBQStCLElBQWhDLElBQTBDLE1BQUssZUFBTCxDQUFxQixHQUFHLEtBQXhCLEtBQWtDLElBQWhGLEVBQXVGO0FBQ3JGLGNBQUssWUFBTCxDQUFrQixHQUFHLEtBQXJCLElBQThCLE1BQUssSUFBTCxDQUFVLENBQVYsQ0FBOUI7QUFDQSxjQUFLLGVBQUwsQ0FBcUIsR0FBRyxLQUF4QixJQUFpQyxNQUFLLElBQUwsQ0FBVSxDQUFWLENBQWpDO0FBQ0Q7O0FBRUQsYUFBTyxNQUFLLE9BQUwsQ0FBYSxHQUFHLEtBQWhCLEVBQXVCLElBQXZCLENBQTRCO0FBQ2pDLFdBQUcsR0FBRyxDQUQyQjtBQUVqQyxXQUFHLEdBQUcsQ0FGMkI7QUFHakMsV0FBRyxHQUFHLENBSDJCO0FBSWpDLFdBQUcsR0FBRztBQUoyQixPQUE1QixDQUFQO0FBTUQsS0FoQkQ7O0FBa0JBLFNBQUssTUFBTCxHQUFjLEVBQUUsSUFBRixDQUFPLEtBQUssT0FBWixDQUFkOztBQUVBLFNBQUssaUJBQUw7QUFDRDs7c0JBR0QsaUIsZ0NBQW9CO0FBQUE7O0FBQ2xCLFNBQUssV0FBTCxHQUFtQixFQUFuQjtBQUNBLFNBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxTQUFLLFlBQUwsR0FBb0IsRUFBcEI7O0FBRUEsTUFBRSxHQUFGLENBQU0sS0FBSyxPQUFYLEVBQW9CLFVBQUMsUUFBRCxFQUFXLFNBQVgsRUFBeUI7QUFDM0MsVUFBSSxVQUFKO0FBQ0EsYUFBSyxLQUFMLENBQVcsU0FBWCxJQUF3QixFQUF4QjtBQUNBLGFBQUssV0FBTCxDQUFpQixTQUFqQixJQUE4QixFQUE5Qjs7QUFFQSxjQUFRLFNBQVMsTUFBakI7QUFDRSxhQUFLLENBQUw7QUFDRTtBQUNGLGFBQUssQ0FBTDtBQUNFLGlCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsU0FBUyxDQUFULENBQXZCO0FBQ0E7QUFDRixhQUFLLENBQUw7QUFDRSxpQkFBSyxLQUFMLENBQVcsU0FBWCxJQUF3QixDQUFDLENBQUMsU0FBUyxDQUFULEVBQVksQ0FBYixFQUFnQixTQUFTLENBQVQsRUFBWSxDQUE1QixFQUErQixTQUFTLENBQVQsRUFBWSxDQUEzQyxFQUE4QyxTQUFTLENBQVQsRUFBWSxDQUExRCxDQUFELENBQXhCO0FBQ0EsaUJBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixTQUFTLENBQVQsQ0FBdkI7O0FBRUEsaUJBQUssZUFBTCxDQUFxQixTQUFyQixFQUFnQyxDQUFoQyxHQUFvQyxTQUFTLENBQVQsRUFBWSxDQUFoRDtBQUNBLGlCQUFLLGVBQUwsQ0FBcUIsU0FBckIsRUFBZ0MsQ0FBaEMsR0FBb0MsU0FBUyxDQUFULEVBQVksQ0FBWixHQUFpQixPQUFLLGVBQUwsQ0FBcUIsU0FBckIsRUFBZ0MsS0FBaEMsR0FBd0MsQ0FBN0Y7QUFDQSxpQkFBSyxlQUFMLENBQXFCLFNBQXJCLEVBQWdDLENBQWhDLEdBQW9DLFNBQVMsQ0FBVCxFQUFZLENBQVosR0FBaUIsT0FBSyxlQUFMLENBQXFCLFNBQXJCLEVBQWdDLE1BQWhDLEdBQXlDLENBQTlGO0FBQ0E7QUFDRjtBQUNFO0FBQ0EsZUFBSyxJQUFJLENBQVQsRUFBWSxJQUFJLFNBQVMsTUFBekIsRUFBaUMsR0FBakMsRUFBc0M7QUFDcEMsZ0JBQU0sS0FBSyxTQUFTLENBQVQsQ0FBWDtBQUNBLG1CQUFLLFdBQUwsQ0FBaUIsU0FBakIsRUFBNEIsSUFBNUIsQ0FBaUMsRUFBakM7O0FBRUEsZ0JBQUssTUFBTSxDQUFQLElBQWMsTUFBTyxTQUFTLE1BQVQsR0FBa0IsQ0FBM0MsRUFBZ0Q7QUFDOUMscUJBQUssV0FBTCxDQUFpQixTQUFqQixFQUE0QixJQUE1QixDQUFpQyxFQUFqQztBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxjQUFJLENBQUo7QUFDQSxpQkFBTyxJQUFJLE9BQUssV0FBTCxDQUFpQixTQUFqQixFQUE0QixNQUF2QyxFQUErQztBQUM3QyxtQkFBSyxLQUFMLENBQVcsU0FBWCxFQUFzQixJQUF0QixDQUEyQixDQUFDLE9BQUssV0FBTCxDQUFpQixTQUFqQixFQUE0QixDQUE1QixFQUErQixDQUFoQyxFQUFtQyxPQUFLLFdBQUwsQ0FBaUIsU0FBakIsRUFBNEIsQ0FBNUIsRUFBK0IsQ0FBbEUsRUFBcUUsT0FBSyxXQUFMLENBQWlCLFNBQWpCLEVBQTRCLElBQUksQ0FBaEMsRUFBbUMsQ0FBeEcsRUFBMkcsT0FBSyxXQUFMLENBQWlCLFNBQWpCLEVBQTRCLElBQUksQ0FBaEMsRUFBbUMsQ0FBOUksQ0FBM0I7QUFDQSxpQkFBSyxDQUFMO0FBQ0Q7O0FBRUQsY0FBTSxhQUFhLEVBQUUsSUFBRixDQUFPLE9BQUssV0FBTCxDQUFpQixTQUFqQixDQUFQLENBQW5CO0FBQ0EsaUJBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixVQUF2Qjs7QUFFQSxpQkFBSyxlQUFMLENBQXFCLFNBQXJCLEVBQWdDLENBQWhDLEdBQW9DLFdBQVcsQ0FBL0M7QUFDQSxpQkFBSyxlQUFMLENBQXFCLFNBQXJCLEVBQWdDLENBQWhDLEdBQW9DLFdBQVcsQ0FBWCxHQUFnQixPQUFLLGVBQUwsQ0FBcUIsU0FBckIsRUFBZ0MsS0FBaEMsR0FBd0MsQ0FBNUY7QUFDQSxpQkFBSyxlQUFMLENBQXFCLFNBQXJCLEVBQWdDLENBQWhDLEdBQW9DLFdBQVcsQ0FBWCxHQUFnQixPQUFLLGVBQUwsQ0FBcUIsU0FBckIsRUFBZ0MsTUFBaEMsR0FBeUMsQ0FBN0Y7QUFyQ0o7QUF1Q0QsS0E1Q0Q7QUE2Q0EsU0FBSyxlQUFMLEdBQXVCLEVBQUUsTUFBRixDQUFTLEtBQUssZUFBZCxDQUF2QjtBQUNBLFdBQU8sS0FBSyxLQUFaO0FBQ0QsRzs7c0JBRUQsWSx5QkFBYSxLLEVBQU87QUFDbEIsUUFBSSxLQUFLLEtBQUwsSUFBYyxJQUFsQixFQUF3QjtBQUN0QixXQUFLLGlCQUFMO0FBQ0Q7O0FBRUQsV0FBTyxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQVA7QUFDRCxHOztzQkFFRCxlLDhCQUFrQjtBQUNoQixXQUFPLEtBQUssTUFBWjtBQUNELEc7Ozs7O0FBR0gsT0FBTyxPQUFQLEdBQWlCLFNBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIFRyZW5kTGluZSB7XG4gIGNvbnN0cnVjdG9yKHB0cywgbGFicykge1xuICAgIHRoaXMuX2NyZWF0ZUxpbmVBcnJheXMgPSB0aGlzLl9jcmVhdGVMaW5lQXJyYXlzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5nZXRMaW5lQXJyYXkgPSB0aGlzLmdldExpbmVBcnJheS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZ2V0VW5pcXVlR3JvdXBzID0gdGhpcy5nZXRVbmlxdWVHcm91cHMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnB0cyA9IHB0cztcbiAgICB0aGlzLmxhYnMgPSBsYWJzO1xuICAgIHRoaXMubGluZVB0cyA9IHt9O1xuICAgIHRoaXMuYXJyb3doZWFkTGFiZWxzID0ge307XG4gICAgdGhpcy5ncm91cFRvTGFiZWwgPSB7fTtcblxuICAgIF8ubWFwKHRoaXMucHRzLCAocHQsIGkpID0+IHtcbiAgICAgIGlmICh0aGlzLmxpbmVQdHNbcHQuZ3JvdXBdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5saW5lUHRzW3B0Lmdyb3VwXSA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoKHRoaXMuZ3JvdXBUb0xhYmVsW3B0Lmdyb3VwXSA9PSBudWxsKSB8fCAodGhpcy5hcnJvd2hlYWRMYWJlbHNbcHQuZ3JvdXBdID09IG51bGwpKSB7XG4gICAgICAgIHRoaXMuZ3JvdXBUb0xhYmVsW3B0Lmdyb3VwXSA9IHRoaXMubGFic1tpXTtcbiAgICAgICAgdGhpcy5hcnJvd2hlYWRMYWJlbHNbcHQuZ3JvdXBdID0gdGhpcy5sYWJzW2ldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5saW5lUHRzW3B0Lmdyb3VwXS5wdXNoKHtcbiAgICAgICAgeDogcHQueCxcbiAgICAgICAgeTogcHQueSxcbiAgICAgICAgejogcHQucixcbiAgICAgICAgcjogcHQucixcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5ncm91cHMgPSBfLmtleXModGhpcy5saW5lUHRzKTtcblxuICAgIHRoaXMuX2NyZWF0ZUxpbmVBcnJheXMoKTtcbiAgfVxuXG5cbiAgX2NyZWF0ZUxpbmVBcnJheXMoKSB7XG4gICAgdGhpcy5saW5lc01hcHBlZCA9IHt9O1xuICAgIHRoaXMubGluZXMgPSB7fTtcbiAgICB0aGlzLmFycm93aGVhZFB0cyA9IFtdO1xuXG4gICAgXy5tYXAodGhpcy5saW5lUHRzLCAoZ3JvdXBQdHMsIGdyb3VwTmFtZSkgPT4ge1xuICAgICAgbGV0IGk7XG4gICAgICB0aGlzLmxpbmVzW2dyb3VwTmFtZV0gPSBbXTtcbiAgICAgIHRoaXMubGluZXNNYXBwZWRbZ3JvdXBOYW1lXSA9IFtdO1xuXG4gICAgICBzd2l0Y2ggKGdyb3VwUHRzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgdGhpcy5hcnJvd2hlYWRQdHMucHVzaChncm91cFB0c1swXSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgdGhpcy5saW5lc1tncm91cE5hbWVdID0gW1tncm91cFB0c1swXS54LCBncm91cFB0c1swXS55LCBncm91cFB0c1sxXS54LCBncm91cFB0c1sxXS55XV07XG4gICAgICAgICAgdGhpcy5hcnJvd2hlYWRQdHMucHVzaChncm91cFB0c1sxXSk7XG5cbiAgICAgICAgICB0aGlzLmFycm93aGVhZExhYmVsc1tncm91cE5hbWVdLnIgPSBncm91cFB0c1sxXS5yO1xuICAgICAgICAgIHRoaXMuYXJyb3doZWFkTGFiZWxzW2dyb3VwTmFtZV0ueCA9IGdyb3VwUHRzWzFdLnggLSAodGhpcy5hcnJvd2hlYWRMYWJlbHNbZ3JvdXBOYW1lXS53aWR0aCAvIDIpO1xuICAgICAgICAgIHRoaXMuYXJyb3doZWFkTGFiZWxzW2dyb3VwTmFtZV0ueSA9IGdyb3VwUHRzWzFdLnkgLSAodGhpcy5hcnJvd2hlYWRMYWJlbHNbZ3JvdXBOYW1lXS5oZWlnaHQgLyAyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gQWRkcyBhbm90aGVyIHBvaW50IGZvciBldmVyeSBcIm1pZGRsZVwiIHBvaW50XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGdyb3VwUHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwdCA9IGdyb3VwUHRzW2ldO1xuICAgICAgICAgICAgdGhpcy5saW5lc01hcHBlZFtncm91cE5hbWVdLnB1c2gocHQpO1xuXG4gICAgICAgICAgICBpZiAoKGkgIT09IDApICYmIChpICE9PSAoZ3JvdXBQdHMubGVuZ3RoIC0gMSkpKSB7XG4gICAgICAgICAgICAgIHRoaXMubGluZXNNYXBwZWRbZ3JvdXBOYW1lXS5wdXNoKHB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDb25zdHJ1Y3RzIHRoZSBsaW5lIGFycmF5XG4gICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgd2hpbGUgKGkgPCB0aGlzLmxpbmVzTWFwcGVkW2dyb3VwTmFtZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVzW2dyb3VwTmFtZV0ucHVzaChbdGhpcy5saW5lc01hcHBlZFtncm91cE5hbWVdW2ldLngsIHRoaXMubGluZXNNYXBwZWRbZ3JvdXBOYW1lXVtpXS55LCB0aGlzLmxpbmVzTWFwcGVkW2dyb3VwTmFtZV1baSArIDFdLngsIHRoaXMubGluZXNNYXBwZWRbZ3JvdXBOYW1lXVtpICsgMV0ueV0pO1xuICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGxhc3RMaW5lUHQgPSBfLmxhc3QodGhpcy5saW5lc01hcHBlZFtncm91cE5hbWVdKTtcbiAgICAgICAgICB0aGlzLmFycm93aGVhZFB0cy5wdXNoKGxhc3RMaW5lUHQpO1xuXG4gICAgICAgICAgdGhpcy5hcnJvd2hlYWRMYWJlbHNbZ3JvdXBOYW1lXS5yID0gbGFzdExpbmVQdC5yO1xuICAgICAgICAgIHRoaXMuYXJyb3doZWFkTGFiZWxzW2dyb3VwTmFtZV0ueCA9IGxhc3RMaW5lUHQueCAtICh0aGlzLmFycm93aGVhZExhYmVsc1tncm91cE5hbWVdLndpZHRoIC8gMik7XG4gICAgICAgICAgdGhpcy5hcnJvd2hlYWRMYWJlbHNbZ3JvdXBOYW1lXS55ID0gbGFzdExpbmVQdC55IC0gKHRoaXMuYXJyb3doZWFkTGFiZWxzW2dyb3VwTmFtZV0uaGVpZ2h0IC8gMik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hcnJvd2hlYWRMYWJlbHMgPSBfLnZhbHVlcyh0aGlzLmFycm93aGVhZExhYmVscyk7XG4gICAgcmV0dXJuIHRoaXMubGluZXM7XG4gIH1cblxuICBnZXRMaW5lQXJyYXkoZ3JvdXApIHtcbiAgICBpZiAodGhpcy5saW5lcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9jcmVhdGVMaW5lQXJyYXlzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGluZXNbZ3JvdXBdO1xuICB9XG5cbiAgZ2V0VW5pcXVlR3JvdXBzKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZW5kTGluZTtcbiJdfQ==

//# sourceMappingURL=TrendLine.es6.js.map