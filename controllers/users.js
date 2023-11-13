const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require("../constants/constants");

const User = require("../models/User");

const getUsers = async (req, res) => {
  console.log("getUsers");
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    res.status(SERVER_ERROR_CODE).send({ message: error.message });
  }
};
const getUserById = async (req, res) => {
  try {
    const { idUser } = req.params; //забирает id из адремной строки '/:id'
    const user = await User.findById(idUser); //пердаем айди в метод поиска по айди
    if (!user) {
      //проверка на наличие пользователя
      throw new Error("NotFound");
    }
    res.send(user); //вернули пользователя
  } catch (error) {
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
  }
};
const createUser = async (req, res) => {
  try {
    console.log(req.body);
    const newUser = await new User(req.body);
    return res.status(201).send(await newUser.save());
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(CLIENT_ERROR_CODE)
        .send({ message: "Ошибка валидации полей" });
    } else {
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "Ошибка на стороне сервера" });
    }
  }
};

const patchUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name, about: req.body.about },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(NOT_FOUND_ERROR_CODE)
        .send({ message: "Пользователь по id не найден" });
    }
    res.send({ data: updatedUser });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(CLIENT_ERROR_CODE)
        .send({ message: "Передан невалидный id" });
    }
    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: "Ошибка на стороне сервера" });
  }
};

const patchAvatar = async (req, res) => {
  try {
    User.findByIdAndUpdate(req.user._id, req.body)
      .orFail(() => {
        throw new Error("NotFound");
      }) //передаю в медот айди и объект с данными для обновления

      .then((user) => {
        console.log(req.body);
        console.log(user);
        res.send({ data: user });
      });
  } catch (error) {
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
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  patchUser,
  patchAvatar,
};
