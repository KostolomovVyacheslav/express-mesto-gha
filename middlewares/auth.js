const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/401-UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // const { authorization } = req.headers;

  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   throw new UnauthorizedError('Необходима авторизация');
  // }

  // const token = authorization.replace('Bearer ', '');
  // let payload;

  // try {
  //   payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key'}`);
  // } catch (err) {
  //   throw new UnauthorizedError('Необходима авторизация');
  // }

  // req.user = payload;

  // next();

  const token = req.cookies.jwt;

  if (!token) {
    throw new UnauthorizedError('Ошибка авторизации: не найден req.cookies.jwt');
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    throw new UnauthorizedError('Ошибка верификации токена');
  }

  req.user = payload;
  next();
};
