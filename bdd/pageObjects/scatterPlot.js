
class ScatterPlot {
  constructor() {

  }

  legendLabel(id) {
    return element(by.id(`legend-${id}`));
  }

  plotLabel(id) {
    return element(by.id(id));
  }

  circleAnchor(id) {
    return element(by.id(`anc-${id}`));
  }

  get legendGroup() {
    return element.all(by.css('.legend-groups-text')).get(0);
  }
}

module.exports = ScatterPlot;
