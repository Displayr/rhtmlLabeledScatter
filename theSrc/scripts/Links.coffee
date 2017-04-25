 class Links
  constructor: (pts, lab) ->
    @links = []
    for pt, i in pts
      newLinkPt = null
      if lab[i].url == ''
        newLinkPt = @getNewPtOnTxtLabelBorder lab[i], pt, pts
      else
        newLinkPt = @getNewPtOnLogoLabelBorder lab[i], pt, pts

      if newLinkPt?
        ancBorderPt = @getPtOnAncBorder pt.x, pt.y, pt.r, newLinkPt[0], newLinkPt[1]
        @links.push({
          x1: ancBorderPt[0]
          y1: ancBorderPt[1]
          x2: newLinkPt[0]
          y2: newLinkPt[1]
          width: 1
          color: pt.color
        })

  getLinkData: () => @links

  getNewPtOnLogoLabelBorder: (label, anchor, anchor_array) =>
    # Don't draw a link if anc is inside logo
    if (label.x - label.width/2 < anchor.x < label.x + label.width/2) and (label.y - label.height < anchor.y < label.y)
       return

    # Calculations reference - http://stackoverflow.com/questions/4061576/finding-points-on-a-rectangle-at-a-given-angle
    a = label.width
    b = label.height
    labx = label.x
    laby = label.y - label.height/2

    dx = anchor.x - labx
    dy = anchor.y - laby
    angle = Math.atan(dy/dx)

    if -Math.atan(b/a) < angle < Math.atan(b/a) then region = 1
    else if Math.atan(b/a) < angle < Math.PI-Math.atan(b/a) then region = 2
    else if Math.PI-Math.atan(b/a) < angle < Math.PI+Math.atan(b/a) then region = 3
    else if Math.PI+Math.atan(b/a) < angle or angle < -Math.atan(b/a) then region = 4

    if region == 1 or region == 3
      if dx > 0
        [labx + a/2 , (a/2 * Math.tan(angle))+ laby]
      else
        [labx - a/2 , -(a/2 * Math.tan(angle))+ laby]
    else if region == 2 or region == 4
      if dy > 0
        [labx + b/(2* Math.tan(angle)) , b/2 + laby]
      else
        [labx - b/(2* Math.tan(angle)) , -b/2 + laby]

  # calc the links from anc to label text if ambiguous
  getNewPtOnTxtLabelBorder: (label, anchor, anchor_array) =>
    labelXmid = label.x
    labelXleft = label.x - label.width/2
    labelXright = label.x + label.width/2

    labelYbot = label.y
    labelYtop = label.y - label.height
    labelYmid = label.y - label.height/2

    ancL = anchor.x - anchor.r
    ancR = anchor.x + anchor.r
    ancT = anchor.y + anchor.r
    ancB = anchor.y - anchor.r

    labelBorder =
      botL: [labelXleft,     labelYbot]
      botC: [labelXmid,      labelYbot]
      botR: [labelXright,    labelYbot]
      topL: [labelXleft,     labelYtop + 7]
      topC: [labelXmid,      labelYtop + 7]
      topR: [labelXright,    labelYtop + 7]
      midL: [labelXleft,     labelYmid]
      midR: [labelXright,    labelYmid]

    padding = 10
    centered = (ancR > labelXleft) and (ancL < labelXright)
    paddedCenter = (ancR > labelXleft - padding) and (ancL < labelXright + padding)
    abovePadded = ancB < labelYtop - padding
    above = ancB < labelYtop
    aboveMid = anchor.y < labelYmid
    belowPadded = ancT > labelYbot + padding
    below = ancT > labelYbot
    belowMid = anchor.y >= labelYmid
    left = ancR < labelXleft
    right = ancL > labelXright
    leftPadded = ancR < labelXleft - padding
    rightPadded = ancL > labelXright + padding

    if centered and abovePadded
      return labelBorder.topC
    else if centered and belowPadded
      return labelBorder.botC
    else if above and left
      return labelBorder.topL
    else if above and right
      return labelBorder.topR
    else if below and left
      return labelBorder.botL
    else if below and right
      return labelBorder.botR
    else if leftPadded
      return labelBorder.midL
    else if rightPadded
      return labelBorder.midR
    else
      # Draw the link if there are any anc nearby
      ambiguityFactor = 10
      padL = labelBorder.topL[0] - ambiguityFactor
      padR = labelBorder.topR[0] + ambiguityFactor
      padT = labelBorder.topL[1] - ambiguityFactor
      padB = labelBorder.botR[1] + ambiguityFactor
      ancNearby = 0
      for a in anchor_array
        if (a.x > padL and a.x < padR) and (a.y > padT and a.y < padB)
          ancNearby++
      if ancNearby > 1
        if not left and not right and not above and not below
          return labelBorder.botC
        else if centered and above
          return labelBorder.topC
        else if centered and below
          return labelBorder.botC
        else if left and above
          return labelBorder.topL
        else if left and below
          return labelBorder.botL
        else if right and above
          return labelBorder.topR
        else if right and below
          return labelBorder.botR
        else if left
          return labelBorder.midL
        else if right
          return labelBorder.midR
      return

  getPtOnAncBorder: (cx, cy, cr, x, y) =>
    opp = Math.abs(cy - y)
    adj = Math.abs(cx - x)
    angle = Math.atan(opp/adj)

    dx = cr*Math.cos(angle)
    dy = cr*Math.sin(angle)

    final_x = if x < cx then cx - dx else cx + dx
    final_y = if y < cy then cy - dy else cy + dy

    [final_x, final_y]
