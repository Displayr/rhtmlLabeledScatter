import labeler from './labeler'

// x/y from center
const getLabel = ({ w = 2, h = 2, x = 10, y = 10 } = {}) => ({
  width: w,
  height: h,
  minX: x - w / 2,
  maxX: x + w / 2,
  minY: y - h,
  maxY: y,
  adjustedHeight: h * 0.6,
  adjustedMinY: y - h * 0.6,
})

const getAnchor = ({ r = 2, x = 10, y = 10 } = {}) => ({
  r,
  x,
  y,
  minX: x - r,
  maxX: x + r,
  minY: y - r,
  maxY: y + r,
})

const basicBehaviourTestConfig = {
  anchor: getAnchor({ r: 2, x: 10, y: 10 }),
  labelPositionsAndExpectations: [
    ['centerBottomDistance', getLabel({ x: 10, y: 5 })],
    ['centerTopDistance', getLabel({ x: 10, y: 15 })],
    ['leftCenterDistance', getLabel({ x: 15, y: 10 })],
    ['rightCenterDistance', getLabel({ x: 5, y: 10 })],
    ['leftTopDistance', getLabel({ x: 15, y: 15 })],
    ['rightBottomDistance', getLabel({ x: 5, y: 5 })],
    ['rightTopDistance', getLabel({ x: 5, y: 15 })],
    ['leftBottomDistance', getLabel({ x: 15, y: 5 })],
  ],
}

describe('chooseBestLeaderLine:', () => {
  test.each(basicBehaviourTestConfig.labelPositionsAndExpectations)(`%#: %s`, (chosenPosition, label) => {
    const option = labeler()
      .chooseBestLeaderLine(label, basicBehaviourTestConfig.anchor)

    expect(option.name).toBe(chosenPosition)
  })
})
