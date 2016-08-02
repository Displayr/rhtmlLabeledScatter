#' rhtmlLabeledScatter HTML Widget
#'
#' @description A HTMLWidget that creates a labeled scatter plot.
#'
#' @section Usage Scenarios:
#'
#' Scenario 1: Blah blah
#'
#' @param param1 is a good param
#'
#' @examples
#'
#' rhtmlLabeledScatter::template('{}')
#'
#' @author Po Liu <pliu0771@uni.sydney.edu.au>
#'
#' @source https://github.com/NumbersInternational/rhtmlLabeledScatter
#'
#' @import htmlwidgets
#'
#' @export
#'

LabeledScatter <- function(
  X = NULL,
  Y = NULL,
  Z = NULL,
  label = NULL,
  group = NULL,
  fixed.aspect = FALSE,
  colors = c('#5B9BD5', '#ED7D31', '#A5A5A5', '#1EC000', '#4472C4', '#70AD47','#255E91','#9E480E','#636363','#997300','#264478','#43682B','#FF2323'),
  grid = TRUE,
  origin = TRUE,
  y.title = "",
  x.title = "",
  z.title = "",
  title = "",
  x.decimals = 2,
  y.decimals = 2,
  z.decimals = 2,
  x.prefix = "",
  y.prefix = "",
  z.prefix = "",
  title.font.family = "Arial",
  title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  title.font.size = 16,
  labels.font.family = "Arial",
  labels.font.color = rgb(44, 44, 44, maxColorValue = 255),
  labels.font.size = 10,
  legend.show = TRUE,
  legend.font.color = rgb(44, 44, 44, maxColorValue = 255),
  legend.font.family = "Arial",
  legend.font.size = 12,
  y.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  y.title.font.family = "Arial",
  y.title.font.size = 12,
  x.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  x.title.font.family = "Arial",
  x.title.font.size = 12,
  tooltip.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  tooltip.title.font.family = "Arial",
  tooltip.title.font.size = 10,
  width = NULL,
  height = NULL
  ) {

  x = list(
    X = jsonlite::toJSON(X),
    Y = jsonlite::toJSON(Y),
    Z = jsonlite::toJSON(Z),
    label = jsonlite::toJSON(label),
    group = jsonlite::toJSON(group),
    fixedAspectRatio = fixed.aspect,
    colors = jsonlite::toJSON(colors),
    grid = grid,
    origin = origin,
    xTitle = x.title,
    yTitle = y.title,
    zTitle = z.title,
    title = title,
    xDecimals = x.decimals,
    yDecimals = y.decimals,
    zDecimals = z.decimals,
    xPrefix = x.prefix,
    yPrefix = y.prefix,
    zPrefix = z.prefix,
    titleFontFamily = title.font.family,
    titleFontColor = title.font.color,
    titleFontSize = title.font.size,
    labelsFontFamily = labels.font.family,
    labelsFontColor = labels.font.color,
    labelsFontSize = labels.font.size,
    legendShow = legend.show,
    legendFontColor = legend.font.color,
    legendFontFamily = legend.font.family,
    legendFontSize = legend.font.size,
    yTitleFontColor = y.title.font.color,
    yTitleFontFamily = y.title.font.family,
    yTitleFontSize = y.title.font.size,
    xTitleFontColor = x.title.font.color,
    xTitleFontFamily = x.title.font.family,
    xTitleFontSize = x.title.font.size,
    tooltipTitleFontColor = tooltip.title.font.color,
    toolTipTitleFontFamily = tooltip.title.font.family,
    tooltipTitleFontSize = tooltip.title.font.size
  )

  htmlwidgets::createWidget(
    name = 'rhtmlLabeledScatter',
    x,
    width = width,
    height = height,
    sizingPolicy = htmlwidgets::sizingPolicy(
      browser.fill = TRUE,
      viewer.fill = TRUE,
      padding = 0
    ),
    package = 'rhtmlLabeledScatter'
  )
}
