#' @title Labeled scatterplot HTMLWidget
#'
#' @description A HTMLWidget that creates a labeled scatter plot.
#'
#' @param X is a vector of x coordinates of data set
#' @param Y is vector of y coordinates of data set
#' @param Z is vector of magnitudes for each set of x,y coordinates (for bubble charts). This is optional
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
#' @param title.font.size is the font size of the plot title
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
#' @param leaderline.distance.minimum Distance between anchor and label must meet or exceed this value before a leader line will be drawn (Default is 10)
#' @param leaderline.distance.nearbyAnchors If a label has other anchors nearby, a leader line be added regardless of distance between anchor and label (Default is 10)
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
#' @param point.radius Radius of the points when bubble parameter \code{Z} is not supplied. Defaults to 2.
#'     When the \code{Z} is supplied, the points are scaled so that the largest point has a radius of
#'     \code{point.radius * 50/3} (i.e. a diameter of roughly an inch for the default value).
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
#' @param label.placement.weight.distance.multiplier.centeredAboveAnchor TODO document
#' @param label.placement.weight.distance.multiplier.centeredUnderneathAnchor TODO document
#' @param label.placement.weight.distance.multiplier.besideAnchor TODO document
#' @param label.placement.weight.distance.multiplier.diagonalOfAnchor TODO document
#' @param label.placement.weight.labelLabelOverlap Label placement algorithm weight for the overlap between two labels (Default is 12.0)
#' @param label.placement.weight.labelAncOverlap Label placement algorithm weight fo the overlap between the point and label (Default is 8.0)
#' @param label.placement.numSweeps Label placement algorithm number of sweeps through the dataset (Default is 500).
#' @param label.placement.maxMove Label placement algorithm setting to determine how far in pixels a move is made (Default is 5).
#' @param label.placement.maxAngle Label placement algorithm setting to determine the domain of angles chosen for mcrotate (Default is 2*Pi).
#' @param label.placement.seed Label placement algorithm setting for the randomiser seed (Default is 1).
#' @param label.placement.temperature.initial Label placement algorithm initial temperature (Default is 0.01).
#' @param label.placement.temperature.final Label placement algorithm final temperature (Default is 0.0001).
#' @param debug.mode Boolean toggle to display widget internals for debugging (Default is FALSE)
#'
#' @author Po Liu <po.liu@displayr.com>
#'
#' @source https://github.com/Displayr/rhtmlLabeledScatter
#'
#' @import htmlwidgets
#' @importFrom grDevices rgb
#' @importFrom jsonlite toJSON
#'
#' @export
#'

LabeledScatter <- function(
    X = NULL,
    Y = NULL,
    Z = NULL,
    axis.font.color = 'Black',
    axis.font.family = 'Arial',
    axis.font.size = 12,
    color.transparency = NULL,
    colors = c('#5B9BD5', '#ED7D31', '#A5A5A5', '#1EC000', '#4472C4', '#70AD47','#255E91','#9E480E','#636363','#997300','#264478','#43682B','#FF2323'),
    debug.mode = FALSE,
    fixed.aspect = FALSE,
    footer = "",
    footer.font.color = rgb(44, 44, 44, maxColorValue = 255),
    footer.font.family = "Arial",
    footer.font.size = 8,
    grid = TRUE,
    group = NULL,
    height = NULL,
    label = NULL,
    label.alt = NULL,
    label.placement.maxAngle = 2 * 3.1415,
    label.placement.maxMove = 5.0,
    label.placement.numSweeps = 500,
    label.placement.seed = 1,
    label.placement.temperature.initial = 0.01,
    label.placement.temperature.final = 0.0001,
    label.placement.weight.distance = 10.0,
    label.placement.weight.distance.multiplier.centeredAboveAnchor = 1,
    label.placement.weight.distance.multiplier.centeredUnderneathAnchor =  1.5,
    label.placement.weight.distance.multiplier.besideAnchor = 4,
    label.placement.weight.distance.multiplier.diagonalOfAnchor = 15,
    label.placement.weight.labelAncOverlap = 8.0,
    label.placement.weight.labelLabelOverlap = 12.0,
    labels.font.color = NULL,
    labels.font.family = "Arial",
    labels.font.size = 10,
    labels.logo.scale = NULL,
    labels.show = TRUE,
    leaderline.distance.minimum = 10.0,
    leaderline.distance.nearbyAnchors = 10.0,
    legend.bubble.font.color = rgb(44, 44, 44, maxColorValue = 255),
    legend.bubble.font.family = "Arial",
    legend.bubble.font.size = 10,
    legend.bubble.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
    legend.bubble.title.font.family = "Arial",
    legend.bubble.title.font.size = 12,
    legend.bubbles.show = TRUE,
    legend.font.color = rgb(44, 44, 44, maxColorValue = 255),
    legend.font.family = "Arial",
    legend.font.size = 12,
    legend.show = TRUE,
    origin = TRUE,
    origin.align = FALSE,
    plot.border.color = 'Black',
    plot.border.show = TRUE,
    plot.border.width = 1,
    point.radius = if (is.null(Z)) 2 else 4,
    subtitle = "",
    subtitle.font.color = rgb(44, 44, 44, maxColorValue = 255),
    subtitle.font.family = "Arial",
    subtitle.font.size = 12,
    title = "",
    title.font.color = rgb(44, 44, 44, maxColorValue = 255),
    title.font.family = "Arial",
    title.font.size = 16,
    tooltip.font.color = rgb(44, 44, 44, maxColorValue = 255),
    tooltip.font.family = "Arial",
    tooltip.font.size = 10,
    tooltip.text = NULL,
    trend.lines.line.thickness = 1,
    trend.lines.point.size=2,
    trend.lines.show = FALSE,
    width = NULL,
    x.axis.show = TRUE,
    x.bounds.maximum = NULL,
    x.bounds.minimum = NULL,
    x.bounds.units.major = NULL,
    x.decimals = NULL,
    x.format = NULL,
    x.levels = NULL,
    x.prefix = "",
    x.suffix = "",
    x.title = "",
    x.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
    x.title.font.family = "Arial",
    x.title.font.size = 12,
    y.axis.show = TRUE,
    y.bounds.maximum = NULL,
    y.bounds.minimum = NULL,
    y.bounds.units.major = NULL,
    y.decimals = NULL,
    y.format = NULL,
    y.levels = NULL,
    y.prefix = "",
    y.suffix = "",
    y.title = "",
    y.title.font.color = rgb(44, 44, 44, maxColorValue = 255),
    y.title.font.family = "Arial",
    y.title.font.size = 12,
    z.decimals = NULL,
    z.prefix = "",
    z.suffix = "",
    z.title = "")
{
    # Check inputs
    if (is.null(X) || !is.atomic(X) || is.array(X))
        stop("Input X needs to be a vector")
    if (is.null(Y) || !is.atomic(Y) || is.array(Y))
        stop("Input Y needs to be a vector")
    if (!is.null(Z) && (!is.numeric(Z) || any(Z < 0)))
        stop("Input Z needs to be a vector of non-negative numbers")
    if (length(X) != length(Y))
        stop("Inputs X and Y need to have the same length")
    if (!is.null(Z) && length(X) != length(Z))
        stop("Input Z needs to have the same length as X and Y")

    isDateTime <- function(x) { return (inherits(x, "Date") || inherits(x, "POSIXct") || inherits(x, "POSIXt"))}
    xIsDateTime <- isDateTime(X[1])
    yIsDateTime <- isDateTime(Y[1])

    x = list(X = toJSON(X),
             Y = toJSON(Y),
             Z = toJSON(Z),
             xIsDateTime = xIsDateTime,
             yIsDateTime = yIsDateTime,
             label = toJSON(label),
             labelAlt = toJSON(label.alt),
             group = toJSON(group),
             xLevels = x.levels,
             yLevels = y.levels,
             fixedAspectRatio = fixed.aspect,
             colors = toJSON(colors),
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
             leaderLineDistanceMinimum = leaderline.distance.minimum,
             leaderLineDistanceNearbyAnchors = leaderline.distance.nearbyAnchors,
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
             labelPlacementWeightDistance = label.placement.weight.distance,
             labelPlacementWeightDistanceMultiplierCenteredAboveAnchor = label.placement.weight.distance.multiplier.centeredAboveAnchor,
             labelPlacementWeightDistanceMultiplierCenteredUnderneathAnchor = label.placement.weight.distance.multiplier.centeredUnderneathAnchor,
             labelPlacementWeightDistanceMultiplierBesideAnchor = label.placement.weight.distance.multiplier.besideAnchor,
             labelPlacementWeightDistanceMultiplierDiagonalOfAnchor = label.placement.weight.distance.multiplier.diagonalOfAnchor,
             labelPlacementWeightLabelLabelOverlap = label.placement.weight.labelLabelOverlap,
             labelPlacementWeightLabelAnchorOverlap = label.placement.weight.labelAncOverlap,
             labelPlacementNumSweeps = label.placement.numSweeps,
             labelPlacementSeed = label.placement.seed,
             labelPlacementTemperatureInitial = label.placement.temperature.initial,
             labelPlacementTemperatureFinal = label.placement.temperature.final,
             labelPlacementMaxMove = label.placement.maxMove,
             labelPlacementMaxAngle = label.placement.maxAngle,
             debugMode = debug.mode,
             plotBorderColor = plot.border.color,
             plotBorderWidth = plot.border.width)

    sizing.policy <- htmlwidgets::sizingPolicy(browser.fill = TRUE,
                                               viewer.fill = TRUE,
                                               padding = 0)

    htmlwidgets::createWidget(name = 'rhtmlLabeledScatter',
                              x,
                              width = width,
                              height = height,
                              sizingPolicy = sizing.policy,
                              package = 'rhtmlLabeledScatter')
}
