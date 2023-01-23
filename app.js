require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
// const { celebrate, Joi } = require('celebrate');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL);

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов, пожалуйста попробуйте позже :)',
});

app.use(cookieParser());
app.use(limiter);
app.use(helmet());

app.use(express.json());

app.post('/signup', createUser);
app.post('/signin', login);

app.use(auth);

app.use('/cards', require('./routes/cards'));
app.use('/users', require('./routes/users'));

app.use((req, res) => {
  res.status(404).json({
    message: 'Веб-страница ищет HTML своей жизни. Желательно без ошибок и вредных привычек :)',
  });
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
