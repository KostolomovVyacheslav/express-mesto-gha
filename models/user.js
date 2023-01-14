const mongoose = require('mongoose');
const isUrl = require('validator/lib/isURL');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    validate: (url) => isUrl(url),
    message: 'Некорректный адрес URL',
  },
}, {
  versionKey: false,
});

module.exports = mongoose.model('user', userSchema);
