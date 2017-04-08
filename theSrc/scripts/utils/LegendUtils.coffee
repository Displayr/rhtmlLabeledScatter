class LegendUtils
  instance = null

  @get: ->
    if not instance?
      instance = new LU()
    instance

  class LU
    exponentialShortForms =
        3:  'k'   #thousand
        6:  'm'   #million
        9:  'b'   #billion
        12: 't'   #trillion
        15: 'qd'  #quadrillion
        18: 'qt'  #quintillion
        21: 'sxt' #sextillion
        24: 'spt' #septillion
        27: 'oct' #octillian
        30: 'nn'  #nonillian
        33: 'dc'  #decillian

    constructor: ->

    getExponentialShortForm: (val) ->
      exponentialShortForms[val]

    normalizedZtoRadius: (viewBoxDim, normZval) ->
       Math.sqrt(viewBoxDim.width*viewBoxDim.height/16/Math.PI)*normZval

    calcZQuartiles: (data, maxZ) ->
      getZLabel = (val, maxZ, precision) ->
        Math.sqrt((maxZ * val).toPrecision(precision)/maxZ/Math.PI)

      getExponential = (num) ->
        num.toExponential().split('e')[1]

      # Quartiles that determine size of each of the legend bubbles in proportion to maximum Z val
      topQ = 0.8
      midQ = 0.4
      botQ = 0.1

      topQuartileZ = (maxZ*topQ)

      # VIS-262: Compensate for inconsistent sig figs in legend
      differenceInExponentials = Math.abs(getExponential(topQuartileZ) - getExponential(midQ*topQuartileZ))
      precision = if differenceInExponentials < 1 then 1 else 2
      topQuartileZ = topQuartileZ.toPrecision(precision)

      # Calculations necessary to figure out which short form to apply
      exp = Math.log(topQuartileZ)
      exp = Math.round(exp*100000)/100000
      exp /= Math.LN10
      expDecimal = exp%1
      exp -= expDecimal
      digitsBtwnShortForms = exp % 3
      exp -= digitsBtwnShortForms
      exp_shortForm = @getExponentialShortForm exp
      unless exp_shortForm?
        exp_shortForm = ''

      topQuartileVal = topQuartileZ / 10**exp

      data.Zquartiles =
        top:
          val: topQuartileVal + exp_shortForm
          lab: getZLabel topQ, maxZ, precision
        mid:
          val: (topQuartileZ * midQ).toPrecision(1)/10**exp
          lab: getZLabel midQ, topQuartileZ, 1
        bot:
          val: (topQuartileZ * botQ).toPrecision(1)/10**exp
          lab: getZLabel botQ, topQuartileZ, 1

    normalizeZValues: (data, maxZ) ->
      for z, i in data.Z
        normalizedArea = z/maxZ
        data.normZ[i] = Math.sqrt(normalizedArea/Math.PI)

    setupBubbles: (data) ->
      viewBoxDim = data.viewBoxDim
      Zquartiles = data.Zquartiles
      legendDim = data.legendDim

      rTop = @normalizedZtoRadius viewBoxDim, Zquartiles.top.lab
      rMid = @normalizedZtoRadius viewBoxDim, Zquartiles.mid.lab
      rBot = @normalizedZtoRadius viewBoxDim, Zquartiles.bot.lab
      cx = viewBoxDim.x + viewBoxDim.width + legendDim.width/2
      viewBoxYBottom = viewBoxDim.y + viewBoxDim.height
      bubbleTextPadding = 5

      data.legendBubblesMaxWidth = rTop*2
      data.legendBubbles = [
        {
          cx: cx
          cy: viewBoxYBottom - rTop
          r: rTop
          x: cx
          y: viewBoxYBottom - 2*rTop - bubbleTextPadding
          text: Zquartiles.top.val
        },
        {
          cx: cx
          cy: viewBoxYBottom - rMid
          r: rMid
          x: cx
          y: viewBoxYBottom - 2*rMid - bubbleTextPadding
          text: Zquartiles.mid.val
        },
        {
          cx: cx
          cy: viewBoxYBottom - rBot
          r: rBot
          x: cx
          y: viewBoxYBottom - 2*rBot - bubbleTextPadding
          text: Zquartiles.bot.val
        }
      ]
      data.legendBubblesTitle = [
        {
          x: cx
          y: viewBoxYBottom - 2*rTop - bubbleTextPadding
        }
      ]
