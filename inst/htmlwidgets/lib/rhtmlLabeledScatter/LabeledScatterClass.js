var LabeledScatter;

LabeledScatter = (function() {
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

})();
