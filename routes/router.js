const express = require('express')
const { celebrate, Joi } = require('celebrate')

const userRouter = require('./users')
const cardRouter = require('./cards')
const { login, createUser } = require('../controllers/users')
const { auth } = require('../middlewares/auth')
const NotFoundError = require('../errors/not-found')

const router = express.Router()

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт')
  }, 0)
})
// роуты логина и регистрации
router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().min(2).max(30),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
)

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().min(2).max(30),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(
        /^(https?:\/\/)www\.[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=,]+#?$/,
      ),
    }),
  }),
  createUser,
)
// защищенные роуты ниже
router.use(auth)
router.use('/users', userRouter)
router.use('/cards', cardRouter)

router.use((req, res, next) => {
  const err = new NotFoundError('Такой страницы не существует')
  next(err)
})

module.exports = router
