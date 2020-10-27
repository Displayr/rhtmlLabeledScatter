const INSUFFICIENT_WIDTH_ERROR = 'INSUFFICIENT_WIDTH_ERROR'

class InsufficientWidthError extends Error {
  constructor () {
    super()
    this.message = INSUFFICIENT_WIDTH_ERROR
    this.type = INSUFFICIENT_WIDTH_ERROR
  }
}
InsufficientWidthError.type = INSUFFICIENT_WIDTH_ERROR

module.exports = InsufficientWidthError
