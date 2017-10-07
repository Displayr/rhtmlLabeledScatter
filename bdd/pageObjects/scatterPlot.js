
class ScatterPlot {
  legendLabel (id) {
    return element(by.id(`legend-${id}`))
  }

  plotLabel (id) {
    return element(by.id(id))
  }

  circleAnchor (id) {
    return element(by.id(`anc-${id}`))
  }

  get legendGroup () {
    return element.all(by.css('.legend-groups-text')).get(0)
  }

  plotReset () {
    return element(by.css('.plot-reset-button'))
  }
}

module.exports = ScatterPlot
