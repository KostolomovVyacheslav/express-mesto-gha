const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const signToken = (id) => {
  try {
    console.log(id);
    const token = jwt.sign({ id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
    console.log(token);
    return token;
  } catch (err) {
    return false;
  }
};

module.exports = {
  signToken,
};
