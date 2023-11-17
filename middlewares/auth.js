const jwt = require('jsonwebtoken') // импортируем модуль jsonwebtoken

const { SECRET_KEY, NODE_ENV } = process.env

function auth(req, res, next) {
  let payload
  try {
    const token = req.cookies.userToken

    if (!token) {
      throw new Error('NotAuthenticate')
    }
    const validTocken = token.replace('Bearer ', '')
    payload = jwt.verify(validTocken, NODE_ENV ? SECRET_KEY : 'dev_secret')
  } catch (error) {
    next(error)
    return
  }
  // присваиваем айди пользователя для удаления/добавления лайков
  req.user = payload
  next()
}

module.exports = {
  auth,
}
