const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/404-NotFoundError');
const BadRequest = require('../errors/400-BadRequestError');
const ServerError = require('../errors/500-ServerError');
const ConflictError = require('../errors/409-ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(() => {
      throw new ServerError('На сервере произошла ошибка');
    })
    .catch(next);
};

const getSelfInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(() => {
      throw new BadRequest('Переданы некорректные данные');
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'CastError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(new ServerError('На сервере произошла ошибка'));
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) {
    throw new BadRequest('Переданы некорректные данные');
  }
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        data: {
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные при создании пользователя');
      } else if (err.code === 11000) {
        throw new ConflictError('Данный адрес электронной почты уже используется');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const profileUpdate = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  ).orFail(() => {
    throw new NotFoundError('Пользователь по указанному id не найден');
  })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'Not Found') {
        throw new NotFoundError('Пользователь с указанным id не найден');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при обновлении профиля');
      }
      throw new ServerError('На сервере произошла ошибка');
    })
    .catch(next);
};

const avatarUpdate = async (req, res, next) => {
  try {
    const newAvatar = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true, runValidators: true,
    });
    res.status(200).send(newAvatar);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
    } else {
      next(new ServerError('На сервере произошла ошибка'));
    }
  }
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        `${NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key'}`,
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24,
      }).send({ token });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  getSelfInfo,
  createUser,
  profileUpdate,
  avatarUpdate,
  login,
};
