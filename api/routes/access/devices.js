/**
 * Created by eliwinkelman on 9/13/19.
 */

var express = require('express');
var router = express.Router();
var secured = require('../../lib/middleware/secured');
var wrapAsync = require('../../lib/middleware/asyncWrap');
var ClientCertFactory = require('../../lib/ClientCertFactory');
var pem = require('pem');
var getKeys = require("../../lib/manageKeys");

//MongoDB
var mongoClient = require('../../javascript/db');
const ObjectID = require('mongodb').ObjectID;

router.get('/', secured, wrapAsync(async function (req, res) {
	/***
	 * Endpoint that returns a users devices
	 * Authentication:
	 */
	console.log("devices!");
	// check which user role we have to handle
	if (req.apiUser.role == "user") {

		//user dashboard

		let client = await mongoClient().catch(err => {
			throw err;
		});

		//grab the users devices from the database
		const db = client.db("Loom");
		const Devices = db.collection("Devices");
		const deviceArray = req.apiUser.devices.map(device => {
			return ObjectID(device)
		});

		let devices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
			throw err;
		});

		res.json({devices: devices});
	}

	else if (req.apiUser.role == "admin") {

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

router.get('/info/:device', secured, wrapAsync(async function (req, res) {
	/***
	 * Endpoint to view a device and its data.
	 *
	 * Authentication: User must be logged in.
	 */

	
	var device_id = req.params.device;
	if (req.params.device) {
		if (req.apiUser.devices.includes(device_id.toString())) {

			let client = await mongoClient().catch(err => {
				throw err;
			});

			//grab the users devices from the database
			const db = client.db("Loom");
			const Devices = db.collection("Devices");

			var devices = await Devices.find({device_id: new ObjectID(device_id)}).toArray().catch(err => {
				throw err
			});
			var device = devices[0];


			// render the device view page
			res.json({device: device});
		}

		else {
			res.sendStatus(401);
		}
	}
	else {
		res.sendStatus(401);
	}

}));




router.get('/delete/:device', secured, wrapAsync(async function (req, res) {
	/**
	 *  Deletes a device the user owns.
	 *  Authentication: User must be logged in.
	 */

	//make sure there is a device (this should be unnecessary but done just to be safe)



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

	if (device.owner.toString() == req.apiUser._id.toString()) {

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

router.post('/register', secured, wrapAsync(async function (req, res) {
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
		owner: req.apiUser._id
	};

	let devices = await Devices.insertOne(new_device).catch(err => {
		throw err;
	});

	//add device to user array
	const Users = db.collection("Users");
	req.apiUser.devices.push(device_id.toString());

	let userUpdate = Users.updateOne({_id: new ObjectID(req.apiUser._id)}, {$set: {devices: req.apiUser.devices}}).catch(err => {
		throw err
	});

	// render the device info page
	res.send({
		device_id: device_id,
		certificate: clientCert.certificate,
		private_key: clientCert.key
	});

}));

router.get('/data/:device/', secured, wrapAsync(async (req, res) => {


	var device_id = req.params.device;
	if (req.params.device) {
		if (req.apiUser.devices.includes(device_id.toString())) {

			let client = await mongoClient().catch(err => {
				throw err;
			});

			//grab the users devices from the database
			const db = client.db("Loom");
			const Devices = db.collection("Devices");

			const DeviceData = db.collection(device_id.toString());
			var deviceData = await DeviceData.find({device_id: device_id}).toArray().catch((err) => {
				throw err;
			});

			var datas = formatDeviceData(deviceData);
			console.log(datas);
			// render the device view page
			res.send({data: datas});
		}

		else {
			res.sendStatus(401);
		}
	}
}));


function formatDeviceData(deviceData) {
	return deviceData.map((data, index) => {

		let formatted_device = new Map();

		formatted_device.set("Data_Run", data.data_run);
		formatted_device.set("Date", data.data.timestamp.Date);
		formatted_device.set("Time", data.data.timestamp.Time);

		data.data.contents.forEach((sensor) => {
			for (var key in sensor.data) {
				if (sensor.data.hasOwnProperty(key)) {
					formatted_device.set(String(key), sensor.data[key]);
				}
			}
		});

		return strMapToObj(formatted_device);
	});
}

function strMapToObj(strMap) {
	let obj = Object.create(null);
	for (let [k,v] of strMap) {
		// We don’t escape the key '__proto__'
		// which can cause problems on older engines
		obj[k] = v;
	}
	return obj;
}

module.exports = router;