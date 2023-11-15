const jwt = require('jsonwebtoken') // импортируем модуль jsonwebtoken

const { SECRET_KEY, NODE_ENV } = process.env

const generateToken = (payloader) => {
  return jwt.sign(payloader, NODE_ENV ? SECRET_KEY : 'dev_secret', {
    expiresIn: 3600,
  })
}

module.exports = {
  generateToken,
}
