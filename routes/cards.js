const express = require('express')
const { celebrate, Joi, Segments } = require('celebrate')

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
cardRouter.delete(
  '/:idCard',
  celebrate({
    [Segments.PARAMS]: {
      idCard: Joi.string().alphanum().length(24).required(),
    },
  }),
  deleteCard,
)
cardRouter.put(
  '/:idCard/likes',
  celebrate({
    [Segments.PARAMS]: {
      idCard: Joi.string().alphanum().length(24).required(),
    },
  }),
  likeCard,
)
cardRouter.delete(
  '/:idCard/likes',
  celebrate({
    [Segments.PARAMS]: {
      idCard: Joi.string().alphanum().length(24).required(),
    },
  }),
  dislikeCard,
)

module.exports = cardRouter
