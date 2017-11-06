// Interface for AnchorArraySorter and LabelArraySorter

class ArraySorter {
  getBoundaryCheckFunction (name) {
    const left = this.getBoundaryFunction('left')
    const right = this.getBoundaryFunction('right')
    const top = this.getBoundaryFunction('top')
    const bot = this.getBoundaryFunction('bot')
    switch (name) {
      case 'left':
        return (l1, l2) => left(l1) <= left(l2) && right(l1) >= left(l2)
      case 'right':
        return (l1, l2) => left(l1) <= right(l2) && right(l1) >= right(l2)
      case 'top':
        return (l1, l2) => top(l1) <= top(l2) && bot(l1) >= top(l2)
      case 'bot':
        return (l1, l2) => top(l1) <= bot(l2) && bot(l1) >= bot(l2)
    }
  }

  getBoundaryFunction () {}

  recursiveDirectionalBoundaryCheck (accumlatedLabs, sortedArr, labelBeingCheckedIndex, index, direction, boundaryCheckFunction) {
    let nextIndex = index
    if (nextIndex > 0 && nextIndex <= sortedArr.length - 2) {
      if (direction === 'left') {
        nextIndex--
      } else if (direction === 'right') {
        nextIndex++
      }
    } else {
      return
    }
    if (boundaryCheckFunction(sortedArr[labelBeingCheckedIndex], sortedArr[nextIndex])) {
      accumlatedLabs.push(sortedArr[nextIndex])
      this.recursiveDirectionalBoundaryCheck(accumlatedLabs, sortedArr, labelBeingCheckedIndex, nextIndex, direction, boundaryCheckFunction)
    }
  }
}

module.exports = ArraySorter
