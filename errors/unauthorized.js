const { UNAUTHORIZED_ERROR_CODE } = require('../constants/constants')

class UnauthorizedError extends Error {
  constructor(message) {
    super(message)
    this.statusCode = UNAUTHORIZED_ERROR_CODE
  }
}

module.exports = UnauthorizedError
