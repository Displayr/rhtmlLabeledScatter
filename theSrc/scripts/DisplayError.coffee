
class DisplayError

  constructor: (el, @error) ->
    @rootElement = if _.has(el, 'length') then el[0] else el

  draw: () ->
    errorContainer = $('<div class="pictograph-error-container">')

    errorImage = $('<img width="32px" height="32px" src="https://s3-ap-southeast-2.amazonaws.com/kyle-public-numbers-assets/htmlwidgets/CroppedImage/error_128.png"/>')

    errorText = $('<span>')
      .html(@error.toString())

    errorContainer.append(errorImage)
    errorContainer.append(errorText)

    $(@rootElement).empty()
    $(@rootElement).append(errorContainer)

