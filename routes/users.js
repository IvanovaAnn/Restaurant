var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Круть');
});

router.get('/cool', function(req, res, next) {
  res.send('Круто');
});


module.exports = router;
