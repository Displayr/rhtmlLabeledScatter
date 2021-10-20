import _ from 'lodash'
import md5 from 'md5'
import autoBind from 'es6-autobind'

class TrendLine {
  constructor (pts, labs) {
    autoBind(this)
    this.pts = pts
    this.labs = labs
    this.linePts = {}
    this.arrowheadLabels = {}
    this.groupToLabel = {}
    this.lastPtPadding = 5

    _.map(this.pts, (pt, i) => {
      if (this.linePts[pt.group] == null) {
        this.linePts[pt.group] = []
      }

      if ((this.groupToLabel[pt.group] == null) || (this.arrowheadLabels[pt.group] == null)) {
        this.groupToLabel[pt.group] = this.labs[i]
        this.arrowheadLabels[pt.group] = this.labs[i]
      }

      this.linePts[pt.group].push({
        x: pt.x,
        y: pt.y,
        z: pt.r,
        r: pt.r,
        id: pt.id,
      })
    })

    this._increasePaddingAroundLastPtArrow()
    this.groups = _.keys(this.linePts)
    this._createLineArrays()
  }

  _increasePaddingAroundLastPtArrow () {
    _.map(this.linePts, (groupPts, groupName) => {
      if (groupPts.length > 1) {
        let lastPtInGroupId = _.last(this.linePts[groupName]).id
        let lastPt = _.find(this.pts, (p) => p.id === lastPtInGroupId)
        lastPt.r = lastPt.r + this.lastPtPadding
      }
    })
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
          this.arrowheadLabels[groupName].x = groupPts[1].x
          this.arrowheadLabels[groupName].y = groupPts[1].y - groupPts[1].r - 5 // TODO: make this padding configurable
          this.arrowheadLabels[groupName].id = groupPts[1].id
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
              this.linesMapped[groupName][i + 1].y,
            ])
            i += 2
          }

          const lastLinePt = _.last(this.linesMapped[groupName])
          this.arrowheadPts.push(lastLinePt)

          this.arrowheadLabels[groupName].r = lastLinePt.r
          this.arrowheadLabels[groupName].x = lastLinePt.x
          this.arrowheadLabels[groupName].y = lastLinePt.y - lastLinePt.r - 5 // TODO: make this padding configurable
          this.arrowheadLabels[groupName].id = lastLinePt.id
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

  getTextLabels () {
    return _.filter(this.arrowheadLabels, l => l.url === '')
  }

  getImgLabels () {
    return _.filter(this.arrowheadLabels, l => l.url !== '')
  }

  drawWith (svg, plotColors, trendLines) {
    _.map(this.getUniqueGroups(), (group) => {
      // Need new groupName because CSS ids cannot contain spaces and maintain uniqueness
      const cssGroupName = md5(group)
      const cssArrowheadName = md5(group + plotColors.getColorFromGroup(group))

      // Arrowhead marker
      svg.selectAll(`#trendline-arrowhead-${cssArrowheadName}`).remove()
      svg.append('svg:defs').append('svg:marker')
         .attr('id', `trendline-arrowhead-${cssArrowheadName}`)
         .attr('refX', 6)
         .attr('refY', 6)
         .attr('markerWidth', 30)
         .attr('markerHeight', 30)
         .attr('orient', 'auto')
         .append('path')
         .attr('d', 'M 0 0 12 6 0 12 3 6')
         .style('fill', plotColors.getColorFromGroup(group))

      svg.selectAll(`.trendline-${cssGroupName}`).remove()
      svg.selectAll(`.trendline-${cssGroupName}`)
         .data(this.getLineArray(group))
         .enter()
         .append('line')
         .attr('class', `trendline-${cssGroupName}`)
         .attr('x1', d => d[0])
         .attr('y1', d => d[1])
         .attr('x2', d => d[2])
         .attr('y2', d => d[3])
         .attr('stroke', plotColors.getColorFromGroup(group))
         .attr('stroke-width', trendLines.lineThickness)
         .attr('marker-end', (d, i) => {
           // Draw arrowhead on last element in trendline
           if (i === ((this.getLineArray(group)).length - 1)) {
             return `url(#trendline-arrowhead-${cssArrowheadName})`
           }
         })
    })
  }

  drawLabelsWith (pltId, svg, drag) {
    svg.selectAll(`.plt-${pltId}-lab`).remove()
    svg.selectAll(`.plt-${pltId}-lab`)
       .data(this.getTextLabels())
       .enter()
       .append('text')
       .attr('class', `plt-${pltId}-lab`)
       .attr('id', d => d.id)
       .attr('x', d => d.x)
       .attr('y', d => d.y)
       .attr('font-family', d => d.fontFamily)
       .text(d => d.text)
       .attr('text-anchor', 'middle')
       .attr('fill', d => d.color)
       .attr('font-size', d => d.fontSize)
       .call(drag)
  }

  drawImageLabelsWith (pltId, svg, drag) {
    svg.selectAll(`.plt-${pltId}-lab-img`).remove()
    svg.selectAll(`.plt-${pltId}-lab-img`)
       .data(this.getImgLabels())
       .enter()
       .append('svg:image')
       .attr('class', `plt-${pltId}-lab-img`)
       .attr('xlink:href', d => d.url)
       .attr('id', d => d.id)
       .attr('x', d => d.x - (d.width / 2))
       .attr('y', d => d.y - d.height)
       .attr('width', d => d.width)
       .attr('height', d => d.height)
       .call(drag)
  }
}

module.exports = TrendLine
