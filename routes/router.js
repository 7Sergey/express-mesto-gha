const express = require('express')
const { NOT_FOUND_ERROR_CODE } = require('../constants/constants')
const userRouter = require('./users')
const cardRouter = require('./cards')
const { login, createUser } = require('../controllers/users')

const router = express.Router()
router.use('/users', userRouter)
router.use('/cards', cardRouter)

// роуты логина и регистрации
router.post('/signin', login)
router.post('/signup', createUser)

router.use((req, res) => {
  res
    .status(NOT_FOUND_ERROR_CODE)
    .send({ message: 'Такой страницы не сущетвует' })
})

module.exports = router
