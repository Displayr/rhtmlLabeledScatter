// This was an implementation to mirror LabelArraySorter
// However, testing has found that there is a significant computational penalty when implemented
// Therefor it is currently being bypassed

import _ from 'lodash'
import ArraySorter from './ArraySorter'

class AnchorArraySorter extends ArraySorter {
  constructor (anchorArray, labelArray) {
    super()
    this.labelArray = labelArray
    this.anchorArray = anchorArray
    this.generateSortedArrays()
  }

  getAncBoundaryFunction (name) {
    switch (name) {
      case 'left': return l => l.x - l.r
      case 'right': return l => l.x + l.r
      case 'top': return l => l.y - l.r
      case 'bot': return l => l.y + l.r
      default: return null
    }
  }

  getBoundaryFunction (name) {
    switch (name) {
      case 'left':
        return l => {
          if (_.has(l, 'r')) {
            return l.x - l.r
          } else {
            return l.x - l.width / 2
          }
        }
      case 'right':
        return l => {
          if (_.has(l, 'r')) {
            return l.x + l.r
          } else {
            return l.x + l.width / 2
          }
        }
      case 'top':
        return l => {
          if (_.has(l, 'r')) {
            return l.y - l.r
          } else {
            return l.y - l.height
          }
        }
      case 'bot':
        return l => {
          if (_.has(l, 'r')) {
            return l.y + l.r
          } else {
            return l.y
          }
        }
      default: return null
    }
  }

  generateSortedArrays () {
    this.sortedArrays = {
      'left': _.sortBy(this.anchorArray, this.getAncBoundaryFunction('left')),
      'right': _.sortBy(this.anchorArray, this.getAncBoundaryFunction('right')),
      'top': _.sortBy(this.anchorArray, this.getAncBoundaryFunction('top')),
      'bot': _.sortBy(this.anchorArray, this.getAncBoundaryFunction('bot')),
    }
  }

  insertIntoSortedArray (givenArray, itemToInsert, functionThatReturnsValueToSortBy) {
    _.every(givenArray, (o, i) => {
      if (functionThatReturnsValueToSortBy(itemToInsert, o)) {
        return false
      }
      givenArray.splice(i, 0, itemToInsert)
      return true
    })
  }

  getOverlappingAnchorsWithLabelId (labelId) {
    let overlappingAnchors = []
    const labelSelected = _.find(this.labelArray, l => l.id === labelId)

    // Recursively look in either direction of the sorted arrays for any collisions
    _.map(this.sortedArrays, (sortedArray, sortedArrayKey) => {
      // Insert the label into the sorted array
      this.insertIntoSortedArray(sortedArray, labelSelected, this.getBoundaryCheckFunction(sortedArrayKey))
      const isBoundaryOverlapping = this.getBoundaryCheckFunction(sortedArrayKey)

      // Get index of label inserted into sorted anchor array
      const labelIndexInSortedArray = _.findIndex(sortedArray, (o) => { return o.id === labelId })

      this.recursiveDirectionalBoundaryCheck(overlappingAnchors, sortedArray, labelIndexInSortedArray, labelIndexInSortedArray, 'left', isBoundaryOverlapping)
      this.recursiveDirectionalBoundaryCheck(overlappingAnchors, sortedArray, labelIndexInSortedArray, labelIndexInSortedArray, 'right', isBoundaryOverlapping)
    })

    // Result of recursive function contains duplicates, we want to filter for the anchors that overlap in >2 directions
    const countsById = _.countBy(overlappingAnchors, o => o.id)
    _.remove(overlappingAnchors, o => {
      if (_.has(countsById, o.id)) {
        const frequencyOfOverlap = _.toNumber(countsById[o.id])
        if (frequencyOfOverlap < 2) {
          return true
        }
      }
    })

    // remove the label from the sorted anchor arrays
    _.map(this.sortedArrays, (sortedArray, sortedArrayKey) => _.remove(sortedArray, (o) => (!_.has(o, 'r') && o.id === labelId)))

    overlappingAnchors = _.uniqBy(overlappingAnchors, a => a.id)
    // console.log('overlap')
    // console.log(labelSelected.text)
    // console.log(labelSelected)
    // console.log(overlappingAnchors)
    return overlappingAnchors
  }
}

module.exports = AnchorArraySorter
