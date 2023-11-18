const { FORBIDDEN_ERROR_CODE } = require('../constants/constants')

class Forbidden extends Error {
  constructor(message) {
    super(message)
    this.statusCode = FORBIDDEN_ERROR_CODE
  }
}

module.exports = Forbidden
