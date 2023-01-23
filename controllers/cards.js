const mongoose = require('mongoose');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch((err) => {
      res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  const owner = req.user._id;
  Card.findById({ _id: cardId }).orFail(new Error('Not Found'))
    .then((card) => {
      if (owner === card.owner.toString()) {
        res.status(500).send({ message: 'Вы не владелец карточки' });
      }
      Card.deleteOne({ _id: cardId })
      // res.status(200).send(`${owner} ${card.owner}`);
        .then((deletedCard) => {
          res.status(200).send(deletedCard);
        });
    })
    .catch((err) => {
      if (err.message === 'Not Found') {
        return res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: 'Не корректный _id', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).orFail(new Error('Not Found'))

    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.message === 'Not Found') {
        return res.status(404).send({ message: 'Карточка с указанным _id не найдена', err });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: 'Не корректный _id', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).orFail(new Error('Not Found'))

    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.message === 'Not Found') {
        return res.status(404).send({ message: 'Карточка с указанным _id не найдена', err });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: 'Не корректный _id', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
