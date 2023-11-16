const jwt = require('jsonwebtoken') // импортируем модуль jsonwebtoken
const {
  SERVER_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
} = require('../constants/constants')

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
    if (error.message === 'NotAuthenticate') {
      return res.status(UNAUTHORIZED_ERROR_CODE).send({
        message:
          'Для доступа к защищенным страницам необходимо авторизоваться.',
      })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.send({
        message: 'С токеном что-то не так',
      })
    }
    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: 'Ошибка на стороне сервера' })
  }
  // присваиваем айди пользователя для удаления/добавления лайков
  req.user = payload
  // добавил return, чтобы линтер не ругался
  return next()
}

module.exports = {
  auth,
}
