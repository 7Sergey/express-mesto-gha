const {
  NOT_FOUND_ERROR_CODE,
  CLIENT_ERROR_CODE,
  SERVER_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
} = require('../constants/constants')

const Card = require('../models/Card')
// const NotFoundError = require('../errors/not-found-err')

const getCards = async (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards)
    })
    .catch(() => {
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: 'Произошла ошибка на сервере' })
    })
}

const createCard = async (req, res) => {
  const { name, link } = req.body
  const owner = req.user._id
  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card })
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Ошибка валидации полей' })
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: 'Произошла ошибка на сервере' })
    })
}

const deleteCard = async (req, res) => {
  const { idCard } = req.params

  try {
    const card = await Card.findById(idCard)

    if (!card) {
      return res
        .status(NOT_FOUND_ERROR_CODE)
        .send({ message: 'Карта не найдена' })
    }

    // Проверяем, является ли текущий пользователь создателем карточки
    if (card.owner.toString() !== req.user._id) {
      return res
        .status(UNAUTHORIZED_ERROR_CODE)
        .send({ message: 'Нет прав для удаления этой карточки' })
    }

    // Если пользователь - создатель, то удаляем карточку
    const deletedCard = await Card.findByIdAndRemove(idCard)

    if (!deletedCard) {
      return res
        .status(NOT_FOUND_ERROR_CODE)
        .send({ message: 'Карта не найдена' })
    }

    return res.send({ data: deletedCard })
  } catch (error) {
    if (error.name === 'CastError') {
      return res
        .status(CLIENT_ERROR_CODE)
        .send({ message: 'Ошибка валидации полей' })
    }

    return res
      .status(SERVER_ERROR_CODE)
      .send({ message: 'Произошла ошибка на сервере' })
  }
}

const likeCard = async (req, res) => {
  console.log('req.user:', req.user)
  Card.findByIdAndUpdate(
    req.params.idCard,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Карта не найдена' })
      } else {
        res.send({ data: card })
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Некорректный формат ID' })
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: 'Произошла ошибка на сервере' })
      }
    })
}

const dislikeCard = async (req, res) => {
  Card.findByIdAndUpdate(
    req.params.idCard,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Карта не найдена' })
      } else {
        res.send({ data: card })
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res
          .status(CLIENT_ERROR_CODE)
          .send({ message: 'Некорректный формат ID' })
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: 'Произошла ошибка на сервере' })
      }
    })
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
}
