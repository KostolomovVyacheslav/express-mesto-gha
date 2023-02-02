const NotFoundError = require('../errors/404-NotFoundError');

exports.notExist = (req, res, next) => {
  next(new NotFoundError('Веб-страница ищет HTML своей жизни. Желательно без ошибок и вредных привычек :)'));
};
