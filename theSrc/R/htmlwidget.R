#' rhtmlLabeledScatter HTML Widget
#'
#' @description A HTMLWidget that creates a labeled scatter plot.
#'
#'
#' @param X is array of x coordinates of data set
#' @param Y is array of y coordinates of data set
#' @param Z is size coordinates of data set (for bubble charts). This is optional
#' @param label is the array of text labels for the data set
#' @param group is the array of group name for each data point
#' @param fixed.aspect Default to FALSE.
#' @param colors is the color wheel to be used when plotting the data points. Defaults to Q color wheel.
#' @param grid Defaults to TRUE. Shows the grid lines.
#' @param origin Defaults to FALSE. Shows the origin lines as dotted if not along axis.
#' @param origin.align Defaults to FALSE. Aligns the origin lines as closely to axis as possible.
#' @param x.title is the title text given to the x axis
#' @param y.title is the title text given to the y axis
#' @param z.title is the title text given to the bubble size
#' @param title.font.family is the font family of the plot title
#' @param title.font.color is the font color of the plot title
#' @param title.font size is the font size of the plot title
#' @param labels.font.family is the font family of the labels
#' @param labels.font.color is the font color of the labels. NOTE: This overrides the color if it is set
#' @param labels.font.size is the font size of the labels
#' @param legend.show is the toggle to show the legend. Defaults to TRUE
#' @param legend.font.color is the font color of the legend. NOTE: Setting this overrides the color array given
#' @param legend.font.size is the font size of the legend
#' @param legend.font.family is the font family of the legend
#' @param y.title.font.color is the font color of the y axis title
#' @param y.title.font.size is the font size of the y axis title
#' @param y.title.font.family is the font family of the y axis title
#' @param x.title.font.color is the font color of the x axis title
#' @param x.title.font.size is the font size of the x axis title
#' @param x.title.font.family is the font family of the x axis title
#' @param tooltip.font.color is the font color of the tooltips
#' @param tooltip.font.family is the font family of the tooltips
#' @param tooltip.font.size is the font size of the tooltips
#' @param width is the width of the plot. Defaults to max of window
#' @param height is the height of the plot. Defaults to the max of window
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
  origin.align = FALSE,
  y.title = "",
  x.title = "",
  z.title = "",
  title = "",
  x.decimals = 1,
  y.decimals = 1,
  z.decimals = 1,
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
    originAlign = origin.align,
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
