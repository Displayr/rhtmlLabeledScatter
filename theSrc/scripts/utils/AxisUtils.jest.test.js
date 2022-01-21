const _ = require('lodash')
const AxisUtils = require('./AxisUtils.js')
const DataTypeEnum = require('./DataTypeEnum.js')

/*
 * * not testing leaderlines as I suspect we can merge them with the labels and figure them out at presentation time
 */

describe('AxisUtils:', function () {
  describe('getAxisDataArrays()', function () {
    describe('Grid Origins', function () {
      describe('grid origin calculations with balanced grid', function () {
        it('places a x and y axis down the middle of the grid', function () {
          const result = compute()
          expect(result.gridOrigin).toEqual([
            { x1: 50, y1: 0, x2: 50, y2: 100 },
            { x1: 0, y1: 50, x2: 100, y2: 50 },
          ])
        })
      })

      describe('grid origin calculations with off center grid', function () {
        it('places a x and y axis off the cetnre based on the x and y range', function () {
          const result = compute({ data: _.merge({}, defaultData, { minX: -15, maxX: 5, minY: -15, maxY: 5 }) })
          expect(result.gridOrigin).toEqual([
            { x1: 75, y1: 0, x2: 75, y2: 100 },
            { x1: 0, y1: 25, x2: 100, y2: 25 },
          ])
        })
      })

      describe('grid origin calculations with no origin present on grid', function () {
        it('places a x and y axis off the cetnre based on the x and y range', function () {
          const result = compute({ data: _.merge({}, defaultData, { minX: -15, maxX: -5, minY: -15, maxY: -5 }) })
          expect(result.gridOrigin).toEqual([])
        })
      })
    })

    describe('Grid Lines and Legend Markers', function () {
      describe('Simple all positive one quadrant grid', function () {
        const getResult = () => compute({
          data: _.merge({}, defaultData, { minX: 0, maxX: 10, minY: 0, maxY: 10 }),
          axisSettings: _.merge({}, defaultAxisSettings, {
            x: {
              boundsUnitsMajor: 5,
            },
            y: {
              boundsUnitsMajor: 5,
            },
          }),
        })

        it('should compute 2 gridlines', function () {
          expect(getResult().gridLines.length).toEqual(2)
        })

        it('should compute gridlines at 5', function () {
          expect(getResult().gridLines[0]).toEqual({ x1: 50, y1: 0, x2: 50, y2: 100 })
          expect(getResult().gridLines[1]).toEqual({ x1: 0, y1: 50, x2: 100, y2: 50 })
        })

        it('should compute 4 axis leaders', function () {
          expect(getResult().axisLeader.length).toEqual(4)
        })

        it('should compute 4 axis leaders', function () {
          expect(getResult().axisLeaderLabel).toEqual([
            { x: 0, y: 115, label: '0.0', anchor: 'middle', type: 'x' },
            { x: 50, y: 115, label: '5.0', anchor: 'middle', type: 'x' },
            { x: -5, y: 103.33333333333333, label: '0.0', anchor: 'end', type: 'y' },
            { x: -5, y: 53.333333333333336, label: '5.0', anchor: 'end', type: 'y' },
          ])
        })
      })

      describe('Four quadrant off center grid', function () {
        const getResult = () => compute({
          data: _.merge({}, defaultData, { minX: -7, maxX: 3, minY: 1, maxY: 1 }),
          axisSettings: _.merge({}, defaultAxisSettings, {
            x: {
              boundsUnitsMajor: 3,
            },
            y: {
              boundsUnitsMajor: 3,
            },
          }),
        })

        it('should compute 2 gridlines', function () {
          expect(getResult().gridLines.length).toEqual(2)
        })

        it('should compute gridlines', function () {
          expect(getResult().gridLines[0]).toEqual({ x1: 10, y1: 0, x2: 10, y2: 100 }) // -6
          expect(getResult().gridLines[1]).toEqual({ x1: 40, y1: 0, x2: 40, y2: 100 }) // -3
        })

        it('should compute 3 axis markers lines', function () {
          expect(getResult().axisLeaderLabel).toEqual([
            { x: 10, y: 115, label: '-6.0', anchor: 'middle', type: 'x' },
            { x: 40, y: 115, label: '-3.0', anchor: 'middle', type: 'x' },
            { x: 70, y: 115, label: '0.0', anchor: 'middle', type: 'x' },
          ])
        })
      })

      // KZ TODO complete
      // describe('One quadrant no origin intersection'
    })
  })
})

const defaultViewBox = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
}

const defaultData = {
  len: 1,
  calculateMinMax: _.noop,
  calculateOrdinalPaddingProportions: _.noop,
  minX: -5,
  maxX: 5,
  minY: -5,
  maxY: 5,
  xDataType: DataTypeEnum.numeric,
  yDataType: DataTypeEnum.numeric,
}

const defaultAxisSettings = {
  showX: true,
  showY: true,
  leaderLineLength: 5,
  x: {
    format: null,
    boundsUnitsMajor: 2,
    decimals: 1,
  },
  y: {
    format: null,
    boundsUnitsMajor: 2,
    decimals: 1,
  },
  z: {
    decimals: null,
  },
  textDimensions: {
    rowMaxHeight: 10,
    colMaxHeight: 10,
  },
}

const compute = ({ data = defaultData, vb = defaultViewBox, axisSettings = defaultAxisSettings } = {}) => {
  // TODO KZ remove this duplicate dependency bug (see normalizeXCoords and normalizeYCoords)
  data.vb = vb
  return AxisUtils.getAxisDataArrays(data, vb, axisSettings)
}
