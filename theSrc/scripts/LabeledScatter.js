import d3 from 'd3';
import _ from 'lodash';
import DisplayError from './DisplayError';
import RectPlot from './RectPlot';
import State from './State';

class LabeledScatter {

  getResizeDelayPromise() {
    if (_.isNull(this.resizeDelayPromise)) {
      this.resizeDelayPromise = new Promise((function () {
        return setTimeout(() => {
          console.log('rhtmlLabeledScatter: resize timeout');

          const resizeParams = this.resizeStack.pop();
          const el = resizeParams[0];
          const width = resizeParams[1];
          const height = resizeParams[2];
          this.resizeStack = [];

          this.width = width;
          this.height = height;
          d3.select('.plot-container').remove();
          const svg = d3.select(el)
                  .append('svg')
                  .attr('width', this.width)
                  .attr('height', this.height)
                  .attr('class', 'plot-container');
          this.plot.setDim(svg, this.width, this.height);
          this.plot.draw();
          this.resizeDelayPromise = null;
        }
        , 500);
      }.bind(this)));
    }

    return this.resizeDelayPromise;
  }

  constructor(width, height, stateChangedCallback) {
    this.width = width;
    this.height = height;
    this.stateChangedCallback = stateChangedCallback;
    this.resizeStack = [];
    this.resizeDelayPromise = null;
  }

  resize(el, width, height) {
    this.resizeStack.push([el, width, height]);
    return this.getResizeDelayPromise();
  }

  draw(data, el, state) {
    // Reset widget if previous data present - see VIS-278
    if (!(_.isUndefined(this.data))) {
      throw new Error('rhtmlLabeledScatter reset');
    }
    const svg = d3.select(el)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'plot-container');

    if (!(_.isNull(data.X)) && !(_.isNull(data.Y))) {
      this.data = data;
    }

    // Error checking
    DisplayError.checkIfArrayOfNums(this.data.X, el, 'Given X value is not an array of numbers');
    DisplayError.checkIfArrayOfNums(this.data.Y, el, 'Given Y value is not an array of numbers');

    const stateObj = new State(state, this.stateChangedCallback, this.data.X, this.data.Y, this.data.label);

    this.plot = new RectPlot(stateObj,
                        this.width,
                        this.height,
                        this.data.X,
                        this.data.Y,
                        this.data.Z,
                        this.data.group,
                        this.data.label,
                        this.data.labelAlt,
                        svg,
                        this.data.fixedAspectRatio,
                        this.data.xTitle,
                        this.data.yTitle,
                        this.data.zTitle,
                        this.data.title,
                        this.data.colors,
                        this.data.transparency,
                        this.data.grid,
                        this.data.origin,
                        this.data.originAlign,
                        this.data.titleFontFamily,
                        this.data.titleFontSize,
                        this.data.titleFontColor,
                        this.data.xTitleFontFamily,
                        this.data.xTitleFontSize,
                        this.data.xTitleFontColor,
                        this.data.yTitleFontFamily,
                        this.data.yTitleFontSize,
                        this.data.yTitleFontColor,
                        this.data.showLabels,
                        this.data.labelsFontFamily,
                        this.data.labelsFontSize,
                        this.data.labelsFontColor,
                        this.data.labelsLogoScale,
                        this.data.xDecimals,
                        this.data.yDecimals,
                        this.data.zDecimals,
                        this.data.xPrefix,
                        this.data.yPrefix,
                        this.data.zPrefix,
                        this.data.xSuffix,
                        this.data.ySuffix,
                        this.data.zSuffix,
                        this.data.legendShow,
                        this.data.legendBubblesShow,
                        this.data.legendFontFamily,
                        this.data.legendFontSize,
                        this.data.legendFontColor,
                        this.data.axisFontFamily,
                        this.data.axisFontColor,
                        this.data.axisFontSize,
                        this.data.pointRadius,
                        this.data.xBoundsMinimum,
                        this.data.xBoundsMaximum,
                        this.data.yBoundsMinimum,
                        this.data.yBoundsMaximum,
                        this.data.xBoundsUnitsMajor,
                        this.data.yBoundsUnitsMajor,
                        this.data.trendLines,
                        this.data.trendLinesLineThickness,
                        this.data.trendLinesPointSize,
                        this.data.plotBorderShow,
    );
    this.plot.draw();
    return this;
  }
}

module.exports = LabeledScatter;
