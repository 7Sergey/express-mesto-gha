const { NOT_FOUND_ERROR_CODE } = require('../constants/constants')

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.statusCode = NOT_FOUND_ERROR_CODE
  }
}

module.exports = NotFoundError
