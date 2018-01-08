
import labeler from './lib/labeler'
import SvgUtils from './utils/SvgUtils'
import _ from 'lodash'

class LabelPlacement {
  constructor (wDistance, wLabelLabelOverlap, wLabelAncOverlap) {
    this.wDistance = wDistance
    this.wLabelLabelOverlap = wLabelLabelOverlap
    this.wLabelAncOverlap = wLabelAncOverlap
  }

  place (svg, vb, anchors, isBubble, labels, pinnedLabels, labelsSvg, state, resolve) {
    console.log('rhtmlLabeledScatter: Running label placement algorithm...')

    labeler()
      .svg(svg)
      .w1(vb.x)
      .w2(vb.x + vb.width)
      .h1(vb.y)
      .h2(vb.y + vb.height)
      .anchor(anchors)
      .label(labels)
      .pinned(pinnedLabels)
      .promise(resolve)
      .anchorType(isBubble)
      .weights(this.wDistance, this.wLabelLabelOverlap, this.wLabelAncOverlap)
      .start(500)
  }

  placeTrendLabels (pltId, svg, vb, anchors, isBubble, labels, state, resolve) {
    const labelsSvg = svg.selectAll(`.plt-${pltId}-lab`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    this.place(svg, vb, anchors, isBubble, labels, state.getPositionedLabIds(vb), labelsSvg, state, resolve)

    const labelsImgSvg = svg.selectAll(`.plt-${pltId}-lab-img`)
    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  placeLabels (pltId, svg, vb, anchors, isBubble, labels, state, resolve) {
    const labelsSvg = svg.selectAll(`.plt-${pltId}-lab`)
    const labelsImgSvg = svg.selectAll(`.plt-${pltId}-lab-img`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    const labsToBePlaced = _.filter(labels, l => l.text !== '' || (l.text === '' && l.url !== ''))

    this.place(svg, vb, anchors, isBubble, labsToBePlaced, state.getPositionedLabIds(vb), labelsSvg, state, resolve)

    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }
}

module.exports = LabelPlacement
