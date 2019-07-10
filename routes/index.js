var express = require('express');
var router = express.Router();
var mongoClient = require('../javascript/db.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});


module.exports = router;
