const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getSelfInfo, getUserById, profileUpdate, avatarUpdate,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getSelfInfo);

router.get('/:userId', getUserById);

// router.post('/', createUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), profileUpdate);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().uri(),
  }),
}), avatarUpdate);

module.exports = router;
