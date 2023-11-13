const express = require('express');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const cardRouter = express.Router();

cardRouter.get('/', getCards);
cardRouter.post('/', createCard);
cardRouter.delete('/:idCard', deleteCard);

cardRouter.put('/:idCard/likes', likeCard);
cardRouter.delete('/:idCard/likes', dislikeCard);

module.exports = cardRouter;
