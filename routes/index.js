var express = require('express');
var router = express.Router();
var mongoClient = require('../javascript/db.js');
var authorized = require('../lib/middleware/authorized');
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {locals: res.locals});
});


module.exports = router;
