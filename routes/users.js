const router = require('express').Router();
const {
  getUsers, getUserById, createUser, profileUpdate, avatarUpdate,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/:userId', getUserById);

router.post('/', createUser);

router.patch('/me', profileUpdate);

router.patch('/me/avatar', avatarUpdate);

module.exports = router;
