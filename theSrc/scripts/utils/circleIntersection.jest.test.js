const areaOfIntersection = require('./circleIntersection')

const tests = [
  {
    name: 'intersection a NW of b / b SE of a',
    a: { x: 4, y: 4, r: 2 },
    b: { x: 5, y: 5, r: 2 },
    expect: {
      intersect: true,
      overlap: 7.029,

    },
  },
  {
    name: 'intersection a NE of b / b SW of a',
    a: { x: 6, y: 4, r: 2 },
    b: { x: 5, y: 5, r: 2 },
    expect: {
      intersect: true,
      overlap: 7.029,

    },
  },
  {
    name: 'intersection a W of b / b E of a',
    a: { x: 4, y: 6, r: 2 },
    b: { x: 5, y: 6, r: 2 },
    expect: {
      intersect: true,
      overlap: 8.608,

    },
  },
  {
    name: 'intersection a N of b / b S of a',
    a: { x: 6, y: 4, r: 2 },
    b: { x: 6, y: 5, r: 2 },
    expect: {
      intersect: true,
      overlap: 8.608,

    },
  },
  {
    name: 'touching w no intersection',
    a: { x: 4, y: 4, r: 2 },
    b: { x: 8, y: 4, r: 2 },
    expect: {
      intersect: false,
    },
  },
  {
    name: 'no intersection',
    a: { x: 4, y: 4, r: 2 },
    b: { x: 8, y: 8, r: 2 },
    expect: {
      intersect: false,
    },
  },
  {
    name: 'identical',
    a: { x: 4, y: 4, r: 2 },
    b: { x: 4, y: 4, r: 2 },
    expect: {
      intersect: true,
      overlap: Math.PI * 2 * 2,
    },
  },
  {
    name: 'subset',
    a: { x: 4, y: 4, r: 2 },
    b: { x: 4, y: 4, r: 1 },
    expect: {
      intersect: true,
      overlap: Math.PI,
    },
  },

].map(testConfig => [testConfig.name, testConfig])

test.each(tests)(`%#: %s`, (testName, testConfig) => {
  const result = areaOfIntersection(testConfig.a, testConfig.b)
  const symmetricResult = areaOfIntersection(testConfig.b, testConfig.a)
  if (testConfig.expect.intersect) {
    expect(result).toBeGreaterThan(0)
    expect(symmetricResult).toBeGreaterThan(0)
  } else {
    expect(result).toEqual(0)
    expect(symmetricResult).toEqual(0)
  }

  if (testConfig.expect.overlap) {
    expect(result).toBeCloseTo(testConfig.expect.overlap)
    expect(symmetricResult).toBeCloseTo(testConfig.expect.overlap)
  }
})
