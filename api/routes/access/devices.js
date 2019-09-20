/** @module access/devices */

var express = require('express');
var router = express.Router();
var secured = require('../../lib/middleware/secured');
var wrapAsync = require('../../lib/middleware/asyncWrap');

const {getDevices, getDevice, deleteDevice, createDevice, getDeviceData} = require('./devicesImpl');

//MongoDB
var mongoClient = require('../../database/db');
const ObjectID = require('mongodb').ObjectID;

/**
 * @swagger
 * /access/devices/:
 *      get:
 *          description: Returns all the devices belonging to the user that requested them.
 */

router.get('/', secured, wrapAsync(getDevices));

router.get('/info/:device', secured, wrapAsync(getDevice));

router.get('/delete/:device', secured, wrapAsync(deleteDevice));

router.post('/register', secured, wrapAsync(createDevice));

router.get('/data/:device/', secured, wrapAsync(getDeviceData));


module.exports = router;