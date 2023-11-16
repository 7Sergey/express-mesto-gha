const { MONGO_DUPLICATE_ERROR_CODE } = require('../constants/constants')

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof CustomError)) {
    console.error(err) // Логгируем ошибку для отладки
    error = new CustomError('На сервере произошла ошибка', 500)
  }

  if (error.name === 'ValidationError') {
    error = new CustomError('Ошибка валидации полей', 400)
  }

  if (error.name === 'CastError') {
    error = new CustomError('Передан невалидный id', 400)
  }

  if (error.message === 'NotFound') {
    error = new CustomError('Пользователь по id не найден', 404)
  }

  if (error.message === 'NotAuthenticate') {
    error = new CustomError(
      'Для доступа к защищенным страницам необходимо авторизоваться.',
      401,
    )
  }

  if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
    error = new CustomError('Такой пользователь уже существует', 409)
  }

  res.status(error.statusCode).json({ message: error.message })
}

module.exports = { CustomError, errorHandler }
