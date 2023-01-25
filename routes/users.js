const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const isUrl = require('validator/lib/isURL');
const BadRequest = require('../errors/bad-request-err');
const {
  getUsers, getSelfInfo, getUserById, profileUpdate, avatarUpdate,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getSelfInfo);

router.get('/:userId', getUserById);

// router.post('/', createUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), profileUpdate);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((link) => {
      if (isUrl(link, { require_protocol: true })) {
        return link;
      }
      throw new BadRequest('Плохая ссылка / URL');
    }),
  }),
}), avatarUpdate);

module.exports = router;
