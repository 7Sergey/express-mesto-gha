const express = require('express')
const { celebrate, Joi } = require('celebrate')

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards')

const cardRouter = express.Router()

cardRouter.get('/', getCards)
cardRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().pattern(
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      ),
    }),
  }),
  createCard,
)
cardRouter.delete('/:idCard', deleteCard)
cardRouter.put('/:idCard/likes', likeCard)
cardRouter.delete('/:idCard/likes', dislikeCard)

module.exports = cardRouter
