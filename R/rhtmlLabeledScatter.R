# TEMPLATE! - update the method descriptions.

#' rhtmlTemplate HTML Widget
#'
#' @description A HTMLWidget that ...
#'
#' @section Usage Scenarios:
#'
#' Scenario 1: Blah blah
#'
#' @param param1 is a good param
#'
#' @examples
#'
#' rhtmlTemplate::template('{}')
#'
#' @author First Last <first.last@gmail.com>
#'
#' @source https://github.com/NumbersInternational/rhtmlTemplate
#'
#' @import htmlwidgets
#'
#' @export
#'

# TEMPLATE! - update the function name
template <- function(settingsJsonString = '{}') {

  DEFAULT_WIDGET_WIDTH <- 600
  DEFAULT_WIDGET_HEIGHT <- 600

  parsedInput <- NULL
  parsedInput = tryCatch({
    jsonlite::fromJSON(settingsJsonString)
  }, warning = function(w) {
    print("warning while parsing JSON:")
    print(w)
  }, error = function(e) {
    print("error while parsing JSON:")
    print(e)
    stop(e)
  }, finally = {})

  width <- DEFAULT_WIDGET_WIDTH
  height <- DEFAULT_WIDGET_HEIGHT

  if('width' %in% names(parsedInput)) {
    width <- as.numeric(unlist(parsedInput['width']))
  }

  if('height' %in% names(parsedInput)) {
    height <- as.numeric(unlist(parsedInput['height']))
  }

  htmlwidgets::createWidget(
    # TEMPLATE! - update the name here
    name = 'rhtmlTemplate',
    settingsJsonString,
    width = width,
    height = height,
    sizingPolicy = htmlwidgets::sizingPolicy(
      defaultWidth = width,
      defaultHeight = height,
      browser.fill = TRUE,
      viewer.fill = TRUE,
      padding = 0
    ),
    # TEMPLATE! - update the name here
    package = 'rhtmlTemplate'
  )
}
