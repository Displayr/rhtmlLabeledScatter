import _ from 'lodash'

class LabelArraySorter {
  constructor (labelArray) {
    this.labelArray = labelArray
    this.generateSortedArrays()
  }

  getBoundaryFunction (name) {
    switch (name) {
      case 'left': return l => l.x - l.width / 2
      case 'right': return l => l.x + l.width / 2
      case 'top': return l => l.y - l.height
      case 'bot': return l => l.y
      default: return null
    }
  }

  getBoundaryCheckFunction (name) {
    function left (l) { return l.x - l.width / 2 }
    function right (l) { return l.x + l.width / 2 }
    function top (l) { return l.y - l.height }
    function bot (l) { return l.y }
    switch (name) {
      case 'left':
        return (l1, l2) => left(l1) < right(l2) && left(l1) > left(l2)
      case 'right':
        return (l1, l2) => right(l1) < left(l2) && right(l1) < left(l2)
      case 'top':
        return (l1, l2) => top(l1) < bot(l2) && top(l1) < top(l2)
      case 'bot':
        return (l1, l2) => bot(l1) > top(l2) && bot(l1) < bot(l2)
    }
  }

  // Creates the sorted arrays by left, right, top, bot boundaries
  generateSortedArrays () {
    this.sortedArrays = {
      'left': _.sortBy(this.labelArray, this.getBoundaryFunction('left')),
      'right': _.sortBy(this.labelArray, this.getBoundaryFunction('right')),
      'top': _.sortBy(this.labelArray, this.getBoundaryFunction('top')),
      'bot': _.sortBy(this.labelArray, this.getBoundaryFunction('bot'))
    }
  }

  // Re-sorts existing arrays after a label is moved
  sortArrays () {
    this.sortedArrays.left = _.sortBy(this.sortedArrays.left, this.getBoundaryFunction('left'))
    this.sortedArrays.right = _.sortBy(this.sortedArrays.right, this.getBoundaryFunction('right'))
    this.sortedArrays.top = _.sortBy(this.sortedArrays.top, this.getBoundaryFunction('top'))
    this.sortedArrays.bot = _.sortBy(this.sortedArrays.bot, this.getBoundaryFunction('bot'))
  }

  getOverlappingLabelsWithLabelId (id) {
    // Returns a list of overlapping arrays for energy penalty calculation
    let overlappingLabels = []

    // Recursively look in either direction of the sorted arrays for any collisions
    _.map(this.sortedArrays, (sortedArray, sortedArrayKey) => {
      const labelIndexInSortedArray = _.findIndex(sortedArray, (label) => { return label.id === id })
      const isBoundaryOverlapping = this.getBoundaryCheckFunction(sortedArrayKey)

      function recursiveDirectionalBoundaryCheck (accumlatedLabs, sortedArr, index, direction, boundaryCheckFunction) {
        let nextIndex = index
        if (direction === 'left' && nextIndex > 0) {
          nextIndex--
        } else if (direction === 'right' && nextIndex < sortedArr.length - 1) {
          nextIndex++
        } else {
          return
        }
        if (boundaryCheckFunction(sortedArr[index], sortedArr[nextIndex])) {
          accumlatedLabs.push(sortedArr[nextIndex])
          recursiveDirectionalBoundaryCheck(accumlatedLabs, sortedArr, nextIndex, direction, boundaryCheckFunction)
        }
      }
      recursiveDirectionalBoundaryCheck(overlappingLabels, sortedArray, labelIndexInSortedArray, 'left', isBoundaryOverlapping)
      recursiveDirectionalBoundaryCheck(overlappingLabels, sortedArray, labelIndexInSortedArray, 'right', isBoundaryOverlapping)
    })

    // Result of recursive function contains duplicates, we want to filter for the labels that overlap in >2 directions
    const countsById = _.countBy(overlappingLabels, l => l.id)
    _.remove(overlappingLabels, l => {
      if (_.has(countsById, l.id)) {
        const frequencyOfOverlap = _.toNumber(countsById[l.id])
        if (frequencyOfOverlap < 2) {
          return true
        }
      }
    })
    overlappingLabels = _.uniqBy(overlappingLabels, l => l.id)
    return overlappingLabels
  }
}

module.exports = LabelArraySorter
