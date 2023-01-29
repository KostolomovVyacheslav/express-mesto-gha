const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isUrl = require('validator/lib/isURL');
const isEmail = require('validator/lib/isEmail');
const UnauthorizedError = require('../errors/401-UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: (url) => isUrl(url),
    message: 'Некорректный адрес URL',
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: (email) => isEmail(email),
    message: 'Некорректный адрес электронной почты',
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
}, {
  versionKey: false,
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Данный адрес электронной почты не используется');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
