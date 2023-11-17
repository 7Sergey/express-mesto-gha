const express = require('express')
const { celebrate, Joi } = require('celebrate')

const { NOT_FOUND_ERROR_CODE } = require('../constants/constants')
const userRouter = require('./users')
const cardRouter = require('./cards')
const { login, createUser } = require('../controllers/users')
const { auth } = require('../middlewares/auth')

const router = express.Router()

// роуты логина и регистрации
router.post('/signin', login)

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
  const err = new Error('Такой страницы не существует')
  err.statusCode = NOT_FOUND_ERROR_CODE
  next(err)
})

module.exports = router
