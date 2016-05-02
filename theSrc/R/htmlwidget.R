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
#'
#' rhtmlTemplate::template(0.66, 400, 400, '{}')
#'
#' @author First Last <first.last@gmail.com>
#'
#' @source https://github.com/NumbersInternational/rhtmlTemplate
#'
#' @import htmlwidgets
#'
#' @export
#'

template <- function(percentage, width = NULL, height = NULL, settingsJsonString = '{}') {

  input = list(
    percentage = percentage,
    settingsJsonString = settingsJsonString
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'rhtmlTemplate',
    input,
    width = width,
    height = height,
    sizingPolicy = htmlwidgets::sizingPolicy(
      defaultWidth = 600,
      defaultHeight = 600,
      browser.fill = TRUE,
      viewer.fill = TRUE,
      padding = 0
    ),
    package = 'rhtmlTemplate'
  )
}
