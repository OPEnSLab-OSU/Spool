var express = require('express');
var router = express.Router();
var mongoClient = require('../javascript/db.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST new user */
router.post('/new', function(req, res){
  /*
  request should look like:
     {
     “username”: <username>
     “password”: <hashed password>
     “email”: <user email>
     “devices”: [<devices user has access to>]
     “role”: <”user” or “admin”>
     }
   */
  
});

module.exports = router;
