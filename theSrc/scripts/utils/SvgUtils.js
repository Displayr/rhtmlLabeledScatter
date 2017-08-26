import _ from 'lodash'

class SvgUtils {
  static setSvgBBoxWidthAndHeight (dataArray, svgArray) {
    _(dataArray).each((dataElem, index) => {
      if (!dataElem.width && !dataElem.height) {
        dataElem.width = svgArray[0][index].getBBox().width
        dataElem.height = svgArray[0][index].getBBox().height
      }
    })
  }
  // If user defined boundary is less than a bubble, then clip the bubble when it reaches the border
  static clipBubbleIfOutsidePlotArea (svg, pts, vb, pltUniqueId) {
    // Defines boundaries
    const bound = {
      left: vb.x,
      right: vb.x + vb.width,
      top: vb.y,
      bot: vb.y + vb.height
    }
    _.map(pts, (pt, i) => {
      const bubble = {
        left: pt.x - pt.r,
        right: pt.x + pt.r,
        top: pt.y - pt.r,
        bot: pt.y + pt.r
      }
      if (bubble.right > bound.right || bubble.left < bound.left || bubble.top < bound.top || bubble.bot > bound.bot) {
        // Build a clip path depending on which side is on the boundary
        let cp = {
          width: pt.r * 2,
          height: pt.r * 2,
          x: bubble.left,
          y: bubble.top
        }
        if (bubble.right > bound.right) {
          cp.width = (pt.r * 2) - (bubble.right - bound.right)
        }
        if (bubble.left < bound.left) {
          cp.x = bound.left
          cp.width = (pt.r * 2) - (bound.left - bubble.left)
        }
        if (bubble.top < bound.top) {
          cp.height = (pt.r * 2) - (bound.top - bubble.top)
          cp.y = bound.top
        }
        if (bubble.bot > bound.bot) {
          cp.height = (pt.r * 2) - (bubble.bot - bound.bot)
        }
        // Append clip-path to svg for this pt
        svg.append('clipPath')
           .attr('id', `plt-${pltUniqueId}-cp-${pt.id}`)
           .append('rect')
           .attr('x', cp.x)
           .attr('y', cp.y)
           .attr('width', cp.width)
           .attr('height', cp.height)

        svg.select(`circle#anc-${pt.id}`)
           .attr('clip-path', d => `url(#plt-${pltUniqueId}-cp-${d.id})`)
      }
    })
  }
}

module.exports = SvgUtils
