
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
    computeAdjustedLabelHeight(labels)
    this.place(vb, anchors, labels, state.getPositionedLabIds(vb), true, resolve)

    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  placeLabels (vb, anchors, labels, state, resolve) {
    const labelsSvg = this.svg.selectAll(`.plt-${this.pltId}-lab`)
    const labelsImgSvg = this.svg.selectAll(`.plt-${this.pltId}-lab-img`)
    SvgUtils.setMatchingSvgBBoxWidthAndHeight(labels, labelsSvg)
    computeAdjustedLabelHeight(labels)
    const labsToBePlaced = _.filter(labels, l => l.text !== '' || (l.text === '' && l.url !== ''))

    this.place(vb, anchors, labsToBePlaced, state.getPositionedLabIds(vb), false, resolve)

    labelsImgSvg.attr('x', d => d.x - (d.width / 2))
                .attr('y', d => d.y - d.height)
  }

  computeAdjustedLabelHeight (labels) {
    labels.forEach(lbl => {
      lbl.adjustedHeight = bl.url === '' ? lbl.height * 0.6 : lbl.height
    })
  }
}

module.exports = LabelPlacement
