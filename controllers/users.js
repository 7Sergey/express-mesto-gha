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

const patchUser = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, about: req.body.about },
    { new: true, runValidators: true },
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Пользователь по id не найден' })
      }
      return res.send({ data: updatedUser })
    })

    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Ошибка валидации полей' })
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

const patchAvatar = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      throw new Error('NotFound')
    })
    .then((user) => {
      res.send({ data: user })
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Ошибка валидации полей' })
      }
      if (error.message === 'NotFound') {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Пользователь по id не найден' })
      }
      if (error.name === 'ValidationError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Ошибка валидации полей' })
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

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
      .select('+password')
      .orFail(() => new Error('NotAuthenticate'))
    // сравниваем пароли
    const mathed = await bcrypt.compare(String(password), user.password)
    //  выбрасываем новую ошибку, если не совпадают
    if (!mathed) {
      throw new Error('NotAuthenticate')
    }
    const token = generateToken({ _id: user._id })
    res.cookie('userToken', token, {
      httpOnly: true,
      sameSite: true,
      // срок действия токена 1 неделя
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.send({ email: user.email })
  } catch (error) {
    if (error.message === 'NotAuthenticate') {
      return res.status(UNAUTHORIZED_ERROR_CODE).send({
        message:
          'Для доступа к защищенным страницам необходимо авторизоваться.',
      })
    }
    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: 'Ошибка на стороне сервера' })
  }
}

const infoUser = async (req, res) => {
  const userIdFromCookie = req.cookies
  console.log(req.cookies)
  if (userIdFromCookie) {
    // Здесь вы можете использовать userId для получения информации о текущем пользователе из вашей базы данных или другого источника
    // Пример: извлечение информации о пользователе из базы данных
    const user = User.findOne({ id: req.cookies })

    if (user) {
      res.send({ user })
    } else {
      res.status(404).json({ error: 'Пользователь не найден' })
    }
  } else {
    // Если идентификатор пользователя отсутствует в куках, вернуть ошибку или пустой объект
    res.status(401).json({ error: 'Пользователь не аутентифицирован' })
  }
}

const getCurrentUser = async (req, res) => {
  try {
    // Вызываем middleware аутентификации
    authMiddleware.auth(req, res, async () => {
      // Если аутентификация прошла успешно, продолжаем с обработкой запроса
      const currentUser = await User.findById(req.user._id)

      // Проверяем, существует ли пользователь
      if (!currentUser) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Пользователь не найден' })
      }

      // Отправляем информацию о пользователе в ответ
      return res.send(currentUser)
    })
  } catch (error) {
    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: 'Ошибка на стороне сервера' })
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
