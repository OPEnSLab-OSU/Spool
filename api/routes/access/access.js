

const express = require('express');
const router = express.Router();

const secured = require('./../../lib/middleware/secured');
const userInApi = require('./../../lib/middleware/userInApi');

const deviceRouter = require('./devices');
const visualizationRouter = require('./visualizations');
const networkRouter = require('./networks');
const userRouter = require('./users');

router.use(secured);
router.use(userInApi());

router.use('/devices', deviceRouter);
router.use('/visualization', visualizationRouter);
router.use('/networks', networkRouter);
router.use('/user', userRouter);

module.exports = router;
