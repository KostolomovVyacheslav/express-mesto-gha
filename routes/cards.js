const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required(),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    id: Joi.string().required().hex().length(24),
  }),
}), deleteCard);

router.put('/:cardId/likes', likeCard);

router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
