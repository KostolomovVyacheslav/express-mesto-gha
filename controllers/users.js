// const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
// const { signToken } = require('../utils/jwt');
const NotFoundError = require('../errors/not-found-error');
const BadRequest = require('../errors/bad-request-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const getSelfInfo = (req, res) => {
  // const userId = req.user._id;
  // console.log(req.params);
  User.findById(req.user._id)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      res.status(400).send({ message: 'ошибка ошибка', err });
    });
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найдет, такие дела делишки');
    })

    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      // if (err instanceof mongoose.Error.CastError) {ККК
      if (err.message === 'CastError') {
        throw new BadRequest('Переданы некорректные данные');
      } else if (err.message === 'Not Found') {
        throw new NotFoundError('Пользователь по указанному id не найдет, такие дела делишки');
      } else {
        next(err);
      }
    // return res.status(500).send({ message: 'На сервере произошла ошибка', err });ККК
    });
};

// const getUserById = (req, res) => {
//   const { userId } = req.params;
//   User.findById(userId).orFail(new Error('Not Found'))

//     .then((user) => {
//       res.status(200).send(user);
//     })
//     .catch((err) => {
//       if (err.message === 'Not Found') {
//         return res.status(404).send({ message: 'Пользователь с указанным _id не найден', err });
//       }
//       if (err instanceof mongoose.Error.CastError) {
//         return res.status(400).send({ message: 'Не корректный _id', err });
//       }
//       return res.status(500).send({ message: 'На сервере произошла ошибка', err });
//     });
// };

// eslint-disable-next-line consistent-return
const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) { return res.status(400).send({ message: 'Некорректные данные' }); }
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))

    .then((user) => {
      res.status(201).send({ data: user });
      // res.status(201).send({ user });
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

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // res.status(200).send(user);
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret',
        { expiresIn: '7d' },
      );
      // const token = jwt.sign({ _id: user._id }, 'some-secret-key');КК
      // res.send({ token });
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24,
      }).send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
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
