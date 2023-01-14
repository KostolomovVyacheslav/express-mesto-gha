const mongoose = require('mongoose');
const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId).orFail(new Error('Not Found'))

    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'Not Found') {
        return res.status(404).send({ message: 'Пользователь с указанным _id не найден', err });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: 'Не корректный _id', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const createUser = (req, res) => {
  User.create(req.body)

    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const profileUpdate = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  ).orFail(new Error('Not Found'))

    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'Not Found') {
        return res.status(404).send({ message: 'Пользователь с указанным _id не найден', err });
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const avatarUpdate = async (req, res) => {
  try {
    const newAvatar = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true, runValidators: true,
    });
    return res.status(200).send(newAvatar);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара', err });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка', err });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  profileUpdate,
  avatarUpdate,
};
