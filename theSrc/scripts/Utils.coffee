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
