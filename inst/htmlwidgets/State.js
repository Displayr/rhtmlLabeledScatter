(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.State = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// This class interacts with Displayr's state mechanism
// Careful with alterations here as very old state types need to be defended against

var State = function () {
  function State(stateObj, stateChangedCallback, X, Y, label) {
    _classCallCheck(this, State);

    this.stateObj = stateObj;
    this.stateChangedCallback = stateChangedCallback;
    if (!_.isObject(this.stateObj)) {
      this.stateObj = {};
    }

    // NB If the plot data (i.e., X, Y, labels) has changed we reset all user state
    var storedX = this.isStoredInState('X') ? this.getStored('X') : [];
    var storedY = this.isStoredInState('Y') ? this.getStored('Y') : [];
    var storedLabel = this.isStoredInState('label') ? this.getStored('label') : [];
    if (!_.isEqual(storedX, X) || !_.isEqual(storedY, Y) || !_.isEqual(storedLabel, label)) {
      this.stateObj = {};
      this.saveToState('X', X);
      this.saveToState('Y', Y);
      this.saveToState('label', label);
    }

    this.legendPts = this.isStoredInState('legendPts') ? _.uniq(this.getStored('legendPts')) : [];
    this.userPositionedLabs = this.isStoredInState('userPositionedLabs') ? this.getStored('userPositionedLabs') : [];
  }

  State.prototype.isStoredInState = function isStoredInState(key) {
    return _.has(this.stateObj, key);
  };

  State.prototype.getStored = function getStored(key) {
    if (this.isStoredInState(key)) {
      return this.stateObj[key];
    }
    throw new Error('key \'' + key + ' not in state');
  };

  State.prototype.saveToState = function saveToState(key, val) {
    if (_.isFunction(this.stateChangedCallback)) {
      this.stateObj[key] = val;
      this.stateChangedCallback(this.stateObj);
    }
  };

  State.prototype.pushLegendPt = function pushLegendPt(id) {
    this.legendPts.push(id);
    _.remove(this.userPositionedLabs, function (e) {
      return e.id === id;
    });
    this.saveToState('legendPts', this.legendPts);
    this.saveToState('userPositionedLabs', this.userPositionedLabs);
  };

  State.prototype.pullLegendPt = function pullLegendPt(id) {
    _.pull(this.legendPts, id);
    return this.saveToState('legendPts', this.legendPts);
  };

  State.prototype.getLegendPts = function getLegendPts() {
    return this.legendPts;
  };

  State.prototype.isLegendPtsSynced = function isLegendPtsSynced(currLegendPts) {
    // KZ TODO this equality check looks insufficient
    return this.legendPts.length === 0 || this.legendPts.length === currLegendPts.length;
  };

  State.prototype.pushUserPositionedLabel = function pushUserPositionedLabel(id, labx, laby, viewBoxDim) {
    _.remove(this.userPositionedLabs, function (e) {
      return e.id === id;
    });

    this.userPositionedLabs.push({
      id: id,
      x: (labx - viewBoxDim.x) / viewBoxDim.width,
      y: (laby - viewBoxDim.y) / viewBoxDim.height
    });
    this.saveToState('userPositionedLabs', this.userPositionedLabs);
  };

  State.prototype.updateLabelsWithUserPositionedData = function updateLabelsWithUserPositionedData(labels, viewBoxDim) {
    var _this = this;

    if (!_.isEmpty(this.userPositionedLabs)) {
      _(labels).each(function (label) {
        var matchingLabel = _.find(_this.userPositionedLabs, function (e) {
          return e.id === label.id;
        });
        if (matchingLabel != null) {
          label.x = matchingLabel.x * viewBoxDim.width + viewBoxDim.x;
          label.y = matchingLabel.y * viewBoxDim.height + viewBoxDim.y;
        }
      });
    }
  };

  State.prototype.getUserPositionedLabIds = function getUserPositionedLabIds() {
    return _.map(this.userPositionedLabs, function (e) {
      return e.id;
    });
  };

  return State;
}();

module.exports = State;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0aGVTcmMvc2NyaXB0cy9TdGF0ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7QUFDQTs7SUFFTSxLO0FBQ0osaUJBQVksUUFBWixFQUFzQixvQkFBdEIsRUFBNEMsQ0FBNUMsRUFBK0MsQ0FBL0MsRUFBa0QsS0FBbEQsRUFBeUQ7QUFBQTs7QUFFdkQsU0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsU0FBSyxvQkFBTCxHQUE0QixvQkFBNUI7QUFDQSxRQUFJLENBQUUsRUFBRSxRQUFGLENBQVcsS0FBSyxRQUFoQixDQUFOLEVBQWtDO0FBQ2hDLFdBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNEOztBQUVEO0FBQ0EsUUFBTSxVQUFVLEtBQUssZUFBTCxDQUFxQixHQUFyQixJQUE0QixLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQTVCLEdBQWtELEVBQWxFO0FBQ0EsUUFBTSxVQUFVLEtBQUssZUFBTCxDQUFxQixHQUFyQixJQUE0QixLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQTVCLEdBQWtELEVBQWxFO0FBQ0EsUUFBTSxjQUFjLEtBQUssZUFBTCxDQUFxQixPQUFyQixJQUFnQyxLQUFLLFNBQUwsQ0FBZSxPQUFmLENBQWhDLEdBQTBELEVBQTlFO0FBQ0EsUUFBSSxDQUFDLEVBQUUsT0FBRixDQUFVLE9BQVYsRUFBbUIsQ0FBbkIsQ0FBRCxJQUNHLENBQUMsRUFBRSxPQUFGLENBQVUsT0FBVixFQUFtQixDQUFuQixDQURKLElBRUcsQ0FBQyxFQUFFLE9BQUYsQ0FBVSxXQUFWLEVBQXVCLEtBQXZCLENBRlIsRUFFdUM7QUFDckMsV0FBSyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsV0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLENBQXRCO0FBQ0EsV0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLENBQXRCO0FBQ0EsV0FBSyxXQUFMLENBQWlCLE9BQWpCLEVB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Q0EsZ0JBQU0sQ0FBTixHQUFXLGNBQWMsQ0FBZCxHQUFrQixXQUFXLE1BQTlCLEdBQXdDLFdBQVcsQ0FBN0Q7QUFDRDtBQUNGLE9BTkQ7QUFPRDtBQUNGLEc7O2tCQUVELHVCLHNDQUEwQjtBQUN4QixXQUFPLEVBQUUsR0FBRixDQUFNLEtBQUssa0JBQVgsRUFBK0I7QUFBQSxhQUFLLEVBQUUsRUFBUDtBQUFBLEtBQS9CLENBQVA7QUFDRCxHOzs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixLQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBUaGlzIGNsYXNzIGludGVyYWN0cyB3aXRoIERpc3BsYXlyJ3Mgc3RhdGUgbWVjaGFuaXNtXG4vLyBDYXJlZnVsIHdpdGggYWx0ZXJhdGlvbnMgaGVyZSBhcyB2ZXJ5IG9sZCBzdGF0ZSB0eXBlcyBuZWVkIHRvIGJlIGRlZmVuZGVkIGFnYWluc3RcblxuY2xhc3MgU3RhdGUge1xuICBjb25zdHJ1Y3RvcihzdGF0ZU9iaiwgc3RhdGVDaGFuZ2VkQ2FsbGJhY2ssIFgsIFksIGxhYmVsKSB7XG5cbiAgICB0aGlzLnN0YXRlT2JqID0gc3RhdGVPYmo7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZWRDYWxsYmFjayA9IHN0YXRlQ2hhbmdlZENhbGxiYWNrO1xuICAgIGlmICghKF8uaXNPYmplY3QodGhpcy5zdGF0ZU9iaikpKSB7XG4gICAgICB0aGlzLnN0YXRlT2JqID0ge307XG4gICAgfVxuXG4gICAgLy8gTkIgSWYgdGhlIHBsb3QgZGF0YSAoaS5lLiwgWCwgWSwgbGFiZWxzKSBoYXMgY2hhbmdlZCB3ZSByZXNldCBhbGwgdXNlciBzdGF0ZVxuICAgIGNvbnN0IHN0b3JlZFggPSB0aGlzLmlzU3RvcmVkSW5TdGF0ZSgnWCcpID8gdGhpcy5nZXRTdG9yZWQoJ1gnKSA6IFtdO1xuICAgIGNvbnN0IHN0b3JlZFkgPSB0aGlzLmlzU3RvcmVkSW5TdGF0ZSgnWScpID8gdGhpcy5nZXRTdG9yZWQoJ1knKSA6IFtdO1xuICAgIGNvbnN0IHN0b3JlZExhYmVsID0gdGhpcy5pc1N0b3JlZEluU3RhdGUoJ2xhYmVsJykgPyB0aGlzLmdldFN0b3JlZCgnbGFiZWwnKSA6IFtdO1xuICAgIGlmICghXy5pc0VxdWFsKHN0b3JlZFgsIFgpIHx8XG4gICAgICAgICAgICFfLmlzRXF1YWwoc3RvcmVkWSwgWSkgfHxcbiAgICAgICAgICAgIV8uaXNFcXVhbChzdG9yZWRMYWJlbCwgbGFiZWwpKSB7XG4gICAgICB0aGlzLnN0YXRlT2JqID0ge307XG4gICAgICB0aGlzLnNhdmVUb1N0YXRlKCdYJywgWCk7XG4gICAgICB0aGlzLnNhdmVUb1N0YXRlKCdZJywgWSk7XG4gICAgICB0aGlzLnNhdmVUb1N0YXRlKCdsYWJlbCcsIGxhYmVsKTtcbiAgICB9XG5cbiAgICB0aGlzLmxlZ2VuZFB0cyA9IHRoaXMuaXNTdG9yZWRJblN0YXRlKCdsZWdlbmRQdHMnKSA/IF8udW5pcSh0aGlzLmdldFN0b3JlZCgnbGVnZW5kUHRzJykpIDogW107XG4gICAgdGhpcy51c2VyUG9zaXRpb25lZExhYnMgPSB0aGlzLmlzU3RvcmVkSW5TdGF0ZSgndXNlclBvc2l0aW9uZWRMYWJzJykgPyB0aGlzLmdldFN0b3JlZCgndXNlclBvc2l0aW9uZWRMYWJzJykgOiBbXTtcbiAgfVxuXG4gIGlzU3RvcmVkSW5TdGF0ZShrZXkpIHtcbiAgICByZXR1cm4gXy5oYXModGhpcy5zdGF0ZU9iaiwga2V5KTtcbiAgfVxuXG4gIGdldFN0b3JlZChrZXkpIHtcbiAgICBpZiAodGhpcy5pc1N0b3JlZEluU3RhdGUoa2V5KSkgeyByZXR1cm4gdGhpcy5zdGF0ZU9ialtrZXldOyB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBrZXkgJyR7a2V5fSBub3QgaW4gc3RhdGVgKTtcbiAgfVxuXG4gIHNhdmVUb1N0YXRlKGtleSwgdmFsKSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLnN0YXRlQ2hhbmdlZENhbGxiYWNrKSkge1xuICAgICAgdGhpcy5zdGF0ZU9ialtrZXldID0gdmFsO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZWRDYWxsYmFjayh0aGlzLnN0YXRlT2JqKTtcbiAgICB9XG4gIH1cblxuICBwdXNoTGVnZW5kUHQoaWQpIHtcbiAgICB0aGlzLmxlZ2VuZFB0cy5wdXNoKGlkKTtcbiAgICBfLnJlbW92ZSh0aGlzLnVzZXJQb3NpdGlvbmVkTGFicywgZSA9PiBlLmlkID09PSBpZCk7XG4gICAgdGhpcy5zYXZlVG9TdGF0ZSgnbGVnZW5kUHRzJywgdGhpcy5sZWdlbmRQdHMpO1xuICAgIHRoaXMuc2F2ZVRvU3RhdGUoJ3VzZXJQb3NpdGlvbmVkTGFicycsIHRoaXMudXNlclBvc2l0aW9uZWRMYWJzKTtcbiAgfVxuXG4gIHB1bGxMZWdlbmRQdChpZCkge1xuICAgIF8ucHVsbCh0aGlzLmxlZ2VuZFB0cywgaWQpO1xuICAgIHJldHVybiB0aGlzLnNhdmVUb1N0YXRlKCdsZWdlbmRQdHMnLCB0aGlzLmxlZ2VuZFB0cyk7XG4gIH1cblxuICBnZXRMZWdlbmRQdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMubGVnZW5kUHRzO1xuICB9XG5cbiAgaXNMZWdlbmRQdHNTeW5jZWQoY3VyckxlZ2VuZFB0cykge1xuICAgIC8vIEtaIFRPRE8gdGhpcyBlcXVhbGl0eSBjaGVjayBsb29rcyBpbnN1ZmZpY2llbnRcbiAgICByZXR1cm4gKHRoaXMubGVnZW5kUHRzLmxlbmd0aCA9PT0gMCkgfHwgKHRoaXMubGVnZW5kUHRzLmxlbmd0aCA9PT0gY3VyckxlZ2VuZFB0cy5sZW5ndGgpO1xuICB9XG5cbiAgcHVzaFVzZXJQb3NpdGlvbmVkTGFiZWwoaWQsIGxhYngsIGxhYnksIHZpZXdCb3hEaW0pIHtcbiAgICBfLnJlbW92ZSh0aGlzLnVzZXJQb3NpdGlvbmVkTGFicywgZSA9PiBlLmlkID09PSBpZCk7XG5cbiAgICB0aGlzLnVzZXJQb3NpdGlvbmVkTGFicy5wdXNoKHtcbiAgICAgIGlkLFxuICAgICAgeDogKGxhYnggLSB2aWV3Qm94RGltLngpIC8gdmlld0JveERpbS53aWR0aCxcbiAgICAgIHk6IChsYWJ5IC0gdmlld0JveERpbS55KSAvIHZpZXdCb3hEaW0uaGVpZ2h0LFxuICAgIH0pO1xuICAgIHRoaXMuc2F2ZVRvU3RhdGUoJ3VzZXJQb3NpdGlvbmVkTGFicycsIHRoaXMudXNlclBvc2l0aW9uZWRMYWJzKTtcbiAgfVxuXG4gIHVwZGF0ZUxhYmVsc1dpdGhVc2VyUG9zaXRpb25lZERhdGEobGFiZWxzLCB2aWV3Qm94RGltKSB7XG4gICAgaWYgKCFfLmlzRW1wdHkodGhpcy51c2VyUG9zaXRpb25lZExhYnMpKSB7XG4gICAgICBfKGxhYmVscykuZWFjaCgobGFiZWwpID0+IHtcbiAgICAgICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9IF8uZmluZCh0aGlzLnVzZXJQb3NpdGlvbmVkTGFicywgZSA9PiBlLmlkID09PSBsYWJlbC5pZCk7XG4gICAgICAgIGlmIChtYXRjaGluZ0xhYmVsICE9IG51bGwpIHtcbiAgICAgICAgICBsYWJlbC54ID0gKG1hdGNoaW5nTGFiZWwueCAqIHZpZXdCb3hEaW0ud2lkdGgpICsgdmlld0JveERpbS54O1xuICAgICAgICAgIGxhYmVsLnkgPSAobWF0Y2hpbmdMYWJlbC55ICogdmlld0JveERpbS5oZWlnaHQpICsgdmlld0JveERpbS55O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXRVc2VyUG9zaXRpb25lZExhYklkcygpIHtcbiAgICByZXR1cm4gXy5tYXAodGhpcy51c2VyUG9zaXRpb25lZExhYnMsIGUgPT4gZS5pZCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZTtcbiJdfQ==

//# sourceMappingURL=State.es6.js.map