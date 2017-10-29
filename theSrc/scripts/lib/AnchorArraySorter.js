import LabelArraySorter from './LabelArraySorter'

class AnchorArraySorter extends LabelArraySorter {
  // override
  constructor (anc, lab) {
    super(anc)
    this.lab = lab
  }

  // override
  getBoundaryFunction (name) {
    switch (name) {
      case 'left': return l => l.x - l.r
      case 'right': return l => l.x + l.r
      case 'top': return l => l.y - l.r
      case 'bot': return l => l.y + l.r
      default: return null
    }
  }

  getOverlappingAnchorsWithAnchorId (id) {
    super.getOverlappingLabelsWithLabelId(id)
  }
}

module.exports = AnchorArraySorter
