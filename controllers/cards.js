const mongoose = require('mongoose');
const Card = require('../models/card');
const NotFoundError = require('../errors/404-not-found-error');
const BadRequest = require('../errors/400-bad-request-err');
const ServerError = require('../errors/500-Internal-server-error');
const ForbiddenError = require('../errors/401-forbidden');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch((err) => {
      throw new ServerError('На сервере произошла ошибка', err);
    })
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные при создании карточки', err);
      }
      throw new ServerError('На сервере произошла ошибка', err);
    })
    .catch((err) => next(err));
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  if (!cardId) {
    // res.status(403).send({ message: 'Не правильный id' });
    throw new BadRequest('Переданы некорректные данные');
  }
  const owner = req.user._id;
  Card.findById({ _id: cardId }).orFail(new Error('Not Found'))
    .then((card) => {
      if (owner !== card.owner.toString()) {
        throw new ForbiddenError('В доступе отказано');
      }
      Card.deleteOne({ _id: cardId })
        .then((deletedCard) => {
          res.status(200).send(deletedCard);
        });
    })
    .catch((err) => {
      if (err.message === 'Not Found') {
        throw new NotFoundError('Карточка с указанным _id не найдена', err);
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest('Не корректный _id', err);
      }
      throw new ServerError('На сервере произошла ошибка', err);
    })
    .catch((err) => next(err));
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).orFail(() => {
    throw new NotFoundError('Карточка с указанным _id не найдена');
  })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest('Не корректный _id', err);
      }
      throw new ServerError('На сервере произошла ошибка', err);
    })
    .catch((err) => next(err));
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).orFail(new Error('Not Found'))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.message === 'Not Found') {
        throw new NotFoundError('Карточка с указанным _id не найдена', err);
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest('Не корректный _id', err);
      }
      throw new ServerError('На сервере произошла ошибка', err);
    })
    .catch((err) => next(err));
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
