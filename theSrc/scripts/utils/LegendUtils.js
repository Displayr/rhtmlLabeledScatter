import _ from 'lodash'

class LegendUtils {
  static normalizedZtoRadius (scale, normalizedZ) {
    // z values are multiplied by the point size and a constant multiplier (50/3)
    // the constant multiplier makes LabeledScatter behave consistently with flipStandardCharts::Scatter
    // it means that when point.radius = 3 (default), the largest marker will have a radius of 50 pixels
    return (Math.sqrt(normalizedZ / Math.PI) * scale * 50 / 3)
  }

  static getZQuantiles(maxZ, zPrefix, zSuffix) {
    const quantileValues = this.getQuantileValues(maxZ)
    const quantileLabels = this.getQuantileLabels(quantileValues, zPrefix, zSuffix)

    const Zquantiles = {
      top: {
        lab: quantileLabels[0],
        val: quantileValues[0],
      },
      mid: {
        lab: quantileLabels[1],
        val: quantileValues[1],
      },
      bot: {
        lab: quantileLabels[2],
        val: quantileValues[2],
      },
    }
    return Zquantiles
  }

  static getQuantileValues(maxZ) {
    const quantileSignificands = this.getQuantileSignificands(maxZ)
    const exponent = this.getExponent(maxZ)
    return quantileSignificands.map(x => x * (10 ** exponent))
  }

  static getQuantileSignificands(maxZ) {
    const maxSignificand = this.roundUpSignificand(maxZ)

    if (maxSignificand == 10) {
      return [maxSignificand, 5, 1]
    } else if (maxSignificand >= 8) {
      return [maxSignificand, 4, 1]
    } else if (maxSignificand >= 6) {
      return [maxSignificand, 3, 1]
    } else if (maxSignificand == 5) {
      return [maxSignificand, 2.5, 0.5]
    } else if (maxSignificand >= 4) {
      return [maxSignificand, 2, 0.5]
    } else if (maxSignificand >= 3) {
      return [maxSignificand, 1.5, 0.5]
    } else if (maxSignificand >= 2) {
      return [maxSignificand, 1, 0.2]
    } else if (maxSignificand > 2) {
      return [maxSignificand, maxSignificand / 2, 0.2]
    } else { // maxSignificand == 1
      return [maxSignificand, 0.5, 0.1] // consistent with maxSignificand == 10
    }
  }

  // Returns one of the following values: 10, 9, 8, 7, 6, 5, 4, 3, 2.5, 2, 1.5, 1.2, 1
  static roundUpSignificand(value) {
    const significand = this.getSignificand(value)
    if (significand > 5) { // round up to next integer
      return Math.ceil(significand)
    } else if (significand > 2) { // round to closest multiple of 0.5
      return Math.ceil(2 * significand) / 2
    } else { // if significand <= 2, round to closest multiple of 0.2
      return Math.ceil(5 * significand) / 5
    }
  }

  // For example if value is 123.45, then this returns 1.2345
  static getSignificand(value) {
    return parseFloat(value.toExponential().split('e')[0])
  }

  static getExponent(value) {
    return parseInt(value.toExponential().split('e')[1])
  }

  static getQuantileLabels(quantileValues, prefix, suffix) {
    const oneThousand = 10 ** 3
    const oneMillion = 10 ** 6
    const oneBillion = 10 ** 9
    const oneTrillion = 10 ** 12
    if (quantileValues[0] >= oneTrillion) {
      return quantileValues.map(x => prefix + (x / oneTrillion).toString() + 'T' + suffix)
    } else if (quantileValues[0] >= oneBillion) {
      return quantileValues.map(x => prefix + (x / oneBillion).toString() + 'B' + suffix)
    } else if (quantileValues[0] >= oneMillion) {
      return quantileValues.map(x => prefix + (x / oneMillion).toString() + 'M' + suffix)
    } else if (quantileValues[0] >= 8000) {
      return quantileValues.map(x => prefix + (x / oneThousand).toString() + 'K' + suffix)
    } else { // quantileValues[0] < 8000
      return quantileValues.map(x => prefix + x.toString() + suffix)
    }
  }

  static normalizeZValues (Z, maxZ) {
    return _.map(Z, (z) => {
      return z / maxZ
    })
  }

  static setupBubbles (vb, Zquartiles, legend, pointRadius) {
    const rTop = this.normalizedZtoRadius(pointRadius, Zquartiles.top.val / Zquartiles.top.val)
    const rMid = this.normalizedZtoRadius(pointRadius, Zquartiles.mid.val / Zquartiles.top.val)
    const rBot = this.normalizedZtoRadius(pointRadius, Zquartiles.bot.val / Zquartiles.top.val)
    const cx = vb.x + vb.width + (legend.getWidth() / 2)
    const viewBoxYBottom = vb.y + vb.height
    const bubbleTextPadding = 5
    legend.setBubblesMaxWidth(rTop * 2)
    legend.setBubbles([
      {
        cx,
        cy: viewBoxYBottom - rTop,
        r: rTop,
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding,
        text: Zquartiles.top.lab,
      },
      {
        cx,
        cy: viewBoxYBottom - rMid,
        r: rMid,
        x: cx,
        y: viewBoxYBottom - (2 * rMid) - bubbleTextPadding,
        text: Zquartiles.mid.lab,
      },
      {
        cx,
        cy: viewBoxYBottom - rBot,
        r: rBot,
        x: cx,
        y: viewBoxYBottom - (2 * rBot) - bubbleTextPadding,
        text: Zquartiles.bot.lab,
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
