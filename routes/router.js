const express = require('express')
const { celebrate, Joi } = require('celebrate')

const { NOT_FOUND_ERROR_CODE } = require('../constants/constants')
const userRouter = require('./users')
const cardRouter = require('./cards')
const { login, createUser } = require('../controllers/users')
const { auth } = require('../middlewares/auth')

const router = express.Router()
router.use('/users', auth, userRouter)
router.use('/cards', auth, cardRouter)

// роуты логина и регистрации
router.post('/signin', login)

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().min(2).max(30),
      password: Joi.string().required().min(8),
    }),
  }),
  createUser,
)

router.use((req, res) => {
  res
    .status(NOT_FOUND_ERROR_CODE)
    .send({ message: 'Такой страницы не сущетвует' })
})

module.exports = router
