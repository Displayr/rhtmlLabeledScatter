import _ from 'lodash'
import ArraySorter from './ArraySorter'

class LabelArraySorter extends ArraySorter {
  constructor (labelArray) {
    super()
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

  // Creates the sorted arrays by left, right, top, bot boundaries
  generateSortedArrays () {
    this.sortedArrays = {
      'left': _.sortBy(this.labelArray, this.getBoundaryFunction('left')),
      'right': _.sortBy(this.labelArray, this.getBoundaryFunction('right')),
      'top': _.sortBy(this.labelArray, this.getBoundaryFunction('top')),
      'bot': _.sortBy(this.labelArray, this.getBoundaryFunction('bot')),
    }
  }

  // Re-sorts existing arrays after a label is moved
  sortArrays () {
    this.sortedArrays.left = _.sortBy(this.sortedArrays.left, this.getBoundaryFunction('left'))
    this.sortedArrays.right = _.sortBy(this.sortedArrays.right, this.getBoundaryFunction('right'))
    this.sortedArrays.top = _.sortBy(this.sortedArrays.top, this.getBoundaryFunction('top'))
    this.sortedArrays.bot = _.sortBy(this.sortedArrays.bot, this.getBoundaryFunction('bot'))
  }

  // Returns a list of overlapping arrays for energy penalty calculation
  getOverlappingLabelsWithLabelId (id) {
    let overlappingLabels = []

    // Recursively look in either direction of the sorted arrays for any collisions
    _.map(this.sortedArrays, (sortedArray, sortedArrayKey) => {
      const labelIndexInSortedArray = _.findIndex(sortedArray, (label) => { return label.id === id })
      if (labelIndexInSortedArray !== -1) {
        const isBoundaryOverlapping = this.getBoundaryCheckFunction(sortedArrayKey)
        this.recursiveDirectionalBoundaryCheck(overlappingLabels, sortedArray, labelIndexInSortedArray, labelIndexInSortedArray, 'left', isBoundaryOverlapping)
        this.recursiveDirectionalBoundaryCheck(overlappingLabels, sortedArray, labelIndexInSortedArray, labelIndexInSortedArray, 'right', isBoundaryOverlapping)
      }
    })

    // Result of recursive function contains duplicates, we want to filter for the labels that overlap in >2 directions
    overlappingLabels = _.uniqBy(overlappingLabels, l => l.id)
    return overlappingLabels
  }
}

module.exports = LabelArraySorter
