import _ from 'lodash'

class LegendUtils {
  static get exponentialShortForms () {
    return {
      3: 'k', // thousand
      6: 'm', // million
      9: 'b', // billion
      12: 't', // trillion
      15: 'qd', // quadrillion
      18: 'qt', // quintillion
      21: 'sxt', // sextillion
      24: 'spt', // septillion
      27: 'oct', // octillian
      30: 'nn', // nonillian
      33: 'dc', // decillian
    }
  }

  static getExponentialShortForm (val) {
    return this.exponentialShortForms[val]
  }

  static normalizedZtoRadius (scale, normZval) {
    // z values are multiplied by the point size and a constant multiplier (50/3)
    // the constant multiplier makes LabeledScatter behave consistently with flipStandardCharts::Scatter
    // it means that when point.radius = 3 (default), the largest marker will have a radius of 50 pixels
    return (normZval * scale * 50 / 3)
  }

  // Calculates the sizes of the Legend bubble plots and the labels that go with them
  static getZQuartiles (maxZ) {
    const maxSigFigsInTopQuartile = 3
    const getZVal = (val, max) => Math.sqrt((max * val) / max / Math.PI)

    const getExponential = num => Number(num.toExponential().split('e')[1]) - (maxSigFigsInTopQuartile - 1)

    // Check if mid and bot are < 1, remove 0 before decimal
    const removePrecedingZero = label => {
      if (_.isString(label) && label.charAt(0) === '0') {
        return label.substring(1, label.length)
      } else {
        return label
      }
    }

    // Quartiles that determine size of each of the legend bubbles in proportion to maximum Z val
    const topQ = 0.9
    const midQ = 0.4
    const botQ = 0.1

    // Round to 3 sig figs in top and precision consistent across mid and bot
    // See VIS-262, VIS-319
    let topQuartileZ = (maxZ * topQ)
    topQuartileZ = Number(topQuartileZ.toPrecision(maxSigFigsInTopQuartile))
    let topQexp = getExponential(topQuartileZ)
    let precision = topQexp * -1

    // Calculations necessary to figure out which short form to apply
    let exp = Math.log(topQuartileZ)
    exp = Math.round(exp * 100000) / 100000
    exp /= Math.LN10

    const expDecimal = exp % 1
    exp -= expDecimal
    const digitsBtwnShortForms = exp % 3
    exp -= digitsBtwnShortForms
    const expShortForm = this.getExponentialShortForm(exp) || ''

    let topQuartileLabel = topQuartileZ / (10 ** exp)
    let midQuartileLabel = Number(_.round((maxZ * midQ), precision)) / (10 ** exp)
    let botQuartileLabel = Number(_.round((maxZ * botQ), precision)) / (10 ** exp)
    if (precision + exp >= 0) {
      topQuartileLabel = topQuartileLabel.toFixed(precision + exp)
      midQuartileLabel = midQuartileLabel.toFixed(precision + exp)
      botQuartileLabel = botQuartileLabel.toFixed(precision + exp)
    }

    const Zquartiles = {
      top: {
        lab: topQuartileLabel + expShortForm,
        val: getZVal(topQ, maxZ, precision),
      },
      mid: {
        lab: removePrecedingZero(midQuartileLabel) + expShortForm,
        val: getZVal(midQ, maxZ),
      },
      bot: {
        lab: removePrecedingZero(botQuartileLabel) + expShortForm,
        val: getZVal(botQ, maxZ),
      },
    }
    return Zquartiles
  }

  // Normalizes Z values so that the radius size reflects the actual pixel size in the rect plot
  static normalizeZValues (Z, maxZ) {
    return _.map(Z, (z) => {
      const normalizedArea = z / maxZ
      return Math.sqrt(normalizedArea / Math.PI)
    })
  }

  static setupBubbles (vb, Zquartiles, legend, pointRadius) {
    const rTop = this.normalizedZtoRadius(pointRadius, Zquartiles.top.val)
    const rMid = this.normalizedZtoRadius(pointRadius, Zquartiles.mid.val)
    const rBot = this.normalizedZtoRadius(pointRadius, Zquartiles.bot.val)
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
