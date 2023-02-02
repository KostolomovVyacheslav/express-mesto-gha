const router = require('express').Router();
const { notExist } = require('../controllers/notExist');

router.all('/*', notExist);

module.exports = router;
