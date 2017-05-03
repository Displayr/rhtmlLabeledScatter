const _ = require('lodash');
const AxisUtils = require('./AxisUtils.js');

/*
 * * not testing leaderlines as I suspect we can merge them with the labels and figure them out at presentation time
 */

describe('AxisUtils:', function () {
  describe('getAxisDataArrays()', function () {
    beforeEach(function () {
      this.defaultPlot = {
        axisLeaderLineLength: 5,
        axisDimensionText: {
          rowMaxHeight: 10,
          colMaxHeight: 10,
        },
        xBoundsUnitsMajor: 2,
        yBoundsUnitsMajor: 2,
      };

      this.defaultViewBox = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };

      this.defaultData = {
        len: 1,
        calculateMinMax: _.noop,
        minX: -5,
        maxX: 5,
        minY: -5,
        maxY: 5,
      };

      this.compute = ({ plot = this.defaultPlot, data = this.defaultData, viewBox = this.defaultViewBox } = {}) => {
        // TODO KZ remove this duplicate dependency bug (see normalizeXCoords and normalizeYCoords)
        data.viewBoxDim = viewBox;
        this.result = AxisUtils.getAxisDataArrays(plot, data, viewBox);
      };
    });

    describe('Grid Origins', function () {
      describe('grid origin calculations with balanced grid', function () {
        it('places a x and y axis down the middle of the grid', function () {
          this.compute();
          expect(this.result.gridOrigin).to.deep.equal([
            { x1: 0, y1: 50, x2: 100, y2: 50 },
            { x1: 50, y1: 0, x2: 50, y2: 100 },
          ]);
        });
      });

      describe('grid origin calculations with off center grid', function () {
        it('places a x and y axis off the cetnre based on the x and y range', function () {
          this.compute({ data: _.merge({}, this.defaultData, { minX: -15, maxX: 5, minY: -15, maxY: 5 }) });
          expect(this.result.gridOrigin).to.deep.equal([
            { x1: 0, y1: 25, x2: 100, y2: 25 },
            { x1: 75, y1: 0, x2: 75, y2: 100 },
          ]);
        });
      });

      describe('grid origin calculations with no origin present on grid', function () {
        it('places a x and y axis off the cetnre based on the x and y range', function () {
          this.compute({ data: _.merge({}, this.defaultData, { minX: -15, maxX: -5, minY: -15, maxY: -5 }) });
          expect(this.result.gridOrigin).to.deep.equal([]);
        });
      });
    });

    describe('Grid Lines and Legend Markers', function () {
      describe('Simple all positive one quadrant grid', function() {
        beforeEach(function () {
          this.compute({
            data: _.merge({}, this.defaultData, { minX: 0, maxX: 10, minY: 0, maxY: 10 }),
            plot: _.merge({}, this.defaultPlot, {
              axisLeaderLineLength: 5,
              xBoundsUnitsMajor: 5,
              yBoundsUnitsMajor: 5,
            }),
          });
        });

        it('should compute 6 gridlines', function () {
          expect(this.result.gridLines.length).to.equal(6); // X: 0, 5, 10, Y: 0, 5, 10
        });

        it('should compute gridlines at 0, 5, and 10', function () {
          expect(this.result.gridLines[0], 'gridline[0] is wrong').to.deep.equal({ x1: 25, y1: 0, x2: 25, y2: 100 });
          expect(this.result.gridLines[1], 'gridline[1] is wrong').to.deep.equal({ x1: 50, y1: 0, x2: 50, y2: 100 });
          expect(this.result.gridLines[2], 'gridline[2] is wrong').to.deep.equal({ x1: 75, y1: 0, x2: 75, y2: 100 });
          expect(this.result.gridLines[3], 'gridline[3] is wrong').to.deep.equal({ x1: 0, y1: 75, x2: 100, y2: 75 });
          expect(this.result.gridLines[4], 'gridline[4] is wrong').to.deep.equal({ x1: 0, y1: 50, x2: 100, y2: 50 });
          expect(this.result.gridLines[5], 'gridline[5] is wrong').to.deep.equal({ x1: 0, y1: 25, x2: 100, y2: 25 });
        });

        it('should compute 4 axis markers lines', function () {
          expect(this.result.axisLeader.length).to.equal(4);
        });

        it('should compute 4 axis markers lines', function () {
          expect(this.result.axisLeaderLabel).to.deep.equal([
            { x: -5, y: 103.33333333333333, label: '0', anchor: 'end', type: 'row' },
            { x: 0, y: 115, label: '0', anchor: 'middle', type: 'col' },
            { x: 50, y: 115, label: '5', anchor: 'middle', type: 'col' },
            { x: -5, y: 53.333333333333336, label: '5', anchor: 'end', type: 'row' }
          ]);
        });
      });

      describe('Four quadrant off center grid', function() {
        beforeEach(function () {
          this.compute({
            data: _.merge({}, this.defaultData, { minX: -7, maxX: 3, minY: 1, maxY: 1 }),
            plot: _.merge({}, this.defaultPlot, {
              axisLeaderLineLength: 5,
              xBoundsUnitsMajor: 3,
              yBoundsUnitsMajor: 3,
            }),
          });
        });

        it('should compute 6 gridlines', function () {
          expect(this.result.gridLines.length).to.equal(5);
        });

        it('should compute gridlines', function () {
          expect(this.result.gridLines[0],'gridLine[0] is wrong').to.deep.equal({x1: 85, y1: 0, x2: 85, y2: 100}); // 1.5
          expect(this.result.gridLines[1],'gridLine[1] is wrong').to.deep.equal({x1: 55.00000000000001, y1: 0, x2: 55.00000000000001, y2: 100}); // -1.5
          expect(this.result.gridLines[2],'gridLine[2] is wrong').to.deep.equal({x1: 40, y1: 0, x2: 40, y2: 100}); // -3
          expect(this.result.gridLines[3],'gridLine[3] is wrong').to.deep.equal({x1: 25, y1: 0, x2: 25, y2: 100}); // -4.5
          expect(this.result.gridLines[4],'gridLine[4] is wrong').to.deep.equal({x1: 10, y1: 0, x2: 10, y2: 100}); // -6
        });

        it('should compute 4 axis markers lines', function () {
          expect(this.result.axisLeaderLabel).to.deep.equal([
            { x: 70, y: 115, label: '0', anchor: 'middle', type: 'col' },
            { x: 40, y: 115, label: '-3', anchor: 'middle', type: 'col' },
            { x: 10, y: 115, label: '-6', anchor: 'middle', type: 'col' }
          ]);
        });
      });

      // KZ TODO complete
      // describe('One quadrant no origin intersection'
    });
  });
});
