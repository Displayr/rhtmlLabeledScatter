var RhtmlStatefulWidget;

RhtmlStatefulWidget = (function() {
  function RhtmlStatefulWidget(el, width, height) {
    this.stateListeners = [];
  }

  RhtmlStatefulWidget.prototype.partialStateUpdate = function(k, v) {
    this.state[k] = v;
    this._updateStateListeners();
    return this._redraw();
  };

  RhtmlStatefulWidget.prototype.getState = function() {
    return this.state;
  };

  RhtmlStatefulWidget.prototype.setState = function(newState) {
    var err, error;
    if (_.isString(newState)) {
      try {
        this.state = JSON.parse(newState);
      } catch (error) {
        err = error;
        throw new Error('json parse error in setState(#newState): ' + err);
      }
    } else {
      this.state = _.clone(newState);
    }
    this._updateStateListeners();
    return this._redraw();
  };

  RhtmlStatefulWidget.prototype.registerStateListener = function(listener) {
    if (!_.isArray(this.stateListeners)) {
      this.stateListeners = [];
    }
    return this.stateListeners.push(listener);
  };

  RhtmlStatefulWidget.prototype._initializeState = function(newState) {
    return this.state = newState;
  };

  RhtmlStatefulWidget.prototype._updateStateListeners = function() {
    if (!_.isArray(this.stateListeners)) {
      this.stateListeners = [];
    }
    return _.forEach(this.stateListeners, (function(_this) {
      return function(listener) {
        return listener(_.clone(_this.state));
      };
    })(this));
  };

  return RhtmlStatefulWidget;

})();
