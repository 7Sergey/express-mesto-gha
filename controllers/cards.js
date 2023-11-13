const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require('../constants/constants');

const Card = require('../models/Card');

const getCards = async (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => {
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: 'Произошла ошибка на сервере' });
    });
};

const createCard = async (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Ошибка валидации полей' });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: 'Произошла ошибка на сервере' });
    });
};

const deleteCard = async (req, res) => {
  const { idCard } = req.params;

  Card.findByIdAndRemove(idCard)
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Карта не найдена' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Ошибка валидации полей' });
      }
      res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка на сервере' });
    });
};

const likeCard = async (req, res) => {
  Card.findByIdAndUpdate(
    req.params.idCard,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Карта не найдена' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Некорректный формат ID' });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: 'Произошла ошибка на сервере'});
      }
    });
};

const dislikeCard = async (req, res) => {
  Card.findByIdAndUpdate(
    req.params.idCard,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Карта не найдена' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Некорректный формат ID'});
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: 'Произошла ошибка на сервере'});
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
