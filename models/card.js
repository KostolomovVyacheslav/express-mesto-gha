const mongoose = require('mongoose');
// const isUrl = require('validator/lib/isURL');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  // link: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: (url) => isUrl(url),
  //     message: 'Некорректный адрес URL',
  //   },
  // },
  // owner: {
  //   type: Array,
  //   required: true,
  // },
  likes: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

module.exports = mongoose.model('card', cardSchema);
