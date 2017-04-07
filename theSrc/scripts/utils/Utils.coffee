class Utils
  instance = null

  @get: ->
    if not instance?
      instance = new U()
    instance

  class U
    constructor: ->

    isNum: (num) -> num? and typeof num == 'number'

    isArr: (arr) -> arr? and arr instanceof Array

    isArrOfNums: (arr) -> @isArr(arr) and _.every(arr, (n) -> _.isFinite(n))

    getSuperscript: (id) ->
      superscript = [8304, 185, 178, 179, 8308, 8309, 8310, 8311, 8312, 8313] # '⁰¹²³⁴⁵⁶⁷⁸⁹'
      ss = ''
      while id > 0
        digit = id % 10
        ss = String.fromCharCode(superscript[id % 10]) + ss
        id = (id - digit)/10
      ss

    getFormattedNum: (num, decimals, prefix, suffix) ->
      prefix + (new BigNumber(num)).toFormat(decimals) + suffix
      # prefix + Number(num).toFixed(decimals) + suffix
