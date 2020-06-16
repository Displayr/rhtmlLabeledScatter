import _ from 'lodash'

const DEBUG_OUTPUT = false

class Links {
  constructor ({
    points,
    minimumDistance,
    nearbyAnchorDistanceThreshold
  }) {
    const _labIsText = labelData => labelData.url === ''

    this.links = []
    const anchors = points.map(({ anchor }) => anchor)
    points.forEach(({ label, anchor }) => {
      const hasLabel = (label)

      let newLinkPt = null
      if (hasLabel) {
        if (_labIsText(label) && !this._labIsInsideBubblePt({ label, anchor })) {
          const { point, name } = this._getNewPtOnTxtLabelBorder({ label, anchor, anchors, minimumDistance, nearbyAnchorDistanceThreshold })
          if (DEBUG_OUTPUT) { this._debugOutput({ label, anchor, name }) }
          newLinkPt = point
        } else {
          newLinkPt = this._getNewPtOnLogoBorder({ label, anchor })
        }
      }

      if (!_.isNull(newLinkPt)) {
        const ancBorderPt = this._getPtOnAncBorder(anchor.x, anchor.y, anchor.r, newLinkPt[0], newLinkPt[1])
        this.links.push({
          x1: ancBorderPt[0],
          y1: ancBorderPt[1],
          x2: newLinkPt[0],
          y2: newLinkPt[1],
          width: 1,
          color: anchor.color
        })
      }
    })
  }

  _debugOutput ({ label, anchor, name }) {
    const { minX, maxX, minY, maxY, shortText } = label
    console.log(`label "${shortText}": ${name}. l x(${minX.toFixed(1)}->${maxX.toFixed(1)}) y(${minY.toFixed(1)}->${maxY.toFixed(1)}). p: (${anchor.x.toFixed(1)},${anchor.y.toFixed(1)}) r: ${anchor.r.toFixed(1)}.`)
  }

  getLinkData () { return this.links }

  _labIsInsideBubblePt ({ label, anchor }) {
    // Will return true if any part of the label is inside the bubble
    return (label.minX < (anchor.maxX)) &&
      (label.maxX > (anchor.minX)) &&
      (label.minY < (anchor.maxY)) &&
      (label.maxY > (anchor.minY))
  }

  _getNewPtOnLogoBorder ({ label: logo, anchor }) {
    // Don't draw a link if anc is inside logo
    if (
      (logo.minX < anchor.x && anchor.x < logo.maxX) &&
      (logo.minY < anchor.y && anchor.y < logo.maxY)
    ) {
      return null
    }

    // Calculations reference - http://stackoverflow.com/questions/4061576/finding-points-on-a-rectangle-at-a-given-angle
    const halfWidth = logo.width / 2
    const halfHeight = logo.height / 2
    const logoCenter = {
      x: logo.x,
      y: logo.y - (logo.height / 2)
    }

    const dx = anchor.x - logoCenter.x
    const dy = anchor.y - logoCenter.y
    const angle = Math.atan(dy / dx)
    const aspectRatioAngle = Math.atan(logo.height / logo.width)

    let region
    if (-aspectRatioAngle < angle && angle <= aspectRatioAngle) {
      region = 1
    } else if (aspectRatioAngle < angle && angle <= Math.PI - aspectRatioAngle) {
      region = 2
    } else if (Math.PI - aspectRatioAngle < angle && angle <= Math.PI + aspectRatioAngle) {
      region = 3
    } else {
      region = 4
    }

    if ((region === 1) || (region === 3)) {
      if (dx > 0) {
        return [logo.maxX, (halfWidth * Math.tan(angle)) + logoCenter.y]
      } else {
        return [logo.minX, -(halfWidth * Math.tan(angle)) + logoCenter.y]
      }
    } else if ((region === 2) || (region === 4)) {
      if (dy > 0) {
        return [logoCenter.x + halfHeight / Math.tan(angle), logo.maxY]
      } else {
        return [logoCenter.x - halfHeight / Math.tan(angle), logo.minY]
      }
    }

    return null
  }

  // calc the links from anc to label text if ambiguous
  _getNewPtOnTxtLabelBorder ({ label, anchor, anchors, minimumDistance, nearbyAnchorDistanceThreshold }) {
    const labelXmid = (label.maxX - label.minX) / 2 + label.minX
    const labelYmid = (label.maxY - label.minY) / 2 + label.minY

    const labelBorder = {
      botL: [label.minX, label.maxY],
      botC: [labelXmid, label.maxY],
      botR: [label.maxX, label.maxY],
      topL: [label.minX, label.minY],
      topC: [labelXmid, label.minY],
      topR: [label.maxX, label.minY],
      midL: [label.minX, labelYmid],
      midR: [label.maxX, labelYmid]
    }

    const anchorAndLabelAreHorizontallyAligned = (anchor.maxX > label.minX) && (anchor.minX < label.maxX)
    const anchorIsAboveWithPadding = anchor.maxY < (label.minY - minimumDistance)
    const anchorIsAbove = anchor.maxY < label.minY
    const anchorIsBelowWithPadding = anchor.minY > (label.maxY + minimumDistance)
    const anchorIsBelow = anchor.minY > label.maxY
    const anchorIsLeftWithPadding = anchor.maxX < (label.minX - minimumDistance)
    const anchorIsLeft = anchor.maxX < label.minX
    const anchorIsRightWithPadding = anchor.minX > (label.maxX + minimumDistance)
    const anchorIsRight = anchor.minX > label.maxX

    if (anchorAndLabelAreHorizontallyAligned && anchorIsAboveWithPadding) {
      return { point: labelBorder.topC, name: 'anchorAndLabelAreHorizontallyAligned && anchorIsAboveWithPadding' }
    } else if (anchorAndLabelAreHorizontallyAligned && anchorIsBelowWithPadding) {
      return { point: labelBorder.botC, name: 'anchorAndLabelAreHorizontallyAligned && anchorIsBelowWithPadding' }
    } else if (anchorIsAbove && anchorIsLeft) {
      return { point: labelBorder.topL, name: 'anchorIsAbove && anchorIsLeft' }
    } else if (anchorIsAbove && anchorIsRight) {
      return { point: labelBorder.topR, name: 'anchorIsAbove && anchorIsRight' }
    } else if (anchorIsBelow && anchorIsLeft) {
      return { point: labelBorder.botL, name: 'anchorIsBelow && anchorIsLeft' }
    } else if (anchorIsBelow && anchorIsRight) {
      return { point: labelBorder.botR, name: 'anchorIsBelow && anchorIsRight' }
    } else if (anchorIsLeftWithPadding) {
      return { point: labelBorder.midL, name: 'anchorIsLeftWithPadding' }
    } else if (anchorIsRightWithPadding) {
      return { point: labelBorder.midR, name: 'anchorIsRightWithPadding' }
    } else {
      // Draw the link if there are any anc nearby
      // TODO have utility for this in labeler.js
      const padL = label.minX - nearbyAnchorDistanceThreshold
      const padR = label.maxX + nearbyAnchorDistanceThreshold
      const padT = label.minY - nearbyAnchorDistanceThreshold
      const padB = label.maxY + nearbyAnchorDistanceThreshold
      let ancNearby = 0
      // TODO could use collision tree here
      _(anchors).each((a) => {
        if (((a.x > padL) && (a.x < padR)) && ((a.y > padT) && (a.y < padB))) {
          ancNearby++
        }
      })
      if (ancNearby > 1) {
        if (!anchorIsLeft && !anchorIsRight && !anchorIsAbove && !anchorIsBelow) {
          return { point: labelBorder.botC, name: 'ancNearby && !anchorIsLeft && !anchorIsRight && !anchorIsAbove && !anchorIsBelow' }
        } else if (anchorAndLabelAreHorizontallyAligned && anchorIsAbove) {
          return { point: labelBorder.topC, name: 'ancNearby && anchorAndLabelAreHorizontallyAligned && anchorIsAbove' }
        } else if (anchorAndLabelAreHorizontallyAligned && anchorIsBelow) {
          return { point: labelBorder.botC, name: 'ancNearby && anchorAndLabelAreHorizontallyAligned && anchorIsBelow' }
        } else if (anchorIsLeft && anchorIsAbove) {
          return { point: labelBorder.topL, name: 'ancNearby && anchorIsLeft && anchorIsAbove' }
        } else if (anchorIsLeft && anchorIsBelow) {
          return { point: labelBorder.botL, name: 'ancNearby && anchorIsLeft && anchorIsBelow' }
        } else if (anchorIsRight && anchorIsAbove) {
          return { point: labelBorder.topR, name: 'ancNearby && anchorIsRight && anchorIsAbove' }
        } else if (anchorIsRight && anchorIsBelow) {
          return { point: labelBorder.botR, name: 'ancNearby && anchorIsRight && anchorIsBelow' }
        } else if (anchorIsLeft) {
          return { point: labelBorder.midL, name: 'ancNearby && anchorIsLeft' }
        } else if (anchorIsRight) {
          return { point: labelBorder.midR, name: 'ancNearby && anchorIsRight' }
        }
      }
    }

    return { point: null, name: 'catchall' }
  }

  _getPtOnAncBorder (cx, cy, cr, x, y) {
    const opp = Math.abs(cy - y)
    const adj = Math.abs(cx - x)
    const angle = Math.atan(opp / adj)

    const dx = cr * Math.cos(angle)
    const dy = cr * Math.sin(angle)

    const finalX = x < cx ? cx - dx : cx + dx
    const finalY = y < cy ? cy - dy : cy + dy

    return [finalX, finalY]
  }

  drawWith (svg, plotColors, transparency) {
    svg.selectAll('.link').remove()
    svg.selectAll('.link')
       .data(this.getLinkData())
       .enter()
       .append('line')
       .attr('class', 'link')
       .attr('x1', d => d.x1)
       .attr('y1', d => d.y1)
       .attr('x2', d => d.x2)
       .attr('y2', d => d.y2)
       .attr('stroke-width', d => d.width)
       .attr('stroke', d => d.color)
       .style('stroke-opacity', plotColors.getFillOpacity(transparency))
  }
}

module.exports = Links
