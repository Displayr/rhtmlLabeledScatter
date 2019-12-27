
import labeler from './lib/labeler'
import SvgUtils from './utils/SvgUtils'
import _ from 'lodash'

class LabelPlacement {
  constructor (pltId, svg, wDistance, wLabelLabelOverlap, wLabelAncOverlap,
               isBubble, numSweeps, maxMove, maxAngle, seed,
               isLabelPlacementAlgoOn) {
    this.pltId = pltId
    this.svg = svg
    this.wDistance = wDistance
    this.wLabelLabelOverlap = wLabelLabelOverlap
    this.wLabelAncOverlap = wLabelAncOverlap
    this.isBubble = isBubble
    this.numSweeps = numSweeps
    this.maxMove = maxMove
    this.maxAngle = maxAngle
    this.seed = seed
    this.isLabelPlacementAlgoOn = isLabelPlacementAlgoOn
  }

  updateSvgOnResize (svg) {
    this.svg = svg
  }

  place (vb, anchors, labels, pinnedLabels, state, resolve) {
    console.log('rhtmlLabeledScatter: Running label placement algorithm...')
    labeler()
      .svg(this.svg)
      .w1(vb.x)
      .w2(vb.x + vb.width)
      .h1(vb.y)
      .h2(vb.y + vb.height)
      .anchor(anchors)
      .label(labels)
      .pinned(pinnedLabels)
      .promise(resolve)
      .anchorType(this.isBubble)
      .weights(this.wDistance, this.wLabelLabelOverlap, this.wLabelAncOverlap)
      .settings(this.seed, this.maxMove, this.maxAngle, this.isLabelPlacementAlgoOn)
      .start(this.numSweeps)
  }

  placeTrendLabels (vb, anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    this.place(vb, anchors, labels, state.getPositionedLabIds(vb), state, resolve)

    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  placeLabels (vb, anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    const labsToBePlaced = _.filter(labels, l => l.text !== '' || (l.text === '' && l.url !== ''))

    this.place(vb, anchors, labsToBePlaced, state.getPositionedLabIds(vb), state, resolve)

    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }
}

module.exports = LabelPlacement
