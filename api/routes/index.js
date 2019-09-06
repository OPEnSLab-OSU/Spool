var express = require('express');
var router = express.Router();
var secured = require("../lib/middleware/secured");
/* GET home page. */
router.get('/', secured, function(req, res) {
  res.json({msg: "Hello World"});

});

module.exports = router;
