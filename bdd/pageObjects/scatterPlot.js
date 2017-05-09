
class ScatterPlot {
  constructor({ configName, stateName, inputWidth = 1000, inputHeight = 1000 }) {
    this.animationDelayMilliseconds = 800;
    this.configName = configName;
    this.stateName = stateName;
    this.width = parseInt(inputWidth);
    this.height = parseInt(inputHeight);
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

  load() {
    let url = `http://localhost:9000/content/renderExample.html?width=${this.width}&height=${this.height}&config=${this.configName}`;
    if (this.stateName) {
      url += `&state=${this.stateName}`;
    }

    browser.get(url);
    browser.wait(browser.isElementPresent(by.css('.plot-title')));
    return browser.sleep(this.animationDelayMilliseconds);
  }

  getRecentState() {
    function getStateUpdates() {
      return window.stateUpdates;
    }

    return browser.executeScript(getStateUpdates).then((stateUpdates) => {
      return stateUpdates[stateUpdates.length - 1];
    });
  }
}

module.exports = ScatterPlot;
