
import _ from 'lodash'

class Links {
  constructor (pts, lab) {
    const _labIsText = labelData => labelData.url === ''
    const _labIsEmpty = labelData => labelData.text === '' && labelData.url === ''
    const _labIsInvisible = labelData => labelData.opacity === 0
    this.topBorderOffset = 3 // extra space between text label and link point

    this.links = []
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i]
      let newLinkPt = null
      if (_labIsEmpty(lab[i]) || _labIsInvisible(lab[i])) {
        newLinkPt = null
      } else if (!this._labIsInsideBubblePt(lab[i], pt)) {
        if (_labIsText(lab[i])) {
          newLinkPt = this._getNewPtOnTxtLabelBorder(lab[i], pt, pts)
        } else {
          newLinkPt = this._getNewPtOnLogoLabelBorder(lab[i], pt, pts)
        }
      }

      if (!_.isNull(newLinkPt)) {
        const ancBorderPt = this._getPtOnAncBorder(pt.x, pt.y, pt.r, newLinkPt[0], newLinkPt[1])
        this.links.push({
          x1: ancBorderPt[0],
          y1: ancBorderPt[1],
          x2: newLinkPt[0],
          y2: newLinkPt[1],
          width: 1,
          color: pt.color,
          hideLabel: pt.hideLabel,
        })
      }
    }
  }

  getLinkData () { return this.links }

  _labIsInsideBubblePt (lab, pt) {
    // Will return true if any part of the label is inside the bubble
    const labLeftBorder = lab.x - (lab.width / 2)
    const labRightBorder = lab.x + (lab.width / 2)
    const labBotBorder = lab.y
    const labTopBorder = lab.y - lab.adjustedHeight

    return (labLeftBorder < (pt.x + pt.r)) &&
      (labRightBorder > (pt.x - pt.r)) &&
      (labTopBorder < (pt.y + pt.r)) &&
      (labBotBorder > (pt.y - pt.r))
  }

  _getNewPtOnLogoLabelBorder (label, anchor) {
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
  _getNewPtOnTxtLabelBorder (label, anchor, anchorArray) {
    const labelXmid = label.x
    const labelXleft = label.x - (label.width / 2)
    const labelXright = label.x + (label.width / 2)

    const labelYbot = label.y
    const labelYtop = label.y - label.adjustedHeight
    const labelYmid = label.y - (label.adjustedHeight / 2)

    const ancL = anchor.x - anchor.r
    const ancR = anchor.x + anchor.r
    const ancT = anchor.y - anchor.r
    const ancB = anchor.y + anchor.r

    const labelBorder = {
      botL: [labelXleft, labelYbot],
      botC: [labelXmid, labelYbot],
      botR: [labelXright, labelYbot],
      topL: [labelXleft, labelYtop],
      topC: [labelXmid, labelYtop],
      topR: [labelXright, labelYtop],
      midL: [labelXleft, labelYmid],
      midR: [labelXright, labelYmid],
    }

    const padding = 5
    const centered = (anchor.x > labelXleft) && (ancL < labelXright)
    const abovePadded = ancB < (labelYtop - padding) // anchor above label and padding
    const above = ancB < labelYtop // anchor above label
    const belowPadded = ancT > (labelYbot + padding) // anchor below label and padding
    const below = ancT > labelYbot // anchor below label
    const left = anchor.x < labelXleft // anchor to the left of label
    const right = anchor.x > labelXright // anchor to the right of label
    const leftPadded = ancR < (labelXleft - padding) // anchor to the left of label and padding
    const rightPadded = ancL > (labelXright + padding) // anchor to the right of label and padding

    if (centered && abovePadded) {
      return labelBorder.topC
    } else if (centered && belowPadded) {
      return labelBorder.botC
    } else if (above && left) {
      return labelBorder.topL
    } else if (above && right) {
      return labelBorder.topR
    } else if (below && left) {
      return labelBorder.botL
    } else if (below && right) {
      return labelBorder.botR
    } else if (leftPadded) {
      return labelBorder.midL
    } else if (rightPadded) {
      return labelBorder.midR
    } else {
      // Draw the link if there are any anc nearby
      const anchorDistanceX = left ? labelXleft - anchor.x : right ? anchor.x - labelXright : 0
      const anchorDistanceY = above ? labelYtop - anchor.y : below ? anchor.y - labelYbot : 0
      const anchorDistance = Math.sqrt(anchorDistanceX * anchorDistanceX + anchorDistanceY * anchorDistanceY)
      const padL = labelBorder.topL[0] - anchorDistance
      const padR = labelBorder.topR[0] + anchorDistance
      const padT = labelBorder.topL[1] - anchorDistance
      const padB = labelBorder.botR[1] + anchorDistance
      let ancNearby = 0
      // TODO could use collision tree here
      _(anchorArray).each((a) => {
        if (((a.x > padL) && (a.x < padR)) && ((a.y > padT) && (a.y < padB))) {
          ancNearby++
        }
      })
      if (ancNearby > 0) {
        if (!left && !right && !above && !below) {
          return labelBorder.botC
        } else if (centered && above) {
          return labelBorder.topC
        } else if (centered && below) {
          return labelBorder.botC
        } else if (left && above) {
          return labelBorder.topL
        } else if (left && below) {
          return labelBorder.botL
        } else if (right && above) {
          return labelBorder.topR
        } else if (right && below) {
          return labelBorder.botR
        } else if (left) {
          return labelBorder.midL
        } else if (right) {
          return labelBorder.midR
        }
      }
    }

    return null
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
       .style('stroke-opacity', d => d.hideLabel ? 0.0 : plotColors.getFillOpacity(transparency))
  }
}

module.exports = Links
