/**
 * Created by eliwinkelman on 7/9/19.
 */

var express = require('express');
var router = express.Router();
var wrapAsync = require('../lib/middleware/asyncWrap');

//MongoDB
var mongoClient = require('../javascript/db.js');
const ObjectID = require('mongodb').ObjectID;

//API JSON Schema Validation
var { Validator, ValidationError } = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});
// Define a shortcut function
var validate = validator.validate;
// TLS Client Authorization
var authorized = require('../lib/middleware/authorized');
const {RegisterDeviceSchema, PostDeviceDataSchema} = require('./api');

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
	
	// get the database client
	const client = await mongoClient().catch(err => {res.send(err)});
	
	//get the device id
	var device_id = req.body.device_id;
	const db = client.db('Loom');
	
	// device data collections are named by their device ID
	const DeviceData = db.collection(device_id.toString());
	
	var data = req.body;
	
	let newData = await DeviceData.insertOne(data).catch(err => {throw err;});
	if (newData) {
		res.send(1);
	}
	else {
		res.send(0)
	}
}));

module.exports = router;