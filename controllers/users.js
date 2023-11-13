const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require("../constants/constants");

const User = require("../models/User");

const getUsers = async (req, res) => {
  User.find({})
    .then((users) => {
      return res.send(users);
    })
    .catch((error) => {
      res.status(SERVER_ERROR_CODE).send({ message: error.message });
    });
};

const getUserById = async (req, res) => {
  const { idUser } = req.params; // Забирает id из адресной строки '/:id'

  return User.findById(idUser)
    .then((user) => {
      if (!user) {
        throw new Error("NotFound");
      }
      res.send(user); // Вернули пользователя
    })
    .catch((error) => {
      if (error.message === "NotFound") {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: "Пользователь по id не найден" });
      }
      if (error.name === "CastError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Передан невалидный id" });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "Ошибка на стороне сервера" });
    });
};

const createUser = async (req, res) => {
  const newUser = new User(req.body);

  return newUser
    .save()
    .then((savedUser) => {
      return res.status(201).send(savedUser);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Ошибка валидации полей" });
      } else {
        return res
          .status(SERVER_ERROR_CODE)
          .send({ message: "Ошибка на стороне сервера" });
      }
    });
};

const patchUser = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, about: req.body.about },
    { new: true, runValidators: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: "Пользователь по id не найден" });
      }
      res.send({ data: updatedUser });
    })

    .catch((error) => {
      if (error.name === "ValidationError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Ошибка валидации полей" });
      }
      if (error.name === "CastError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Передан невалидный id" });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "Ошибка на стороне сервера" });
    });
};

const patchAvatar = async (req, res) => {
  User.findByIdAndUpdate(req.user._id, req.body)
    .orFail(() => {
      throw new Error("NotFound");
    })
    .then((user) => {
      console.log(req.body);
      console.log(user);
      res.send({ data: user });
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Ошибка валидации полей" });
      }
      if (error.message === "NotFound") {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: "Пользователь по id не найден" });
      }
      if (error.name === "ValidationError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Ошибка валидации полей" });
      }
      if (error.name === "CastError") {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: "Передан невалидный id" });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "Ошибка на стороне сервера" });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  patchUser,
  patchAvatar,
};
