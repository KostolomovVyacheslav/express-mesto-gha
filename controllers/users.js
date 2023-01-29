// const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/404-NotFoundError');
const BadRequest = require('../errors/400-BadRequestError');
const ServerError = require('../errors/500-ServerError');
const ConflictError = require('../errors/409-ConflictError');
const UnauthorizedError = require('../errors/401-UnauthorizedError');

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
        throw new BadRequest('Переданы некорректные данные');
      } else if (err.message === 'Not Found') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      } else {
        next(err);
      }
    });
};

// eslint-disable-next-line consistent-return
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
        throw new ConflictError('Данный адрес электронной почти уже используется');
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
        throw new NotFoundError('Пользователь с указанным _id не найден');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при обновлении профиля');
      }
      throw new ServerError('На сервере произошла ошибка');
    })
    .catch(next);
};

const avatarUpdate = async (req, res) => {
  try {
    const newAvatar = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true, runValidators: true,
    });
    return res.status(200).send(newAvatar);
  } catch (err) {
    if (err.name === 'ValidationError') {
      throw new BadRequest('Переданы некорректные данные при обновлении аватара');
    }
    throw new ServerError('На сервере произошла ошибка');
  }
};

// eslint-disable-next-line consistent-return
// const login = (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).send({ message: 'Некорректные данные' });
//   }

//   User.findOne({ email })
//     .then((user) => {
//       if (!user) {
//         return Promise.reject(new Error('Неправильные почта или пароль'));
//       }
//       return bcrypt.compare(password, user.password).then((match) => {
//         console.log(match);
//         if (!match) {
//           return res.status(401).send({ message: 'auth NO success' });
//         }
//         const result = signToken(user._id);
//         // console.log(result);
//         if (!result) {
//           return res.status(500).send({ message: 'token creation error' });
//         }
//         return res.status(200).send({ data: result });
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(401).send({ message: err.message });
//     });
// return res.status(200).send({ message: 'Hello from auth' });
// };

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    // .orFail(() => {
    //   throw new Unauthorized('403 ошибка кажется');
    // })
    .then((user) => {
      // res.status(200).send(user);
      const token = jwt.sign(
        { _id: user._id },
        `${NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key'}`,
        { expiresIn: '7d' },
      );
      // const token = jwt.sign({ _id: user._id }, 'some-secret-key');КК
      res.send({ token });
      // res.cookie('jwt', token, {
      //   httpOnly: true,
      //   sameSite: true,
      //   maxAge: 3600000 * 24,
      // }).send({ token });
    })
    // .catch((err) => {
    //   res
    //     .status(401)
    //     .send({ message: err.message });
    // });
    .catch(next);
};

// User.findOne({ email })
//   .then((user) => {
//     if (!user) {
//       return Promise.reject(new Error('Неправильные почта или пароль'));
//     }
//     return bcrypt.compare(password, user.password);
//   })
//   .then((matched) => {
//     if (!matched) {
//       return Promise.reject(new Error('Неправильные почта или пароль'));
//     }
//     return res.send({ message: 'Всё верно!' });
//   })
//   .catch((err) => {
//     res.status(401).send({ message: err.massege });
//   });
// };

module.exports = {
  getUsers,
  getUserById,
  getSelfInfo,
  createUser,
  profileUpdate,
  avatarUpdate,
  login,
};
