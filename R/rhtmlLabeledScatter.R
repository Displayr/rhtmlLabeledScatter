#' rhtmlLabeledScatter HTML Widget
#'
#' @description A HTMLWidget that creates a labeled scatter plot.
#'
#'
#' @param X is array of x coordinates of data set
#' @param Y is array of y coordinates of data set
#' @param Z is array of magnitudes for each set of x,y coordinates (for bubble charts). This is optional
#' @param label is the array of text labels for the data set (can supply an url to show logos)
#' @param label.alt is an optional array of alternate label text when an url was provided as the label. NOTE: must be same length as label
#' @param group is the array of group name for each data point
#' @param x.levels is the levels for the categorical X input array. Default is levels(X)
#' @param y.levels is the levels for the categorical Y input array. Default is levels(Y)
#' @param fixed.aspect Default to FALSE. Cannot be guarenteed if any of the axis bounds are set.
#' @param colors is the color wheel to be used when plotting the data points. Defaults to Q color wheel.
#' @param color.transparency Value 0-1 specifying the transparency level of the plot points. Defaults to 1 without Z and 0.8 with Z
#' @param grid Defaults to TRUE. Shows the grid lines.
#' @param origin Defaults to FALSE. Shows the origin lines as dotted if not along axis.
#' @param origin.align Defaults to FALSE. Aligns the origin lines as closely to axis as possible.
#' @param x.title is the title text given to the x axis
#' @param y.title is the title text given to the y axis
#' @param z.title is the title text given to the bubble size
#' @param title is the title text given to the plot
#' @param title.font.family is the font family of the plot title
#' @param title.font.color is the font color of the plot title
#' @param title.font size is the font size of the plot title
#' @param subtitle is the subtitle text given to the plot
#' @param subtitle.font.family is the font of the subtitle text
#' @param subtitle.font.color is the font color of the subtitle text
#' @param subtitle.font.size is the font size of the subtitle text
#' @param footer is the footer text given at the bottom at the plot
#' @param footer.font.family is the font of the footer text
#' @param footer.font.color is the font color of the footer text
#' @param footer.font.size is the font size of the footer text
#' @param labels.show Toggle for showing labels. Defaults to true if labels array given
#' @param labels.font.family is the font family of the labels
#' @param labels.font.color is the font color of the labels. NOTE: This overrides the color if it is set
#' @param labels.font.size is the font size of the labels
#' @param labels.logo.scale is a vector of scaling factors for label logos
#' @param legend.show is the toggle to show the legend. Defaults to TRUE
#' @param legend.bubbles.show toggle to show the bubble sizes in the legend. Defaults to TRUE
#' @param legend.font.color is the font color of the legend.
#' @param legend.font.size is the font size of the legend
#' @param legend.font.family is the font family of the legend
#' @param legend.bubble.font.color is the font color of the legend bubble values.
#' @param legend.bubble.font.size is the font size of the legend bubble values
#' @param legend.bubble.font.family is the font family of the legend bubble values
#' @param legend.bubble.title.font.color is the font color of the legend bubble title.
#' @param legend.bubble.title.font.size is the font size of the legend bubble title
#' @param legend.bubble.title.font.family is the font family of the legend bubble title
#' @param y.title.font.color is the font color of the y axis title
#' @param y.title.font.size is the font size of the y axis title
#' @param y.title.font.family is the font family of the y axis title
#' @param x.title.font.color is the font color of the x axis title
#' @param x.title.font.size is the font size of the x axis title
#' @param x.title.font.family is the font family of the x axis title
#' @param x.axis.show Boolean toggle to show the x axis tick markers (Default is TRUE).
#' @param y.axis.show Boolean toggle to show the y axis tick markers (Default is TRUE).
#' @param axis.font.family Font Family of the axis labels
#' @param axis.font.size Font size of the axis labels
#' @param axis.font.color Font color of the axis labels
#' @param tooltip.text is an array of text containing custom tool tip text that appears on mouse hover ('\\n' for new line)
#' @param tooltip.font.color is the font color of the tooltips
#' @param tooltip.font.family is the font family of the tooltips
#' @param tooltip.font.size is the font size of the tooltips
#' @param width is the width of the plot. Defaults to max of window
#' @param height is the height of the plot. Defaults to the max of window
#' @param x.decimals the number of decimals in the x axis
#' @param y.decimals the number of decimals in the y axis
#' @param z.decimals the number of decimals in the bubble size axis
#' @param y.prefix A string that prefixes all y values(eg. "$")
#' @param x.prefix A string that prefixes all x values(eg. "$")
#' @param z.prefix A string that prefixes all bubble values(eg. "$")
#' @param y.suffix A string that suffixes all y values(eg. "kg")
#' @param x.suffix A string that suffixes all x values(eg. "kg")
#' @param z.suffix A string that suffixes all bubble values(eg. "kg")
#' @param x.format A string that is interpreted for the format of the x axis labels. Default is NULL.
#' @param y.format A string that is interpreted for the format of the y axis labels. Default is NULL.
#' @param point.radius Radius of the points when bubble (Z) parameter not supplied. Defaults to 2.
#' @param x.bounds.minimum Integer or NULL; set minimum of range for plotting on the x axis
#' @param x.bounds.maximum Integer or NULL; set minimum of range for plotting on the x axis
#' @param y.bounds.minimum Integer or NULL; set minimum of range for plotting on the y axis
#' @param y.bounds.maximum Integer or NULL; set minimum of range for plotting on the y axis
#' @param x.bounds.units.major Integer or NULL; set the distance between each tick mark on the x axis.
#' @param y.bounds.units.major Integer or NULL; set the distance between each tick mark on the y axis.
#' @param trend.lines.show Boolean toggle to show trendlines based on groups given
#' @param trend.lines.line.thickness An integer for the thickness of the trendlines (Default is 1px)
#' @param trend.lines.point.size An integer to set the size of the data points when a trendline is drawn. This setting overrides Z sizes.
#' @param plot.border.show Boolean toggle to show border around plot area (Default is TRUE).
#' @param plot.border.color Color of border around plot area (Default is black).
#' @param plot.border.width Width of border around plot area in px (Default is 1).
#' @param label.placement.weight.distance Label placement algorithm weight for the distance between the label and the point (Default is 10.0)
#' @param label.placement.weight.labelLabelOverlap Label placement algorithm weight for the overlap between two labels (Default is 12.0)
#' @param label.placement.weight.labelAncOverlap Label placement algorithm weight fo the overlap between the point and label (Default is 8.0)
#' @param label.placement.numSweeps Label placement algorithm number of sweeps through the dataset (Default is 500).
#' @param label.placement.maxMove Label placement algorithm setting to determine how far in pixels a move is made (Default is 5).
#' @param label.placement.maxAngle Label placement algorithm setting to determine the domain of angles chosen for mcrotate (Default is 2*Pi).
#' @param label.placement.seed Label placement algorithm setting for the randomiser seed (Default is 1).
#' @param debug.mode Boolean toggle to display widget internals for debugging (Default is FALSE)
#'
#' @author Po Liu <po.liu@displayr.com>
#'
#' @source https://github.com/Displayr/rhtmlLabeledScatter
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
  label.alt = NULL,
  group = NULL,
  x.levels = NULL,
  y.levels = NULL,
  fixed.aspect = FALSE,
  colors = c('#5B9BD5', '#ED7D31', '#A5A5A5', '#1EC000', '#4472C4', '#70AD47','#255E91','#9E480E','#636363','#997300','#264478','#43682B','#FF2323'),
  color.transparency = NULL,
  grid = TRUE,
  origin = TRUE,
  origin.align = FALSE,
  y.title = "",
  x.title = "",
  z.title = "",
  title = "",
  x.decimals = NULL,
  y.decimals = NULL,
  z.decimals = NULL,
  x.prefix = "",
  y.prefix = "",
  z.prefix = "",
  x.suffix = "",
  y.suffix = "",
  z.suffix = "",
  x.format = NULL,
  y.format = NULL,
  title.font.family = "Arial",
  title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  title.font.size = 16,
  subtitle = "",
  subtitle.font.family = "Arial",
  subtitle.font.size = 12,
  subtitle.font.color = rgb(44, 44, 44, maxColorValue = 255),
  footer = "",
  footer.font.family = "Arial",
  footer.font.size = 8,
  footer.font.color = rgb(44, 44, 44, maxColorValue = 255),
  labels.show = TRUE,
  labels.font.family = "Arial",
  labels.font.color = NULL,
  labels.font.size = 10,
  labels.logo.scale = NULL,
  legend.show = TRUE,
  legend.bubbles.show = TRUE,
  legend.font.color = rgb(44, 44, 44, maxColorValue = 255),
  legend.font.family = "Arial",
  legend.font.size = 12,
  legend.bubble.font.color = rgb(44, 44, 44, maxColorValue = 255),
  legend.bubble.font.family = "Arial",
  legend.bubble.font.size = 10,
  legend.bubble.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  legend.bubble.title.font.family = "Arial",
  legend.bubble.title.font.size = 12,
  y.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  y.title.font.family = "Arial",
  y.title.font.size = 12,
  x.axis.show = TRUE,
  y.axis.show = TRUE,
  axis.font.family = 'Arial',
  axis.font.color = 'Black',
  axis.font.size = 12,
  x.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
  x.title.font.family = "Arial",
  x.title.font.size = 12,
  x.bounds.minimum = NULL,
  x.bounds.maximum = NULL,
  y.bounds.minimum = NULL,
  y.bounds.maximum = NULL,
  x.bounds.units.major = NULL,
  y.bounds.units.major = NULL,
  tooltip.text = NULL,
  tooltip.font.color = rgb(44, 44, 44, maxColorValue = 255),
  tooltip.font.family = "Arial",
  tooltip.font.size = 10,
  point.radius = 2,
  trend.lines.show = FALSE,
  trend.lines.line.thickness = 1,
  trend.lines.point.size=2,
  plot.border.show = TRUE,
  plot.border.color = 'Black',
  plot.border.width = 1,
  label.placement.weight.distance = 10.0,
  label.placement.weight.labelLabelOverlap = 12.0,
  label.placement.weight.labelAncOverlap = 8.0,
  label.placement.numSweeps = 500,
  label.placement.seed = 1,
  label.placement.maxMove = 5.0,
  label.placement.maxAngle = 2 * 3.1415,
  debug.mode = FALSE,
  width = NULL,
  height = NULL
  ) {

  x = list(
    X = jsonlite::toJSON(X),
    Y = jsonlite::toJSON(Y),
    Z = jsonlite::toJSON(Z),
    label = jsonlite::toJSON(label),
    labelAlt = jsonlite::toJSON(label.alt),
    group = jsonlite::toJSON(group),
    xLevels = if(is.null(x.levels)) levels(X) else x.levels,
    yLevels = if(is.null(y.levels)) levels(Y) else y.levels,
    fixedAspectRatio = fixed.aspect,
    colors = jsonlite::toJSON(colors),
    transparency = color.transparency,
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
    xSuffix = x.suffix,
    ySuffix = y.suffix,
    zSuffix = z.suffix,
    xFormat = x.format,
    yFormat = y.format,
    titleFontFamily = title.font.family,
    titleFontColor = title.font.color,
    titleFontSize = title.font.size,
    subtitle = subtitle,
    subtitleFontFamily = subtitle.font.family,
    subtitleFontSize = subtitle.font.size,
    subtitleFontColor = subtitle.font.color,
    footer = footer,
    footerFontFamily = footer.font.family,
    footerFontSize = footer.font.size,
    footerFontColor = footer.font.color,
    showLabels = labels.show,
    labelsFontFamily = labels.font.family,
    labelsFontColor = labels.font.color,
    labelsFontSize = labels.font.size,
    labelsLogoScale = labels.logo.scale,
    legendShow = legend.show,
    legendBubblesShow = legend.bubbles.show,
    legendFontColor = legend.font.color,
    legendFontFamily = legend.font.family,
    legendFontSize = legend.font.size,
    legendBubbleFontColor = legend.bubble.font.color,
    legendBubbleFontFamily = legend.bubble.font.family,
    legendBubbleFontSize = legend.bubble.font.size,
    legendBubbleTitleFontColor = legend.bubble.title.font.color,
    legendBubbleTitleFontFamily = legend.bubble.title.font.family,
    legendBubbleTitleFontSize = legend.bubble.title.font.size,
    yTitleFontColor = y.title.font.color,
    yTitleFontFamily = y.title.font.family,
    yTitleFontSize = y.title.font.size,
    xTitleFontColor = x.title.font.color,
    xTitleFontFamily = x.title.font.family,
    xTitleFontSize = x.title.font.size,
    showXAxis = x.axis.show,
    showYAxis = y.axis.show,
    axisFontFamily = axis.font.family,
    axisFontColor = axis.font.color,
    axisFontSize = axis.font.size,
    tooltipText = tooltip.text,
    tooltipFontColor = tooltip.font.color,
    tooltipFontFamily = tooltip.font.family,
    tooltipFontSize = tooltip.font.size,
    pointRadius = point.radius,
    xBoundsMinimum = x.bounds.minimum,
    xBoundsMaximum = x.bounds.maximum,
    yBoundsMinimum = y.bounds.minimum,
    yBoundsMaximum = y.bounds.maximum,
    xBoundsUnitsMajor = x.bounds.units.major,
    yBoundsUnitsMajor = y.bounds.units.major,
    trendLines = trend.lines.show,
    trendLinesLineThickness = trend.lines.line.thickness,
    trendLinesPointSize = trend.lines.point.size,
    plotBorderShow = plot.border.show,
    labelPlacementDistanceWeight = label.placement.weight.distance,
    labelPlacementLabelLabelOverlapWeight = label.placement.weight.labelLabelOverlap,
    labelPlacementLabelAncOverlapWeight = label.placement.weight.labelAncOverlap,
    labelPlacementNumSweeps = label.placement.numSweeps,
    labelPlacementSeed = label.placement.seed,
    labelPlacementMaxMove = label.placement.maxMove,
    labelPlacementMaxAngle = label.placement.maxAngle,
    debugMode = debug.mode,
    plotBorderColor = plot.border.color,
    plotBorderWidth = plot.border.width
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
