const User = require("../models/User");

const getUsers = async (req, res) => {
  console.log("getUsers");
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
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
    res.status(200).send(user); //вернули пользователя
  } catch (error) {
    if (error.message === "NotFound") {
      return res.status(404).send({ message: "Пользователь по id не найден" });
    }
    if (error.name === "CastError") {
      return res.status(400).send({ message: "Передан невалидный id" });
    }
    return res.status(500).send({ message: "Ошибка на стороне сервера" });
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
        .status(400)
        .send({ message: "Ошибка валидации полей", ...error });
    }
  }
  console.log("createUser");
};

const patchUser = async (req, res) => {
  try {
    console.log("пробуем обносить");

    User.findByIdAndUpdate(req.user._id, req.body) //передаю в медот айди пользователя и объект с данными для обновления

      .then((user) => {
        res.send({ data: user });
      });
  } catch (error) {
    if (error.message === "NotFound") {
      return res.status(404).send({ message: "Пользователь по id не найден" });
    }
    if (error.name === "CastError") {
      return res.status(400).send({ message: "Передан невалидный id" });
    }
    return res.status(500).send({ message: "Ошибка на стороне сервера" });
  }
};

const patchAvatar = async (req, res) => {
  try {
    console.log("пробуем обносить");

    User.findByIdAndUpdate(req.user._id, req.body) //передаю в медот айди и объект с данными для обновления

      .then((user) => {
        console.log(req.body);
        console.log(user);
        res.send({ data: user });
      });
  } catch (error) {
    if (error.message === "NotFound") {
      return res.status(404).send({ message: "Пользователь по id не найден" });
    }
    if (error.name === "CastError") {
      return res.status(400).send({ message: "Передан невалидный id" });
    }
    return res.status(500).send({ message: "Ошибка на стороне сервера" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  patchUser,
  patchAvatar,
};
