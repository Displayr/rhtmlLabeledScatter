
import labeler from './lib/labeler'
import SvgUtils from './utils/SvgUtils'
import _ from 'lodash'

class LabelPlacement {
  constructor ({
                 svg,
                 pltId,
                 isBubble,
                 isLabelPlacementAlgoOn,
                 weights,
                 numSweeps,
                 maxMove,
                 maxAngle,
                 seed,
                 initialTemperature,
                 finalTemperature,
               }) {
    this.svg = svg
    this.pltId = pltId
    this.isBubble = isBubble
    this.isLabelPlacementAlgoOn = isLabelPlacementAlgoOn

    this.weights = weights
    this.numSweeps = numSweeps
    this.maxMove = maxMove
    this.maxAngle = maxAngle
    this.seed = seed
    this.initialTemperature = initialTemperature
    this.finalTemperature = finalTemperature
  }

  updateSvgOnResize (svg) {
    this.svg = svg
  }

  place (vb, anchors, labels, pinnedLabels, isTrendLabel, resolve) {
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
      .isBubble(this.isBubble)
      .isTrendLabel(isTrendLabel)
      .setTemperatureBounds(this.initialTemperature, this.finalTemperature)
      .weights(this.weights)
      .settings(this.seed, this.maxMove, this.maxAngle, this.isLabelPlacementAlgoOn)
      .start(this.numSweeps)
  }

  placeTrendLabels (vb, anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    this.computeAdjustedLabelHeight(labels)
    this.place(vb, anchors, labels, state.getPositionedLabIds(vb), true, resolve)

    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  placeLabels (vb, anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    const labsToBePlaced = _.filter(labels, l => (l.text !== '' && l.opacity > 0) || (l.text === '' && l.url !== ''))
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labsToBePlaced, labelsSvg)
    this.computeAdjustedLabelHeight(labsToBePlaced)

    this.place(vb, anchors, labsToBePlaced, state.getPositionedLabIds(vb), false, resolve)

    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  // Compute an adjusted text label height that is closer to the actual observed height
  // as getBBox tends to overestimate it. This height is used when dealing with the anchor,
  // so that when a text label is positioned under an anchor, the label appears correctly distanced from its anchor.
  computeAdjustedLabelHeight (labels) {
    labels.forEach(lbl => {
      lbl.adjustedHeight = lbl.url === '' ? lbl.height * 0.6 : lbl.height
    })
  }
}

module.exports = LabelPlacement
