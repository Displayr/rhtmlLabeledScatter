class DisplayError
  instance = null

  @get: ->
    if not instance?
      instance = new Err()
    instance

  class Err
    constructor: ->

    checkIfArrayOfNums: (X, svg, errorMsg) ->
      unless @isArrayOfNums(X)
        @displayErrorMessage(svg, errorMsg)

    isArrayOfNums: (X) ->
      console.log X
      console.log X.constructor
      console.log _.every(X, (n) -> !isNaN(n))
      console.log '-----------------'
      X.constructor == Array and _.every(X, (n) -> !isNaN(n))

    displayErrorMessage: (svg, msg) =>
      errorContainer = $('<div class="rhtml-error-container">')

      errorImage = $('<img width="32px" height="32px" src="'+@getErrorImgUrl()+'"/>')

      errorText = $('<span style="color: red;">')
                  .html(msg.toString())

      errorContainer.append(errorImage)
      errorContainer.append(errorText)

      $(svg).empty()
      $(svg).append(errorContainer)

      throw new Error(msg)

    getErrorImgUrl: =>
      'https://s3-ap-southeast-2.amazonaws.com/kyle-public-numbers-assets/htmlwidgets/CroppedImage/error_128.png'
