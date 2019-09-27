
var express = require('express');
var router = express.Router();
var wrapAsync = require('../lib/middleware/asyncWrap');


//API JSON Schema Validation
var { Validator, ValidationError } = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});
// Define a shortcut function
var validate = validator.validate;
// TLS Client Authorization
var authorized = require('../lib/middleware/authorized');
const {RegisterDeviceSchema, PostDeviceDataSchema} = require('./api');

const DeviceDataDatabase = require('../database/models/deviceData');

/**
 * @swagger
 * /device/data/:
 *    post:
 *      description: Accepts data from a Loom device and saves it to the database. It requires the device to be registered with the API and have the proper X509 Client Certificate issued by the API when the device was registered.
 *      requestBody:
 *          required: true
 *          content:
 *              'application/json':
 *                  schema:
 *                      type: object
 *                      required:
 *                          - device_id
 *                          - data_run
 *                          - data
 *                      properties:
 *                          device_id:
 *                              type: string
 *                              description: The id of the device given by spool during registration.
 *                          data_run:
 *                              type: string
 *                              description:
 *                          data:
 *                              type: object
 *                      example:
 *                          device_id: asdg034kajd024lc94
 *                          data_run: 0a4kjakd034nbdf92a
 *                          data: {}
 */

router.post('/data/', validate({body: PostDeviceDataSchema}), authorized(), wrapAsync(async function(req, res) {

	/*
	API Endpoint to save a new device datapoint into the database.

	 Request should look like
	 {
	 "device_id": <string - Device ID> (specific to each piece of hardware reporting data)
	 "data_run": <string - data run ID> (specific to each set of data collection)
	 "data" : <json data provided from loom Manager.package()>
	 }
	 */

	//get the device id
	const device_id = req.body.device_id;
	const data = req.body;
	
	try {
		const inserted = await DeviceDataDatabase.create(device_id, data);
		res.sendStatus(200);
	}
	catch(error) {
		console.log(error);
		res.sendStatus(401)
	}
}));

module.exports = router;