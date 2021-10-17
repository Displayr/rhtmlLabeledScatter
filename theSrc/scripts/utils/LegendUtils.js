import _ from 'lodash'

class LegendUtils {
  static normalizedZtoRadius (scale, normalizedZ) {
    // z values are multiplied by the point size and a constant multiplier (50/3)
    // the constant multiplier makes LabeledScatter behave consistently with flipStandardCharts::Scatter
    // it means that when point.radius = 3 (default), the largest marker will have a radius of 50 pixels
    return (Math.sqrt(normalizedZ / Math.PI) * scale * 50 / 3)
  }

  static getLegendBubbles (maxZ, zPrefix, zSuffix) {
    const bubbleSizes = this.getLegendBubbleSizes(maxZ)
    const bubbleLabels = this.getLegendBubbleLabels(bubbleSizes, zPrefix, zSuffix)

    const legendBubbles = {
      large: {
        size: bubbleSizes[0],
        label: bubbleLabels[0],
      },
      medium: {
        size: bubbleSizes[1],
        label: bubbleLabels[1],
      },
      small: {
        size: bubbleSizes[2],
        label: bubbleLabels[2],
      },
      maxSize: Math.max(maxZ, bubbleSizes[0]),
    }
    return legendBubbles
  }

  static getLegendBubbleSizes (maxZ) {
    const significands = this.getBubbleSizeSignificands(maxZ)
    const exponent = this.getExponent(maxZ)
    return significands.map(x => x * (10 ** exponent))
  }

  static getBubbleSizeSignificands (maxZ) {
    const significand = this.getSignificand(maxZ)
    const maxSignificand = this.roundSignificand(significand)

    if (maxSignificand === 10) {
      return [maxSignificand, 5, 1]
    } else if (maxSignificand === 7) {
      return [maxSignificand, 3, 1]
    } else if (maxSignificand >= 6) {
      return [maxSignificand, 3, 1]
    } else if (maxSignificand === 5) {
      return [maxSignificand, 2, 0.5]
    } else if (maxSignificand === 4) {
      return [maxSignificand, 2, 0.5]
    } else if (maxSignificand === 3) {
      return [maxSignificand, 1.5, 0.5]
    } else if (maxSignificand === 2) {
      return [maxSignificand, 1, 0.2]
    } else if (maxSignificand === 1.5) {
      return [maxSignificand, 0.7, 0.2]
    } else { // maxSignificand === 1
      return [maxSignificand, 0.5, 0.1] // consistent with maxSignificand == 10
    }
  }

  // Returns 10, 7, 6, 5, 4, 3, 2, 1.5 or 1 (exclude 8 and 9 because it is better to round those up to 10)
  static roundSignificand (significand) {
    if (significand >= 8) {
      return 10
    } else if (significand >= 7.5) {
      return 7
    } else if (significand >= 2) {
      return Math.round(significand)
    } else {
      return Math.round(2 * significand) / 2
    }
  }

  // For example if value is 123.45, then this returns 1.2345
  static getSignificand (value) {
    return Number(value.toExponential().split('e')[0])
  }

  static getExponent (value) {
    return Number(value.toExponential().split('e')[1])
  }

  static getLegendBubbleLabels (bubbleSizes, prefix, suffix) {
    const oneThousand = 10 ** 3
    const oneMillion = 10 ** 6
    const oneBillion = 10 ** 9
    const oneTrillion = 10 ** 12
    if (bubbleSizes[0] >= oneTrillion) {
      return bubbleSizes.map(x => this.formatBubbleSize(x, oneTrillion, 'T', prefix, suffix))
    } else if (bubbleSizes[0] >= oneBillion) {
      return bubbleSizes.map(x => this.formatBubbleSize(x, oneBillion, 'B', prefix, suffix))
    } else if (bubbleSizes[0] >= oneMillion) {
      return bubbleSizes.map(x => this.formatBubbleSize(x, oneMillion, 'M', prefix, suffix))
    } else if (bubbleSizes[0] >= oneThousand) {
      return bubbleSizes.map(x => this.formatBubbleSize(x, oneThousand, 'K', prefix, suffix))
    } else { // bubbleSizes[0] < 1000
      return bubbleSizes.map(x => this.formatBubbleSize(x, 1, '', prefix, suffix))
    }
  }

  static formatBubbleSize (bubbleSize, denominator, denominatorLetter, prefix, suffix) {
    // Round to 2 significant figures to avoid numerical issues when formatting as string
    // The bubble sizes have no more than 2 significant figures
    const denominatedSize = Number((bubbleSize / denominator).toPrecision(2))
    return prefix + this.removePrecedingZero(denominatedSize.toString()) + denominatorLetter + suffix
  }

  static removePrecedingZero (label) {
    if (_.isString(label) && label.charAt(0) === '0') {
      return label.substring(1, label.length)
    } else {
      return label
    }
  }

  static normalizeZValues (Z, maxZ) {
    return _.map(Z, (z) => {
      return z / maxZ
    })
  }

  static setupBubbles (vb, legendBubbles, legend, pointRadius) {
    const rTop = this.normalizedZtoRadius(pointRadius, legendBubbles.large.size / legendBubbles.maxSize)
    const rMid = this.normalizedZtoRadius(pointRadius, legendBubbles.medium.size / legendBubbles.maxSize)
    const rBot = this.normalizedZtoRadius(pointRadius, legendBubbles.small.size / legendBubbles.maxSize)
    const cx = vb.x + vb.width + (legend.getWidth() / 2)
    const viewBoxYBottom = vb.y + vb.height
    const bubbleTextPadding = 2
    legend.setBubblesMaxWidth(rTop * 2)
    legend.setBubbles([
      {
        cx,
        cy: viewBoxYBottom - rTop,
        r: rTop,
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding,
        text: legendBubbles.large.label,
      },
      {
        cx,
        cy: viewBoxYBottom - rMid,
        r: rMid,
        x: cx,
        y: viewBoxYBottom - (2 * rMid) - bubbleTextPadding,
        text: legendBubbles.medium.label,
      },
      {
        cx,
        cy: viewBoxYBottom - rBot,
        r: rBot,
        x: cx,
        y: viewBoxYBottom - (2 * rBot) - bubbleTextPadding,
        text: legendBubbles.small.label,
      },
    ])
    legend.setBubblesTitle([
      {
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding,
      },
    ])
  }
}

module.exports = LegendUtils
