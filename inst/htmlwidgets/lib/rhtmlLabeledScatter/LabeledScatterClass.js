var LabeledScatter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LabeledScatter = (function(superClass) {
  extend(LabeledScatter, superClass);

  function LabeledScatter(width, height) {
    this.width = width;
    this.height = height;
  }

  LabeledScatter.prototype.draw = function(data, el) {
    this.data = data;
  };

  LabeledScatter.prototype.redraw = function(width, height, el) {
    this.width = width;
    this.height = height;
  };

  return LabeledScatter;

})(RhtmlStatefulWidget);
