var express = require('express');
var router = express.Router();

const user = require('../controller/user');
const movie = require('../controller/movie')


router.use('/user', user);
router.use('/movie', movie);


router.post('/setup', (req, res) => {
  res.json("Setup");
})

module.exports = router;