const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  // const { authorization } = req.headers;

  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   return res
  //     .status(401)
  //     .send({ message: 'Необходима авторизация' });
  // }

  // const token = authorization.replace('Bearer ', '');
  // let payload;

  // try {
  // payload = jwt.verify(token, 'some-secret-key');  // КОММЕНТЫ
  // payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`);//КОМ
  //   payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key'}`);
  // } catch (err) {
  //   return res
  //     .status(401)
  //     .send({ message: 'Необходима авторизация' });
  // }

  // req.user = payload;

  // next();
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return res.status(500).send({ message: 'ОШИБКА' });
  }

  req.user = payload;
  next();
};
