const bcrypt = require('bcryptjs') // импортируем bcrypt
const User = require('../models/User')
const authMiddleware = require('../middlewares/auth')

const {
  NOT_FOUND_ERROR_CODE,
  SALT_ROUNDS,
  UNAUTHORIZED_ERROR_CODE,
} = require('../constants/constants')
const { generateToken } = require('../utils/jwt')

const getUsers = async (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users)
    })
    .catch(next)
}

const getUserById = async (req, res, next) => {
  const { idUser } = req.params // Забирает id из адресной строки '/:id'

  return User.findById(idUser)
    .then((user) => {
      if (!user) {
        throw new Error('NotFound')
      }
      res.send(user) // Вернули пользователя
    })
    .catch(next)
}
const createUser = async (req, res, next) => {
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

    // Создаем новый объект пользователя без хеша
    const userWithoutHash = {
      _id: newUser._id,
      name: newUser.name,
      about: newUser.about,
      avatar: newUser.avatar,
      email: newUser.email,
    }
    // вернем пользователя без хеша
    res.status(201).send({ data: userWithoutHash })
  } catch (error) {
    next(error)
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
        return
      }
      res.send({ data: updatedUser })
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
        return
      }

      const token = generateToken({ _id: foundUser._id })
      res.cookie('userToken', token, {
        httpOnly: true,
        sameSite: true,
        // срок действия токена 1 неделя
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.send({ email: foundUser.email })
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
