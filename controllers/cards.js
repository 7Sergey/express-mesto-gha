const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require("../constants/constants");

const Card = require("../models/Card");

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    res
      .status(SERVER_ERROR_CODE)
      .send({ message: "Произошла ошибка на сервере" });
  }
};
const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    Card.create({ name, link, owner }).then((Card) => res.send({ data: Card }));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(CLIENT_ERROR_CODE)
        .send({ message: "Ошибка валидации полей" });
    }
  }
};

const deleteCard = async (req, res) => {
  try {
    const { idCard } = req.params; //получаем передаваемый через /:idCard

    Card.findByIdAndRemove(idCard).then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Карта не найдена" });
      } else {
        res.send({ data: card });
      }
    });
  } catch (error) {
    res
      .status(SERVER_ERROR_CODE)
      .send({ message: "Произошла ошибка на сервере" });
  }
};

const likeCard = async (req, res) => {
  try {
    Card.findByIdAndUpdate(
      req.params.idCard,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Карта не найдена" });
      } else {
        res.send({ data: card });
      }
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(CLIENT_ERROR_CODE).send({ message: "Некорректный формат ID" });
    } else {
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: "Произошла ошибка на сервере" });
    }
  }
};

const dislikeCard = async (req, res) => {
  try {
    Card.findByIdAndUpdate(
      req.params.idCard,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true }
    ).then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Карта не найдена" });
      } else {
        res.send({ data: card });
      }
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(CLIENT_ERROR_CODE).send({ message: "Некорректный формат ID" });
    } else {
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: "Произошла ошибка на сервере" });
    }
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
