const INSUFFICIENT_HEIGHT_ERROR = 'INSUFFICIENT_HEIGHT_ERROR'

class InsufficientHeightError extends Error {
  constructor () {
    super()
    this.message = INSUFFICIENT_HEIGHT_ERROR
    this.type = INSUFFICIENT_HEIGHT_ERROR
  }
}
InsufficientHeightError.type = INSUFFICIENT_HEIGHT_ERROR

module.exports = InsufficientHeightError
