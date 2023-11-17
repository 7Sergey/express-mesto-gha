const {
  NOT_FOUND_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
} = require('../constants/constants')

const Card = require('../models/Card')

const getCards = async (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send(cards)
    })
    .catch(next)
}

const createCard = async (req, res, next) => {
  const { name, link } = req.body
  const owner = req.user._id
  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card })
    })
    .catch(next)
}

const deleteCard = (req, res, next) => {
  const { idCard } = req.params

  Card.findById(idCard)
    .then((card) => {
      if (!card) {
        const err = new Error('Карта не найдена')
        err.statusCode = NOT_FOUND_ERROR_CODE
        next(err)
        return
      }
      // Проверяем, является ли текущий пользователь создателем карточки
      if (card.owner.toString() !== req.user._id) {
        const err = new Error('Нет прав для удаления этой карточки')
        err.statusCode = UNAUTHORIZED_ERROR_CODE
        next(err)
        return
      }
      // Если пользователь - создатель, то удаляем карточку
      Card.deleteOne(card)
    })
    .then((card) => {
      res.send({ data: card })
    })
    .catch(next)
}

const likeCard = async (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.idCard,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const err = new Error('Карта не найдена')
        err.statusCode = NOT_FOUND_ERROR_CODE
        next(err)
        return
      }
      res.send({ data: card })
    })
    .catch(next)
}

const dislikeCard = async (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.idCard,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const err = new Error('Карта не найдена')
        err.statusCode = NOT_FOUND_ERROR_CODE
        next(err)
        return
      }
      res.send({ data: card })
    })
    .catch(next)
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
}
