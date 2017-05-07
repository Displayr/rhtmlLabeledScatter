class LegendUtils {

  static get exponentialShortForms() {
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
      33: 'dc',  // decillian
    };
  }

  static getExponentialShortForm(val) {
    return this.exponentialShortForms[val];
  }

  static normalizedZtoRadius(viewBoxDim, normZval) {
    return Math.sqrt((viewBoxDim.width * viewBoxDim.height) / 16 / Math.PI) * normZval;
  }

  // KZ TODO remove 'data' side effect
  // Calculates the sizes of the Legend bubble plots and the labels that go with them
  static calcZQuartiles(data, maxZ) {
    const getZLabel = (val, max, precision) => Math.sqrt((max * val).toPrecision(precision) / max / Math.PI);

    const getExponential = num => num.toExponential().split('e')[1];

    // Quartiles that determine size of each of the legend bubbles in proportion to maximum Z val
    const topQ = 0.9;
    const midQ = 0.4;
    const botQ = 0.1;

    let topQuartileZ = (maxZ * topQ);

    // VIS-262: Compensate for inconsistent sig figs in legend
    const differenceInExponentials = Math.abs(getExponential(topQuartileZ) - getExponential(midQ * topQuartileZ));
    const isTopQuartileExponentialOne = (getExponential(topQuartileZ) === 1);
    const precision = (differenceInExponentials < 1 && isTopQuartileExponentialOne) ? 1 : 2;
    topQuartileZ = topQuartileZ.toPrecision(precision);

    // Calculations necessary to figure out which short form to apply
    let exp = Math.log(topQuartileZ);
    exp = Math.round(exp * 100000) / 100000;
    exp /= Math.LN10;

    const expDecimal = exp % 1;
    exp -= expDecimal;
    const digitsBtwnShortForms = exp % 3;
    exp -= digitsBtwnShortForms;
    const expShortForm = this.getExponentialShortForm(exp) || '';

    const topQuartileVal = topQuartileZ / (10 ** exp);

    data.Zquartiles = {
      top: {
        val: topQuartileVal + expShortForm,
        lab: getZLabel(topQ, maxZ, precision),
      },
      mid: {
        val: (topQuartileZ * midQ).toPrecision(1) / (10 ** exp),
        lab: getZLabel(midQ, topQuartileZ, 1),
      },
      bot: {
        val: (topQuartileZ * botQ).toPrecision(1) / (10 ** exp),
        lab: getZLabel(botQ, topQuartileZ, 1),
      },
    };
  }

  // TODO KZ remove side effect, just return the normalized array
  // Normalizes Z values so that the radius size reflects the actual pixel size in the rect plot
  static normalizeZValues(data, maxZ) {
    data.normZ = data.Z.map((z) => {
      const normalizedArea = z / maxZ;
      return Math.sqrt(normalizedArea / Math.PI);
    });
  }

  // TODO KZ remove side effect, just return the normalized array
  static setupBubbles(data) {
    const { viewBoxDim, Zquartiles, legendDim } = data;

    const rTop = this.normalizedZtoRadius(viewBoxDim, Zquartiles.top.lab);
    const rMid = this.normalizedZtoRadius(viewBoxDim, Zquartiles.mid.lab);
    const rBot = this.normalizedZtoRadius(viewBoxDim, Zquartiles.bot.lab);
    const cx = viewBoxDim.x + viewBoxDim.width + (legendDim.width / 2);
    const viewBoxYBottom = viewBoxDim.y + viewBoxDim.height;
    const bubbleTextPadding = 5;

    data.legendBubblesMaxWidth = rTop * 2;

    data.legendBubbles = [
      {
        cx,
        cy: viewBoxYBottom - rTop,
        r: rTop,
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding,
        text: Zquartiles.top.val,
      },
      {
        cx,
        cy: viewBoxYBottom - rMid,
        r: rMid,
        x: cx,
        y: viewBoxYBottom - (2 * rMid) - bubbleTextPadding,
        text: Zquartiles.mid.val,
      },
      {
        cx,
        cy: viewBoxYBottom - rBot,
        r: rBot,
        x: cx,
        y: viewBoxYBottom - (2 * rBot) - bubbleTextPadding,
        text: Zquartiles.bot.val,
      },
    ];

    data.legendBubblesTitle = [
      {
        x: cx,
        y: viewBoxYBottom - (2 * rTop) - bubbleTextPadding,
      },
    ];
  }
}

module.exports = LegendUtils;

