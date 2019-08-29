/**
 * Created by eliwinkelman on 7/10/19.
 */


var express = require('express');
var router = express.Router();
var secured = require('../lib/middleware/secured');
var wrapAsync = require('../lib/middleware/asyncWrap');

// Certificate Generation
var ClientCertFactory = require('../lib/ClientCertFactory');
var pem = require('pem');
var getKeys = require("../lib/manageKeys");


//MongoDB
var mongoClient = require('../javascript/db.js');
const ObjectID = require('mongodb').ObjectID;


//API JSON Schema Validation
var {Validator, ValidationError} = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});
// Define a shortcut function
var validate = validator.validate;
const {RegisterDeviceSchema} = require('./api');

router.param('user', wrapAsync(async function (req, res, next, id) {
	/***
	 * Try to get the user details from the User model and attach it to the request object for any user based requests
	 */

	let client = await mongoClient().catch((err) => {
		throw err;
	});

	const db = client.db("Loom");
	const Users = db.collection("Users");

	let devices = await Devices.find({device_id: new ObjectID(device_id)}).toArray().catch((err) => {
		throw err;
	});
	let user = await Users.findOne({"_id": id}).catch(err => {
		throw err;
	});

	if (user) {
		req.changingUser = user;
		next()
	} else {
		return next(new Error('failed to load user'))
	}
}));

router.get('/', secured(), wrapAsync(async function (req, res) {
	/***
	 * Endpoint that renders the user dashboard.
	 * Authentication: User must be logged in.
	 */

	// check which user role we have to handle
	if (req.user.meta.role == "user") {

		//user dashboard

		let client = await mongoClient().catch(err => {
			throw err;
		});

		//grab the users devices from the database
		const db = client.db("Loom");
		const Devices = db.collection("Devices");
		const deviceArray = req.user.meta.devices.map(device => {
			return ObjectID(device)
		});

		let devices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
			throw err;
		});

		//render the user dashboard
		res.render("userDashboard", {devices: devices, locals: res.locals, format: "cards"})
	}

	else if (req.user.meta.role == "admin") {

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
		const Users = db.collection("Users");

		var devices = await Devices.find({}).toArray().catch(err => {
			throw err;
		});

		var users = await Users.find({}).toArray().catch(err => {
			throw err;
		});

		// render the admin dashboard
		res.render("AdminDashboard", {
			devices: devices,
			users: users,
			locals: res.locals,
			activeTab: activeTab
		});
	}
	else {
		//send to the login page
		res.redirect('/auth/login');
	}
}));

router.get('/user/edit/:user?', secured(), function (req, res) {
	/***
	 * Endpoint for a user editing form
	 */

	//don't let non-admins modify anyone but themselves
	let user;
	if (req.user.meta.role == "admin" && req.changingUser !== undefined) {
		user = req.changingUser
	}
	else {
		user = req.user
	}

	//render the user edit form
	res.render('EditUserForm', {user: user, locals: res.locals})
});

router.post('/user/edit/:user?', function (req, res) {

});

router.get('/device/view/:device', secured(), wrapAsync(async function (req, res) {
	/***
	 * Endpoint to view a device and its data.
	 *
	 * Authentication: User must be logged in.
	 */
	if (req.params.device) {
		if (req.user.meta.devices.includes(req.params.device)) {

			var device_id = req.params.device;

			var client = await mongoClient().catch((err) => {
				next(err);
			});
			
			// get the device and it's data
			const db = client.db("Loom");
			const Devices = db.collection("Devices");
			const DeviceData = db.collection(device_id.toString());
			var deviceData = await DeviceData.find({device_id: device_id}).toArray().catch((err) => {
				throw err;
			});

			var devices = await Devices.find({device_id: new ObjectID(device_id)}).toArray().catch(err => {throw err});
			var device = devices[0];
			console.log(devices);
			var datas = formatDeviceData(deviceData);

			// render the device view page
			res.render("DevicePage", {data: datas, device: device, locals: res.locals})
		}

		else {
			res.status(401);
			res.send("Not Authorized.");
		}
	}

	else {
		res.redirect("/")
	}
}));

router.get('/device/delete/:device', secured(), wrapAsync(async function (req, res) {
	/**
	 *  Deletes a device the user owns.
	 *  Authentication: User must be logged in.
	 */

	//make sure there is a device (this should be unnecessary but done just to be safe)
	if (req.params.device) {

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
		if (device.owner == req.user.meta._id) {

			// delete the device
			Devices.deleteOne({_id: device._id});

			//delete the device data
			const DeviceData = db.collection(device_id.toString());
			DeviceData.remove({device_id: device.device_id});

			// redirect to the user dashboard
			res.redirect('/u/')
		}
		else {

			// redirect to the user dashboard
			res.redirect('/u/')
		}
	}
	else {

		// redirect to the user dashboard
		res.redirect("/u/")
	}
}));

router.get('/device/register', secured(), function (req, res) {
	/**

	 User form to register a new loom device.

	 Sends form data to POST 'device/register'
	 and generates a device id and client certificate.

	 **/

	res.render("RegisterDeviceForm", {locals: res.locals})
});

router.post('/device/register', secured(), validate({body: RegisterDeviceSchema}), wrapAsync(async function (req, res) {
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

	// naively validate request (the JSON Schema validation should be
	if (req.body.type && req.body.name) {

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
			owner: req.user.meta._id
		};

		let devices = await Devices.insertOne(new_device).catch(err => {
			throw err;
		});

		//add device to user array
		const Users = db.collection("Users");
		req.user.meta.devices.push(device_id);

		let userUpdate = Users.updateOne({_id: new ObjectID(req.user.meta._id)}, {$set: {devices: req.user.meta.devices}}).catch(err => {
			throw err
		});


		// give the device info to the user

		var text = JSON.stringify({
			device_id: device_id,
			certificate: clientCert.certificate,
			private_key: clientCert.key_raw
		});

		// render the device info page
		res.render("NewDeviceInfo", {device_info: text, locals: res.locals});

	}
	else {
		res.send("Not a valid request");
	}
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

		var formatted_device = {
			Data_Run: data.data_run,
			Date: data.data.timestamp.Date,
			Time: data.data.timestamp.Time
		};

		data.data.contents.forEach((sensor) => {
			for (var key in sensor.data) {
				if (sensor.data.hasOwnProperty(key)) {
					formatted_device[key] = sensor.data[key]
				}
			}
		});
		return formatted_device
	});
}
module.exports = router;
