const bcrypt = require('bcryptjs') // импортируем bcrypt
const User = require('../models/User')
const authMiddleware = require('../middlewares/auth')

const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
  SALT_ROUNDS,
  MONGO_DUPLICATE_ERROR_CODE,
  CONFLICT_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
} = require('../constants/constants')
const { generateToken } = require('../utils/jwt')

const getUsers = async (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users)
    })
    .catch((error) => {
      res.status(SERVER_ERROR_CODE).send({ message: error.message })
    })
}

const getUserById = async (req, res) => {
  const { idUser } = req.params // Забирает id из адресной строки '/:id'

  return User.findById(idUser)
    .then((user) => {
      if (!user) {
        throw new Error('NotFound')
      }
      res.send(user) // Вернули пользователя
    })
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Пользователь по id не найден' })
      }
      if (error.name === 'CastError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Передан невалидный id' })
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: 'Ошибка на стороне сервера' })
    })
}

const createUser = async (req, res) => {
  try {
    // хешируем пароль
    const { name, about, avatar, email, password } = req.body
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const newUser = await User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
    return res.status(201).send(newUser)
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
      return res.status(CONFLICT_ERROR_CODE).send({
        message: 'Такой пользователь уже существует',
        errorCode: error.code,
      })
    }
    if (error.name === 'ValidationError') {
      return res
        .status(CLIENT_ERROR_CODE)
        .send({ message: 'Ошибка валидации полей' })
    }
    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: 'Ошибка на стороне сервера' })
  }
}

const patchUser = async (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, about: req.body.about },
    { new: true, runValidators: true },
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        const err = new Error('Пользователь по id не найден')
        err.statusCode = NOT_FOUND_ERROR_CODE
        next(err)
      }
      return res.send({ data: updatedUser })
    })

    .catch(next)
}

const patchAvatar = async (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      const err = new Error('Пользователь по id не найден')
      err.statusCode = NOT_FOUND_ERROR_CODE
      next(err)
    })
    .then((user) => {
      res.send({ data: user })
    })
    .catch(next)
}

const login = (req, res, next) => {
  const { email, password } = req.body

  let foundUser // Объявляем переменную здесь, чтобы она была видна в обоих блоках .then

  User.findOne({ email })
    .select('+password')
    .orFail(() => {
      const err = new Error(
        'Для доступа к защищенным страницам необходимо авторизоваться.',
      )
      err.statusCode = UNAUTHORIZED_ERROR_CODE
      next(err)
    })
    .then((user) => {
      foundUser = user
      return bcrypt.compare(String(password), user.password)
    })
    .then((matched) => {
      if (!matched) {
        const err = new Error(
          'Для доступа к защищенным страницам необходимо авторизоваться.',
        )
        err.statusCode = UNAUTHORIZED_ERROR_CODE
        next(err)
      }

      const token = generateToken({ _id: foundUser._id })
      res.cookie('userToken', token, {
        httpOnly: true,
        sameSite: true,
        // срок действия токена 1 неделя
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      return res.send({ email: foundUser.email })
    })
    .catch(next)
}

const infoUser = async (req, res, next) => {
  const userIdFromCookie = req.cookies
  if (userIdFromCookie) {
    // Здесь вы можете использовать userId для получения информации о текущем пользователе из вашей базы данных или другого источника
    // Пример: извлечение информации о пользователе из базы данных
    const user = User.findOne({ id: req.cookies })

    if (user) {
      res.send({ user })
    } else {
      const err = new Error('Пользователь не найден')
      err.statusCode = NOT_FOUND_ERROR_CODE
      next(err)
    }
  } else {
    // Если идентификатор пользователя отсутствует в куках, вернуть ошибку или пустой объект
    const err = new Error('Пользователь не аутентифицирован')
    err.statusCode = UNAUTHORIZED_ERROR_CODE
    next(err)
  }
}

const getCurrentUser = async (req, res, next) => {
  try {
    // Вызываем middleware аутентификации
    authMiddleware.auth(req, res, async () => {
      // Если аутентификация прошла успешно, продолжаем с обработкой запроса
      const currentUser = await User.findById(req.user._id)

      // Проверяем, существует ли пользователь
      if (!currentUser) {
        const err = new Error('Пользователь не найден')
        err.statusCode = NOT_FOUND_ERROR_CODE
      }

      // Отправляем информацию о пользователе в ответ
      return res.send(currentUser)
    })
  } catch (error) {
    next(error)
  }
  // Добавляем возврат для устранения ошибки eslintconsistent-return
  return null
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  patchUser,
  patchAvatar,
  login,
  infoUser,
  getCurrentUser,
}
