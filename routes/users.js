const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  patchUser,
  patchAvatar,
} = require('../controllers/users');

const userRouter = express.Router();

userRouter.get('/', getUsers); // получение всех пользователей
userRouter.get('/:idUser', getUserById); // получение одного пользователя по id
userRouter.post('/', createUser); //  создание нового пользователя

userRouter.patch('/me', patchUser); //  обновление данных пользователя
userRouter.patch('/me/avatar', patchAvatar); // обновление аватара пользователя

module.exports = userRouter;
