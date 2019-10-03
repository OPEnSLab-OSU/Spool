

var express = require('express');
var router = express.Router();

const secured = require('./../../lib/middleware/secured');
const userInApi = require('./../../lib/middleware/userInApi');

const deviceRouter = require('./devices');
const visualizationRouter = require('./visualizations');

router.use(secured);
router.use(userInApi());

router.use('/devices', deviceRouter);
router.use('/visualization', visualizationRouter);

module.exports = router;
