const express = require('express')
const { celebrate, Joi } = require('celebrate')

const {
  getUsers,
  getUserById,
  patchUser,
  patchAvatar,
  getCurrentUser,
} = require('../controllers/users')

const userRouter = express.Router()

userRouter.get('/me', getCurrentUser) //  получение данных пользователя необходимо поместить выше, чтобы не было путаницы с /:idUser
userRouter.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  patchUser,
) //  обновление данных пользователя
userRouter.patch('/me/avatar', patchAvatar) // обновление аватара пользователя
userRouter.get('/', getUsers) // получение всех пользователей
userRouter.get('/:idUser', getUserById) // получение одного пользователя по id

module.exports = userRouter
