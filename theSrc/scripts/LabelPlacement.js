
import labeler from './lib/labeler'
import SvgUtils from './utils/SvgUtils'
import _ from 'lodash'

class LabelPlacement {
  constructor (pltId, svg, vb, wDistance, wLabelLabelOverlap, wLabelAncOverlap, isBubble) {
    this.pltId = pltId
    this.svg = svg
    this.vb = vb
    this.wDistance = wDistance
    this.wLabelLabelOverlap = wLabelLabelOverlap
    this.wLabelAncOverlap = wLabelAncOverlap
    this.isBubble = isBubble
  }

  place (anchors, labels, pinnedLabels, labelsSvg, state, resolve) {
    console.log('rhtmlLabeledScatter: Running label placement algorithm...')

    labeler()
      .svg(this.svg)
      .w1(this.vb.x)
      .w2(this.vb.x + this.vb.width)
      .h1(this.vb.y)
      .h2(this.vb.y + this.vb.height)
      .anchor(anchors)
      .label(labels)
      .pinned(pinnedLabels)
      .promise(resolve)
      .anchorType(this.isBubble)
      .weights(this.wDistance, this.wLabelLabelOverlap, this.wLabelAncOverlap)
      .start(500)
  }

  placeTrendLabels (anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    this.place(this.svg, this.vb, anchors, labels, state.getPositionedLabIds(this.vb), labelsSvg, state, resolve)

    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  placeLabels (anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    const labsToBePlaced = _.filter(labels, l => l.text !== '' || (l.text === '' && l.url !== ''))

    this.place(this.svg, this.vb, anchors, labsToBePlaced, state.getPositionedLabIds(this.vb), labelsSvg, state, resolve)

    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }
}

module.exports = LabelPlacement
