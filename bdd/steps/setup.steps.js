const ScatterPlot = require('../pageObjects/scatterPlot');

module.exports = function () {
  this.Before(function () {
    this.context.scatterPlot = new ScatterPlot()
  })
}