import _ from 'lodash'

class LegendUtils {
  static get exponentialShortForms () {
    return {
      3: 'k',    // thousand
      6: 'm',    // million
      9: 'b',    // billion
      12: 't',   // trillion
      15: 'qd',  // quadrillion
      18: 'qt',  // quintillion
      21: 'sxt', // sextillion
      24: 'spt', // septillion
      27: 'oct', // octillian
      30: 'nn',  // nonillian
      33: 'dc'  // decillian
    }
  }

  static getExponentialShortForm (val) {
    return this.exponentialShortForms[val]
  }

  static normalizedZtoRadius (viewBoxDim, normZval) {
    return Math.sqrt((viewBoxDim.width * viewBoxDim.height) / 16 / Math.PI) * normZval
  }

  // Calculates the sizes of the Legend bubble plots and the labels that go with them
  static getZQuartiles (maxZ) {
    const getZLabel = (val, max) => Math.sqrt((max * val) / max / Math.PI)

    const getExponential = num => Number(num.toExponential().split('e')[1]) - 1

    // Quartiles that determine size of each of the legend bubbles in proportion to maximum Z val
    const topQ = 0.9
    const midQ = 0.4
    const botQ = 0.1

    // Round to 2 sig figs in top and precision consistent across mid and bot
    // See VIS-262, VIS-319
    let topQuartileZ = (maxZ * topQ)
    topQuartileZ = Number(topQuartileZ.toPrecision(2)) // only use max 2 sig figs
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
    let midQuartileLabel = Number(_.round((maxZ * midQ), precision).toPrecision(1)) / (10 ** exp)
    let botQuartileLabel = Number(_.round((maxZ * botQ), precision).toPrecision(1)) / (10 ** exp)
    if (precision + exp >= 0) {
      topQuartileLabel = topQuartileLabel.toFixed(precision + exp)
      midQuartileLabel = midQuartileLabel.toFixed(precision + exp)
      botQuartileLabel = botQuartileLabel.toFixed(precision + exp)
    }

    const Zquartiles = {
      top: {
        lab: topQuartileLabel + expShortForm,
        val: getZLabel(topQ, maxZ, precision)
      },
      mid: {
        lab: midQuartileLabel + expShortForm,
        val: getZLabel(midQ, maxZ, 1)
      },
      bot: {
        lab: botQuartileLabel + expShortForm,
        val: getZLabel(botQ, maxZ, 1)
      }
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

  static setupBubbles (viewBoxDim, Zquartiles, legend) {
    const rTop = this.normalizedZtoRadius(viewBoxDim, Zquartiles.top.val)
    const rMid = this.normalizedZtoRadius(viewBoxDim, Zquartiles.mid.val)
    const rBot = this.normalizedZtoRadius(viewBoxDim, Zquartiles.bot.val)
    const cx = viewBoxDim.x + viewBoxDim.width + (legend.getWidth() / 2)
    const viewBoxYBottom = viewBoxDim.y + viewBoxDim.height
    const bubbleTextPadding = 5
    legend.setBubblesMaxWidth(rTop * 2)
    legend.setBubbles([
      {
        cx,
        cy: viewBoxYBottom - rTop,
        r: rTop,
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding,
        text: Zquartiles.top.lab
      },
      {
        cx,
        cy: viewBoxYBottom - rMid,
        r: rMid,
        x: cx,
        y: viewBoxYBottom - (2 * rMid) - bubbleTextPadding,
        text: Zquartiles.mid.lab
      },
      {
        cx,
        cy: viewBoxYBottom - rBot,
        r: rBot,
        x: cx,
        y: viewBoxYBottom - (2 * rBot) - bubbleTextPadding,
        text: Zquartiles.bot.lab
      }
    ])
    legend.setBubblesTitle([
      {
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding
      }
    ])
  }
}

module.exports = LegendUtils
