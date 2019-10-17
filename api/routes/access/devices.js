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
 *          tags:
 *              - access
 *              - devices
 */
router.get('/', wrapAsync(getDevices));

/**
 * @swagger
 * /access/devices/info/{device}:
 *      get:
 *          description: Gets the specified device.
 *          tags:
 *              - access
 *              - devices
 *          parameters:
 *              - in: path
 *                name: device
 *                schema:
 *                  type: string
 *                required: true
 *                description: id of the device to get
 */
router.get('/info/:device', secured, wrapAsync(getDevice));

/**
 * @swagger
 * /access/devices/delete:
 *      get:
 *          description: Deletes the specified device.
 *          tags:
 *              - access
 *              - devices
 *          parameters:
 *              - in: path
 *                name: device
 *                schema:
 *                  type: string
 *                required: true
 *                description: id of the device to get
 */
router.post('/delete/', secured, wrapAsync(deleteDevice));

/**
 * @swagger
 * /access/devices/register:
 *      post:
 *          description: Creates a new device and returns the information necessary for it to authenticate with the server
 *          tags:
 *              - access
 *              - devices
 */

router.post('/register', secured, wrapAsync(createDevice));

/**
 *  @swagger
 *  /access/devices/data/{device}:
 *      post:
 *          description: Gets the data belonging to the device.
 *          tags:
 *              - access
 *              - devices
 *          parameters:
 *              - in: path
 *                name: device
 *                schema:
 *                  type: string
 *                required: true
 *                description: id of the device to get
 */
router.get('/data/:device/', secured, wrapAsync(getDeviceData));


module.exports = router;