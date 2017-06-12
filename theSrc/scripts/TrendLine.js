import _ from 'lodash'

class TrendLine {
  constructor (pts, labs) {
    this._createLineArrays = this._createLineArrays.bind(this)
    this.getLineArray = this.getLineArray.bind(this)
    this.getUniqueGroups = this.getUniqueGroups.bind(this)
    this.pts = pts
    this.labs = labs
    this.linePts = {}
    this.arrowheadLabels = {}
    this.groupToLabel = {}

    _.map(this.pts, (pt, i) => {
      if (this.linePts[pt.group] == null) {
        this.linePts[pt.group] = []
      }

      if ((this.groupToLabel[pt.group] == null) || (this.arrowheadLabels[pt.group] == null)) {
        this.groupToLabel[pt.group] = this.labs[i]
        this.arrowheadLabels[pt.group] = this.labs[i]
      }

      return this.linePts[pt.group].push({
        x: pt.x,
        y: pt.y,
        z: pt.r,
        r: pt.r
      })
    })

    this.groups = _.keys(this.linePts)

    this._createLineArrays()
  }

  _createLineArrays () {
    this.linesMapped = {}
    this.lines = {}
    this.arrowheadPts = []

    _.map(this.linePts, (groupPts, groupName) => {
      let i
      this.lines[groupName] = []
      this.linesMapped[groupName] = []

      switch (groupPts.length) {
        case 0:
          return
        case 1:
          this.arrowheadPts.push(groupPts[0])
          return
        case 2:
          this.lines[groupName] = [[groupPts[0].x, groupPts[0].y, groupPts[1].x, groupPts[1].y]]
          this.arrowheadPts.push(groupPts[1])

          this.arrowheadLabels[groupName].r = groupPts[1].r
          this.arrowheadLabels[groupName].x = groupPts[1].x - (this.arrowheadLabels[groupName].width / 2)
          this.arrowheadLabels[groupName].y = groupPts[1].y - (this.arrowheadLabels[groupName].height / 2)
          return
        default:
          // Adds another point for every "middle" point
          for (i = 0; i < groupPts.length; i++) {
            const pt = groupPts[i]
            this.linesMapped[groupName].push(pt)

            if ((i !== 0) && (i !== (groupPts.length - 1))) {
              this.linesMapped[groupName].push(pt)
            }
          }

          // Constructs the line array
          i = 0
          while (i < this.linesMapped[groupName].length) {
            this.lines[groupName].push([
              this.linesMapped[groupName][i].x,
              this.linesMapped[groupName][i].y,
              this.linesMapped[groupName][i + 1].x,
              this.linesMapped[groupName][i + 1].y
            ])
            i += 2
          }

          const lastLinePt = _.last(this.linesMapped[groupName])
          this.arrowheadPts.push(lastLinePt)

          this.arrowheadLabels[groupName].r = lastLinePt.r
          this.arrowheadLabels[groupName].x = lastLinePt.x - (this.arrowheadLabels[groupName].width / 2)
          this.arrowheadLabels[groupName].y = lastLinePt.y - (this.arrowheadLabels[groupName].height / 2)
      }
    })
    this.arrowheadLabels = _.values(this.arrowheadLabels)
    return this.lines
  }

  getLineArray (group) {
    if (this.lines == null) {
      this._createLineArrays()
    }

    return this.lines[group]
  }

  getUniqueGroups () {
    return this.groups
  }
}

module.exports = TrendLine
