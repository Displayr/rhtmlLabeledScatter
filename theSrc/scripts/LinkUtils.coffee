class LinkUtils
  instance = null

  @get: ->
    if not @instance?
      instance = new LU()
    instance

  class LU
    constructor: ->

    # calc the links from anc to label text if ambiguous
    getNewPtOnLabelBorder: (label, anchor, anchor_array) ->
      labelBorder =
        botL: [label.x - label.width/2,     label.y]
        botC: [label.x,                     label.y]
        botR: [label.x + label.width/2,     label.y]
        topL: [label.x - label.width/2,     label.y - label.height + 7]
        topC: [label.x,                     label.y - label.height + 7]
        topR: [label.x + label.width/2,     label.y - label.height + 7]
        midL: [label.x - label.width/2,     label.y - label.height/2]
        midR: [label.x + label.width/2,     label.y - label.height/2]

      padding = 10
      centered = (anchor.x > label.x - label.width/2) and (anchor.x < label.x + label.width/2)
      paddedCenter = (anchor.x > label.x - label.width/2 - padding) and (anchor.x < label.x + label.width/2 + padding)
      abovePadded = anchor.y < label.y - label.height - padding
      above = anchor.y < label.y - label.height
      aboveMid = anchor.y < label.y - label.height/2
      belowPadded = anchor.y > label.y + padding
      below = anchor.y > label.y
      belowMid = anchor.y >= label.y - label.height/2
      left = anchor.x < label.x - label.width/2
      right = anchor.x > label.x + label.width/2
      leftPadded = anchor.x < label.x - label.width/2 - padding
      rightPadded = anchor.x > label.x + label.width/2 + padding

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

    getPtOnAncBorder: (cx, cy, cr, x, y) ->
      opp = Math.abs(cy - y)
      adj = Math.abs(cx - x)
      angle = Math.atan(opp/adj)

      dx = cr*Math.cos(angle)
      dy = cr*Math.sin(angle)

      final_x = if x < cx then cx - dx else cx + dx
      final_y = if y < cy then cy - dy else cy + dy

      [final_x, final_y]
