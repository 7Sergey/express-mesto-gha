const bcrypt = require('bcryptjs') // импортируем bcrypt
const User = require('../models/User')

const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
  SALT_ROUNDS,
  MONGO_DUPLICATE_ERROR_CODE,
  CONFLICT_ERROR_CODE,
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
      .orFail(() => new Error('NotAutanticate'))
    // сравниваем пароли
    const mathed = await bcrypt.compare(String(password), user.password)
    //  выбрасываем новую ошибку, если не совпадают
    if (!mathed) {
      throw new Error('NotAutanticate')
    }
    const token = generateToken({ _id: user._id })
    res.cookie('userToken', token, {
      httpOnly: true,
      sameSite: true,
      maxAge: 360000,
    })
    return res.send({ email: user.email })
  } catch (error) {
    if (error.message === 'NotAutanticate') {
      return res.send({
        message:
          'Неверные учетные данные. Пожалуйста, войдите с правильным email и паролем.',
      })
    }
    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: 'Ошибка на стороне сервера' })
  }
}
module.exports = {
  getUsers,
  getUserById,
  createUser,
  patchUser,
  patchAvatar,
  login,
}
