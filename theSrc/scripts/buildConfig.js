const _ = require('lodash')

// TODO all of the margin config params below can probably be removed
const defaultConfig = {
  axisFontColor: '#000000',
  axisFontFamily: 'Arial',
  axisFontSize: 12,
  colors: ['#5B9BD5', '#ED7D31', '#A5A5A5', '#1EC000', '#4472C4', '#70AD47', '#255E91', '#9E480E', '#636363', '#997300', '#264478', '#43682B', '#FF2323'],
  debugMode: false,
  fixedAspectRatio: false,
  footer: '',
  footerFontColor: '#2C2C2C',
  footerFontFamily: 'Arial',
  footerFontSize: 8,
  grid: true,
  group: null,
  label: null,
  labelAlt: [],
  labelPlacementWeightDistance: 10,
  labelPlacementWeightDistanceMultiplierCenteredAboveAnchor: 1,
  labelPlacementWeightDistanceMultiplierCenteredUnderneathAnchor: 1.5,
  labelPlacementWeightDistanceMultiplierBesideAnchor: 4,
  labelPlacementWeightDistanceMultiplierDiagonalOfAnchor: 15,
  labelPlacementWeightLabelAnchorOverlap: 8,
  labelPlacementWeightLabelLabelOverlap: 12,
  labelPlacementMaxAngle: 2 * Math.PI,
  labelPlacementMaxMove: 5,
  labelPlacementNumSweeps: 500,
  labelPlacementTemperatureInitial: 0.01,
  labelPlacementTemperatureFinal: 0.0001,
  labelPlacementSeed: 1,
  labelsFontColor: '#2C2C2C',
  labelsFontFamily: 'Arial',
  labelsFontSize: 10,
  labelsLogoScale: [],
  leaderLineDistanceMinimum: 10,
  leaderLineDistanceNearbyAnchors: 10,
  legendBubbleFontColor: '#2C2C2C',
  legendBubbleFontFamily: 'Arial',
  legendBubbleFontSize: 10,
  legendBubblesShow: true,
  legendBubbleTitleFontColor: '#2C2C2C',
  legendBubbleTitleFontFamily: 'Arial',
  legendBubbleTitleFontSize: 12,
  legendFontColor: '#2C2C2C',
  legendFontFamily: 'Arial',
  legendFontSize: 12,
  legendShow: true,
  origin: true,
  originAlign: false,
  plotBorderColor: '#000000',
  plotBorderShow: true,
  plotBorderWidth: 1,
  pointRadius: null, // if Z then 4 else 2 (applied below)
  showLabels: true,
  showResetButton: true,
  showXAxis: true,
  showYAxis: true,
  subtitle: '',
  subtitleFontColor: '#2C2C2C',
  subtitleFontFamily: 'Arial',
  subtitleFontSize: 12,
  title: '',
  titleFontColor: '#2C2C2C',
  titleFontFamily: 'Arial',
  titleFontSize: 16,
  tooltipFontColor: '#2C2C2C',
  tooltipFontFamily: 'Arial',
  tooltipFontSize: 10,
  tooltipText: [],
  transparency: null, // TODO rename to color transparency
  trendLines: false,
  trendLinesLineThickness: 1,
  trendLinesPointSize: 2,
  xBoundsMaximum: null,
  xBoundsMinimum: null,
  xBoundsUnitsMajor: null,
  xDecimals: null,
  xFormat: null,
  xIsDateTime: null, // NB computed in R
  xLevels: null,
  xPrefix: '',
  xSuffix: '',
  xTitle: '',
  xTitleFontColor: '#2C2C2C',
  xTitleFontFamily: 'Arial',
  xTitleFontSize: 12,
  yBoundsMaximum: null,
  yBoundsMinimum: null,
  yBoundsUnitsMajor: null,
  yDecimals: null,
  yFormat: null,
  yIsDateTime: null, // NB computed in R
  yLevels: null,
  yPrefix: '',
  ySuffix: '',
  yTitle: '',
  yTitleFontColor: '#2C2C2C',
  yTitleFontFamily: 'Arial',
  yTitleFontSize: 12,
  zDecimals: null,
  zPrefix: '',
  zSuffix: '',
  zTitle: ''
}

function buildConfig (userConfig, width, height) {
  const config = _.merge({}, defaultConfig, userConfig, { width, height })

  if (_.isNull(config.pointRadius)) {
    config.pointRadius = (_.isArray(config.Z) && config.Z.length)
      ? 4 : 2
  }

  return config
}

module.exports = {
  buildConfig,
  defaultConfig: _.cloneDeep(defaultConfig)
}
