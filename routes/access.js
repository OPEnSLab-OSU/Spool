/**
 * Created by eliwinkelman on 7/10/19.
 */


var express = require('express');
var router = express.Router();
var secured = require('../lib/middleware/secured');
const ObjectID = require('mongodb').ObjectID;
var pem = require('pem');
var getKeys = require("../lib/manageKeys");
//MongoDB
var mongoClient = require('../javascript/db.js');

//API JSON Schema Validation
var { Validator, ValidationError } = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});
// Define a shortcut function
var validate = validator.validate;
const {RegisterDeviceSchema} = require('./api');


//take care of fetching user
router.param('user', function (req, res, next, id) {

		// try to get the user details from the User model and attach it to the request object
		mongoClient( (err, client) => {
			if (err) {
				return next(err);
			}
			else {
				const db = client.db("Loom");
				const Users = db.collection("Users");
				Users.findOne({"_id": id}, function (err, user) {
					if (err) {
						return next(err)
					} else if (user) {
						req.changingUser = user;
						next()
					} else {
						return next(new Error('failed to load user'))
					}
				})
			}
		})
});

router.get('/', secured(), function(req, res) {
	if (req.user.meta.role == "user") {
		//user dashboard
		console.log(req.user);
		//load user devices
		mongoClient((err, client) => {
			if (err) {return next(err);}

			const db = client.db("Loom");
			const Devices = db.collection("Devices");


			const deviceArray = req.user.meta.devices.map(device => {

				return ObjectID(device)
			});

			Devices.find({device_id: {$in: deviceArray}}).toArray((err, devices) => {
				if (err) {return next(err);}
				console.log(devices);
				res.render("userDashboard", {devices: devices, locals: res.locals})
			})
		});
	}

	else if (req.user.meta.role == "admin") {

		//admin dashboard
		
		res.render("index", {locals: res.locals})
	}
	else {
		res.redirect('/auth/login');
	}
});

router.get('/user/edit/:user?', secured(), function(req, res) {

	//don't let non-admins modify anyone but themselves
	if (req.user.meta.role !== "admin") {
		req.changingUser = undefined
	}
	if (req.changingUser == undefined) {
		user = req.user
	}
	else {
		user = req.changingUser
	}

	res.render('EditUserForm', {user: user, locals: res.locals})
});

router.post('/user/edit/:user?', function(req, res) {

});

router.get('/device/register', secured(), function(req, res) {
	res.render("RegisterDeviceForm", {locals: res.locals})
});

router.post('/device/register', secured(), validate({body: RegisterDeviceSchema}), function(req, res) {
	/*
	 API Endpoint to register a new device for data collection.

	 Request format:
	 {
	 “type”: <string - device type>
	 “name”: <string - device name>
	 }

	 Function: Add request JSON object into mongodb devices collection with an added UUID called “device_id”. (Add a user?)

	 Response: If successful, return created object. Otherwise, return error codes.

	 */
	//add schema validation later with https://www.npmjs.com/package/express-json-validator-middleware

	// naively validate request
	if (req.body.type && req.body.name)
	{

		//generate a device_id
		const device_id = new ObjectID();
		//generate a public and secret key for the device

		getKeys((keys) => {

			var keyOptions = {
				serviceKey: keys.ca.key,
				serviceCertificate: keys.ca.certificate,
				serviceKeyPassword: process.env.CA_PASSWORD
			};

			pem.createCertificate(keyOptions, (err, deviceKeys) => {
				//save keys to the db and then return them to the user.

				mongoClient( (err, client) => {
					if (err) throw err;
					else {
						const db = client.db("Loom");
						const Devices = db.collection("Devices");
						pem.getFingerprint(deviceKeys.certificate, (err, fingerprint) => {

							var new_device = {
								type: req.body.type,
								name: req.body.name,
								device_id: device_id,
								fingerprint: fingerprint.fingerprint
							};

							Devices.insertOne(new_device, (err, result) => {
								if (err) throw err;
								else {
									//add device to user array
									const Users = db.collection("Users");
									req.user.meta.devices.push(device_id);
									Users.updateOne({_id: new ObjectID(req.user.meta._id)}, {$set: {devices: req.user.meta.devices}}, function(err, result) {
										if (err) {throw err;}
										res.send({device_id: device_id, certificate: deviceKeys.certificate, private_key: deviceKeys.clientKey});
									});
								}
							})

						})

					}
				})

			})
		});
	}
	else {
		res.send("Not a valid request");
	}
});

router.get('/device/:device/:data_run?', secured(), function(req, res){
	/*
	 API Endpoint to retrieve all data for a specific device.

	 Request format:

	 parameters:
	 device_id = <string - device id>
	 data_run = <string - data run> (optional)
	 */

	//Add user authentication


	if (req.params.device) {

		var device_id = req.params.device;
		mongoClient( (err, client) => {
			if (err) {
				throw err;
			}
			else {
				const db = client.db("Loom");
				const Devices = db.collection("Devices");
				console.log("device id: " + device_id);

				Devices.find({device_id: new ObjectID(device_id)}).toArray((err, result) => {
					if (err) throw err;
					else {
						console.log(result);
						const device_type = result[0].type;

						const DeviceData = db.collection(device_type.toString());
						if (!req.params.data_run) {
							DeviceData.find({device_id: device_id}).toArray((err, results) => {
								if (err) throw err;
								else {

									res.send(results);
								}
							});
						}
						else {
							var data_run = req.params.data_run;
							const data_points = DeviceData.find({device_id: device_id, datarun_id: data_run}).toArray((err, results) => {
								if (err) throw err;
								else {

									res.send(results);
								}
							})
						}
					}
				})
			}
		})
	}
	else {
		res.send("No Device Specified.")
	}
});

module.exports = router;