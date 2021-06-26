const _ = require('lodash')
const Utils = require('./Utils.js')

describe('Utils:', function () {
  describe('isNum():', function () {
    const tests = [
      { input: 4, expected: true },
      { input: '4', expected: false },
      { input: ['4'], expected: false },
      { input: undefined, expected: false },
      { input: null, expected: false },
    ]

    _(tests).each((t) => {
      it(`Utils.isNum(${t.input} (${typeof t.input})) is ${t.expected}`, function () {
        expect(Utils.isNum(t.input)).toEqual(t.expected)
      })
    })
  })

  describe('isArr():', function () {
    const tests = [
      { input: 4, expected: false },
      { input: '4', expected: false },
      { input: ['4'], expected: true },
      { input: [4], expected: true },
      { input: undefined, expected: false },
      { input: null, expected: false },
    ]

    _(tests).each((t) => {
      it(`Utils.isArr(${t.input} (${typeof t.input})) is ${t.expected}`, function () {
        expect(Utils.isArr(t.input)).toEqual(t.expected)
      })
    })
  })

  describe('isArrOfNums():', function () {
    const tests = [
      { input: 4, expected: false },
      { input: '4', expected: false },
      { input: ['4'], expected: true },
      { input: [4], expected: true },
      { input: [4, 5], expected: true },
      { input: [4, 'a', 5], expected: false },
      { input: [4, '4.5', 5], expected: true },
      { input: [4.5, -5.5], expected: true },
      { input: undefined, expected: false },
      { input: null, expected: false },
    ]

    _(tests).each((t) => {
      it(`Utils.isArrOfNums(${t.input} (${typeof t.input})) is ${t.expected}`, function () {
        expect(Utils.isArrOfNums(t.input)).toEqual(t.expected)
      })
    })
  })

  describe('isArrOfPositiveNums():', function () {
    const tests = [
      { input: 4, expected: false },
      { input: '4', expected: false },
      { input: ['4'], expected: false },
      { input: [4], expected: true },
      { input: [4, 5], expected: true },
      { input: [4, 'a', 5], expected: false },
      { input: [4, '4.5', 5], expected: false },
      { input: [4.5, -5.5], expected: false },
      { input: [0, 1], expected: true },
      { input: undefined, expected: false },
      { input: null, expected: false },
    ]

    _(tests).each((t) => {
      it(`Utils.isArrOfPositiveNums(${t.input} (${typeof t.input})) is ${t.expected}`, function () {
        expect(Utils.isArrOfPositiveNums(t.input)).toEqual(t.expected)
      })
    })
  })

  describe('getFormattedNum(num, decimals, prefix, suffix):', function () {
    const tests = [
      { input: [1.234567, 2, 'p', 's'], expected: 'p1.23s' },
      { input: [1.234567, 2], expected: '1.23' },
      { input: [1.234567, 2, '', ''], expected: '1.23' },
      { input: [1.234567, 2, '$', ''], expected: '$1.23' },
    ]

    _(tests).each((t) => {
      it(`Utils.getFormattedNum(${t.input}) is ${t.expected}`, function () {
        expect(Utils.getFormattedNum.apply(null, t.input)).toEqual(t.expected)
      })
    })
  })

  describe('getSuperscript(id):', function () {
    const tests = [
      { input: 0, expected: '' }, // TODO this is a bug
      { input: 1, expected: '¹' },
      { input: 2, expected: '²' },
      { input: 3, expected: '³' },
      { input: 4, expected: '⁴' },
      { input: 5, expected: '⁵' },
      { input: 6, expected: '⁶' },
      { input: 7, expected: '⁷' },
      { input: 8, expected: '⁸' },
      { input: 9, expected: '⁹' },
      { input: 10, expected: '¹⁰' },
      { input: 11, expected: '¹¹' },
    ]

    _(tests).each((t) => {
      it(`Utils.getSuperscript(${t.input}) is ${t.expected}`, function () {
        expect(Utils.getSuperscript(t.input)).toEqual(t.expected)
      })
    })
  })
})
