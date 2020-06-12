import _ from 'lodash'

const DEBUG_OUTPUT = false

class Links {
  constructor ({
    points,
    minimumDistance,
    nearbyAnchorDistanceThreshold,
  }) {
    const _labIsText = labelData => labelData.url === ''

    this.links = []

    const anchors = points.map(({ anchor }) => anchor)

    points.forEach(({ label, anchor, observations }) => {
      const hasLabel = (label)
      const { labelPlacedInsideBubble } = observations.static

      let newLinkPt = null
      if (!labelPlacedInsideBubble && hasLabel) {
        if (_labIsText(label)) {
          const { point, name } = this._getNewPtOnTxtLabelBorder({ label, anchor, anchors, minimumDistance, nearbyAnchorDistanceThreshold })
          newLinkPt = point

          if (DEBUG_OUTPUT) {
            const { minX, maxX, minY, maxY, shortText } = label
            console.log(`label "${shortText}": ${name}. l x(${minX.toFixed(1)}->${maxX.toFixed(1)}) y(${minY.toFixed(1)}->${maxY.toFixed(1)}). p: (${anchor.x.toFixed(1)},${anchor.y.toFixed(1)}) r: ${anchor.r.toFixed(1)}.`)
          }
        } else {
          newLinkPt = this._getNewPtOnLogoLabelBorder({ label, anchor })
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

  getLinkData () { return this.links }

  _getNewPtOnLogoLabelBorder ({ label, anchor }) {
    // Don't draw a link if anc is inside logo
    let region
    if ((label.x - (label.width / 2) < anchor.x && anchor.x < label.x + (label.width / 2)) &&
      (label.y - label.height < anchor.y && anchor.y < label.y)) {
      return null
    }

    // Calculations reference - http://stackoverflow.com/questions/4061576/finding-points-on-a-rectangle-at-a-given-angle
    const a = label.width
    const b = label.height
    const labx = label.x
    const laby = label.y - (label.height / 2)

    const dx = anchor.x - labx
    const dy = anchor.y - laby
    const angle = Math.atan(dy / dx)

    if (-Math.atan(b / a) < angle && angle < Math.atan(b / a)) {
      region = 1
    } else if (Math.atan(b / a) < angle && angle < Math.PI - Math.atan(b / a)) {
      region = 2
    } else if (Math.PI - Math.atan(b / a) < angle && angle < Math.PI + Math.atan(b / a)) {
      region = 3
    } else if (((Math.PI + Math.atan(b / a)) < angle) || (angle < -Math.atan(b / a))) {
      region = 4
    }

    if ((region === 1) || (region === 3)) {
      if (dx > 0) {
        return [labx + (a / 2), ((a / 2) * Math.tan(angle)) + laby]
      } else {
        return [labx - (a / 2), -((a / 2) * Math.tan(angle)) + laby]
      }
    } else if ((region === 2) || (region === 4)) {
      if (dy > 0) {
        return [labx + (b / (2 * Math.tan(angle))), (b / 2) + laby]
      } else {
        return [labx - (b / (2 * Math.tan(angle))), (-b / 2) + laby]
      }
    }

    return null
  }

  // calc the links from anc to label text if ambiguous
  _getNewPtOnTxtLabelBorder ({ label, anchor, anchors, minimumDistance, nearbyAnchorDistanceThreshold }) {
    const labelXmid = label.x
    const labelXleft = label.x - (label.width / 2)
    const labelXright = label.x + (label.width / 2)

    const labelYbot = label.y
    const labelYtop = label.y - label.height
    const labelYmid = label.y - (label.height / 2)

    const ancL = anchor.x - anchor.r
    const ancR = anchor.x + anchor.r
    const ancT = anchor.y + anchor.r
    const ancB = anchor.y - anchor.r

    const labelBorder = {
      botL: [labelXleft, labelYbot],
      botC: [labelXmid, labelYbot],
      botR: [labelXright, labelYbot],
      topL: [labelXleft, labelYtop + 7],
      topC: [labelXmid, labelYtop + 7],
      topR: [labelXright, labelYtop + 7],
      midL: [labelXleft, labelYmid],
      midR: [labelXright, labelYmid]
    }

    const anchorAndLabelAreHorizontallyAligned = (ancR > labelXleft) && (ancL < labelXright)
    const anchorIsAboveWithPadding = ancB < (labelYtop - minimumDistance)
    const anchorIsAbove = ancB < labelYtop
    const anchorIsBelowWithPadding = ancT > (labelYbot + minimumDistance)
    const anchorIsBelow = ancT > labelYbot
    const anchorIsLeftWithPadding = ancR < (labelXleft - minimumDistance)
    const anchorIsLeft = ancR < labelXleft
    const anchorIsRightWithPadding = ancL > (labelXright + minimumDistance)
    const anchorIsRight = ancL > labelXright

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
      const padL = labelBorder.topL[0] - nearbyAnchorDistanceThreshold
      const padR = labelBorder.topR[0] + nearbyAnchorDistanceThreshold
      const padT = labelBorder.topL[1] - nearbyAnchorDistanceThreshold
      const padB = labelBorder.botR[1] + nearbyAnchorDistanceThreshold
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
