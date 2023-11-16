const express = require('express')
const {
  getUsers,
  getUserById,
  patchUser,
  patchAvatar,
  infoUser,
} = require('../controllers/users')

const userRouter = express.Router()

userRouter.get('/me', infoUser) //  получение данных пользователя необходимо поместить выше, чтобы не было путаницы с /:idUser
userRouter.patch('/me', patchUser) //  обновление данных пользователя
userRouter.patch('/me/avatar', patchAvatar) // обновление аватара пользователя

userRouter.get('/', getUsers) // получение всех пользователей
userRouter.get('/:idUser', getUserById) // получение одного пользователя по id

module.exports = userRouter
