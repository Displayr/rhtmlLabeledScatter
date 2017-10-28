import _ from 'lodash'

class LabelArraySorter {
  constructor (labelArray) {
    this.labelArray = labelArray
  }

  generateSortedArrays () {
    this.labelArraySortedByXleft = _.sortBy(this.labelArray, (l) => l.x - l.width / 2)
    this.labelArraySortedByXright = _.sortBy(this.labelArray, (l) => l.x + l.width / 2)
    this.labelArraySortedByYtop = _.sortBy(this.labelArray, (l) => l.y - l.height)
    this.labelArraySortedByYbot = _.sortBy(this.labelArray, (l) => l.y)
  }

  getOverlappingLabelsWithLabelId (id) {
    // s
  }
}

module.exports = LabelArraySorter
