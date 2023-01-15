const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL);

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов, пожалуйста попробуйте позже :)',
});

app.use(helmet());

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '63c2e86086069ad64d047054',
  };

  next();
});

app.use('/cards', limiter, require('./routes/cards'));
app.use('/users', limiter, require('./routes/users'));

app.use(limiter, (req, res) => {
  res.status(404).json({
    message: 'Веб-страница ищет HTML своей жизни. Желательно без ошибок и вредных привычек :)',
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
