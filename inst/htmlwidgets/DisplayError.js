// Generated by CoffeeScript 1.8.0
var DisplayError,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

DisplayError = (function() {
  var Err, instance;

  function DisplayError() {}

  instance = null;

  DisplayError.get = function() {
    if (instance == null) {
      instance = new Err();
    }
    return instance;
  };

  Err = (function() {
    function Err() {
      this.getErrorImgUrl = __bind(this.getErrorImgUrl, this);
      this.displayErrorMessage = __bind(this.displayErrorMessage, this);
    }

    Err.prototype.checkIfArrayOfNums = function(X, svg, errorMsg) {
      if (!this.isArrayOfNums(X)) {
        return this.displayErrorMessage(svg, errorMsg);
      }
    };

    Err.prototype.isArrayOfNums = function(X) {
      return X.constructor === Array && _.every(X, function(n) {
        return !isNaN(n);
      });
    };

    Err.prototype.displayErrorMessage = function(svg, msg) {
      var errorContainer, errorImage, errorText;
      errorContainer = $('<div class="rhtml-error-container">');
      errorImage = $('<img width="32px" height="32px" src="' + this.getErrorImgUrl() + '"/>');
      errorText = $('<span style="color: red;">').html(msg.toString());
      errorContainer.append(errorImage);
      errorContainer.append(errorText);
      $(svg).empty();
      return $(svg).append(errorContainer);
    };

    Err.prototype.getErrorImgUrl = function() {
      return 'https://s3-ap-southeast-2.amazonaws.com/kyle-public-numbers-assets/htmlwidgets/CroppedImage/error_128.png';
    };

    return Err;

  })();

  return DisplayError;

})();
