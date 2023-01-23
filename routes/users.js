const router = require('express').Router();
const {
  getUsers, getSelfInfo, getUserById, profileUpdate, avatarUpdate,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getSelfInfo);
// router.get('/me', (req, res) => {
//   console.log(req.user);
// });

router.get('/:userId', getUserById);

// router.post('/', createUser);

router.patch('/me', profileUpdate);

router.patch('/me/avatar', avatarUpdate);

module.exports = router;
