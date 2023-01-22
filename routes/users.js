const router = require('express').Router();
const {
  getUsers, getUserById, getSelfInfo, profileUpdate, avatarUpdate,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/:userId', getUserById);

router.get('/me', getSelfInfo);

// router.post('/', createUser);

router.patch('/me', profileUpdate);

router.patch('/me/avatar', avatarUpdate);

module.exports = router;
