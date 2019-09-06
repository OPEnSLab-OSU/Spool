/**
 * Created by eliwinkelman on 7/10/19.
 */


var express = require('express');
var router = express.Router();
var secured = require('../lib/middleware/secured');
var wrapAsync = require('../lib/middleware/asyncWrap');
var AnalysisManager = require('../Analysis/Analysis');
// Certificate Generation
var ClientCertFactory = require('../lib/ClientCertFactory');
var pem = require('pem');
var getKeys = require("../lib/manageKeys");


//MongoDB
var mongoClient = require('../javascript/db');
const ObjectID = require('mongodb').ObjectID;


//API JSON Schema Validation
var {Validator, ValidationError} = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});
// Define a shortcut function
var validate = validator.validate;
const {RegisterDeviceSchema, GetUsersDevicesSchema} = require('./api');

async function getUser(auth0_id) {

	let client = await mongoClient().catch((err) => {
		throw err;
	});

	const db = client.db("Loom");
	const Users = db.collection("Users");

	var user = await Users.findOne({"auth0_id": auth0_id}).catch((err) => {
		throw err;
	});

	if (user != null) {
		return user;
	} else {
		//we don't have this user in our system yet
		//create a new user that doesn't own any devices

		var newUser = await Users.insertOne({
			auth0_id: id,
			devices: [],
			role: "user"
		}).catch((err) => {
			throw err;
		});
		return newUser;
	}
}

router.get('/devices', secured, wrapAsync(async function (req, res) {
	/***
	 * Endpoint that returns a users devices
	 * Authentication:
	 */
	var user = await getUser(req.user.sub).catch(err => {
		throw err;
	});

	// check which user role we have to handle
	if (user.role == "user") {

		//user dashboard

		let client = await mongoClient().catch(err => {
			throw err;
		});

		//grab the users devices from the database
		const db = client.db("Loom");
		const Devices = db.collection("Devices");
		const deviceArray = user.devices.map(device => {
			return ObjectID(device)
		});

		let devices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
			throw err;
		});

		res.json({devices: devices});
	}

	else if (user.role == "admin") {

		// admin dashboard
		activeTab = req.query.tab;
		if (activeTab == undefined) {
			activeTab = "devices"
		}

		let client = await mongoClient().catch(err => {
			throw err;
		});

		// grab the devices and the users from the database
		const db = client.db("Loom");
		const Devices = db.collection("Devices");

		var devices = await Devices.find({}).toArray().catch(err => {
			throw err;
		});

		// render the admin dashboard
		res.json({devices: devices});
	}
	else {
		//send to the login page
		res.sendStatus(400);
	}
}));

router.get('/devices/:device', secured, wrapAsync(async function (req, res) {
	/***
	 * Endpoint to view a device and its data.
	 *
	 * Authentication: User must be logged in.
	 */

	console.log(1);

	var user = await getUser(req.user.sub).catch(err => {
		throw err;
	});

	console.log(user);
	console.log(req.params.device);
	var device_id = req.params.device;
	if (req.params.device) {
		if (user.devices.includes(device_id.toString())) {

			let client = await mongoClient().catch(err => {
				throw err;
			});

			//grab the users devices from the database
			const db = client.db("Loom");
			const Devices = db.collection("Devices");
			console.log("hello");
			const DeviceData = db.collection(device_id.toString());
			var deviceData = await DeviceData.find({device_id: device_id}).toArray().catch((err) => {
				throw err;
			});
			console.log(deviceData);
			var devices = await Devices.find({device_id: new ObjectID(device_id)}).toArray().catch(err => {
				throw err
			});
			var device = devices[0];
			console.log(devices);
			var datas = formatDeviceData(deviceData);

			// render the device view page
			res.json({data: datas, device: device});
		}

		else {
			res.sendStatus(401);
		}
	}
	else {
		res.sendStatus(401);
	}

}));

router.get('/devices/delete/:device', secured, wrapAsync(async function (req, res) {
	/**
	 *  Deletes a device the user owns.
	 *  Authentication: User must be logged in.
	 */

	//make sure there is a device (this should be unnecessary but done just to be safe)

	var user = await getUser(req.user.sub).catch(err => {
		throw err;
	});

	// Load the MongoDB client
	var client = await mongoClient().catch(err => {
		throw err;
	});

	const db = client.db("Loom");
	const Devices = db.collection("Devices");
	const device_id = req.params.device;

	//get the device
	var devices = await Devices.find({device_id: new ObjectID(device_id)}).toArray().catch(err => {
		throw err;
	});

	var device = devices[0];

	//check if the device is owned by this user

	if (device.owner.toString() == user._id.toString()) {

		// delete the device
		Devices.deleteOne({_id: device._id});

		//delete the device data
		const DeviceData = db.collection(device_id.toString());
		DeviceData.deleteOne({device_id: device.device_id});

		// redirect to the user dashboard
		res.sendStatus(200);
	}
	else {
		// send bad status
		res.sendStatus(401);
	}
}));

router.post('/devices/register', secured, wrapAsync(async function (req, res) {
	/*
	 Endpoint to register a new device for data collection.

	 Request format:
	 {
	 “type”: <string - device type>
	 “name”: <string - device name>
	 }

	 Function:
	 1. Generate a client certificate and device id for the new device.
	 2. Add the new device object to the MongoDB "Devices" collection.
	 Note: The owner of the device is set as the currently logged in user.

	 Response: If successful, render a page with the new device id and authentication info and a button to download the JSON as a file.
	 */

	console.log(req.body);

	var user = await getUser(req.user.sub).catch(err => {
		throw err;
	});


	//generate a device_id
	const device_id = new ObjectID();

	//======= Generate Client Certificate =======//
	// get the certificate authority keys
	const keys = await getKeys();

	// generate a client certificate
	const certFactory = new ClientCertFactory(process.env.OPENSSL_BINARY_PATH, keys.ca.certificate);
	const clientCert = await certFactory.create_cert(keys.ca.key, "Spool Client " + device_id, false).catch((err) => {
		throw err
	});

	//======= Add the new device to the database =======//

	const client = await mongoClient().catch(err => {
		throw err;
	});
	const db = client.db("Loom");
	const Devices = db.collection("Devices");
	const new_device = {
		type: req.body.type,
		name: req.body.name,
		device_id: device_id,
		fingerprint: clientCert.fingerprint,
		owner: user._id
	};

	let devices = await Devices.insertOne(new_device).catch(err => {
		throw err;
	});

	//add device to user array
	const Users = db.collection("Users");
	user.devices.push(device_id.toString());

	let userUpdate = Users.updateOne({_id: new ObjectID(user._id)}, {$set: {devices: user.devices}}).catch(err => {
		throw err
	});

	// render the device info page
	res.send({
		device_id: device_id,
		certificate: clientCert.certificate,
		private_key: clientCert.key
	});

}));

/*
 router.get('/device/:device/:data_run?', secured(), async function (req, res) {
 /*
 API Endpoint to retrieve all data for a specific device. This endpoint isn't being used by the frontend and has been replaced by 'device/view/:device'

 Request format:

 parameters:
 device_id = <string - device id>
 data_run = <string - data run> (optional)
 */
/*
 //Add user authentication

 if (req.params.device) {

 // get the device
 var device_id = req.params.device;
 const client = mongoClient().catch(err => {
 throw err;
 });

 const db = client.db("Loom");
 const Devices = db.collection("Devices");

 const devices = Devices.find({device_id: new ObjectID(device_id)}).toArray().catch(err => {
 throw err
 });

 const device_type = devices[0].type;

 // NOTE: change this to new DB design

 const DeviceData = db.collection(device_type.toString());

 let query;
 if (!req.params.data_run) {

 query = {device_id: device_id};
 //find devices without the data run in the query

 DeviceData.find({device_id: device_id}).toArray((err, results) => {
 if (err) throw err;
 else {
 res.send(results);
 }
 });
 }
 else {
 //find the devices with the data run in the query
 var data_run = req.params.data_run;
 query = {device_id: device_id, datarun_id: data_run};
 }

 const datapoints = await DeviceData.find(query).toArray().catch(err => {throw err});
 res.send(datapoints);
 }
 else {
 res.send("No Device Specified.")
 }
 });
 **/

function formatDeviceData(deviceData) {
	return deviceData.map((data, index) => {

		var formatted_device = new Map();

		formatted_device.set("Data_Run", data.data_run);
		formatted_device.set("Date", data.data.timestamp.date);
		formatted_device.set("Time", data.data.timestamp.time);

		data.data.contents.forEach((sensor) => {
			for (var key in sensor.data) {
				if (sensor.data.hasOwnProperty(key)) {
					formatted_device.set(String(key), sensor.data[key]);
				}
			}
		});

		return formatted_device
	});
}

module.exports = router;
