/**
 * Created by eliwinkelman on 7/9/19.
 */

var express = require('express');
var router = express.Router();

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

router.post('/data/', validate({body: PostDeviceDataSchema}), authorized(), function(req, res) {

	/*
	API Endpoint to save a new device datapoint into the database.

	 Request should look like
	 {
	 "device_id": <string - Device ID> (specific to each piece of hardware reporting data)
	 "data_run": <string - data run ID> (specific to each set of data collection)
	 "data" : <json data provided from loom Manager.package()>
	 }
	 */

	mongoClient((err, client) => {
		if (err) {
			res.send(err);
		}
		else {
			var device_id = req.body.device_id;
			const db = client.db('Loom');
			const Devices = db.collection("Devices");

			Devices.find({device_id: new ObjectID(device_id)}).toArray((err, result) => {
				if (err) throw err;
				else {
					const device_type = result[0].type;

					const DeviceData = db.collection(device_type.toString());
					var data = req.body;
					data.device_type = device_type;

					DeviceData.insertOne(data, (err, result) => {
						if (err) throw err;
						else {
							res.send(result);
						}
					})

				}
			});

		}
	});
});

module.exports = router;