
var {DatabaseInterface}= require('../../database/db.js');
var pem = require('pem');
const ObjectID = require('mongodb').ObjectID;


async function authorized(req, res, next) {
	//reject if not authorized

	try {
		//make sure that the certification actually belongs to the requesting device
		let cert = req.socket.getPeerCertificate();

		if (!req.client.authorized) {
			console.log("(15) Client is not authorized.");
			return res.sendStatus(401);
		}

		let device_id = req.body.device_id;
		let coordinator_id = req.body.coordinator_id;

		if (DatabaseInterface.validateObjectIdHex(device_id) && DatabaseInterface.validateObjectIdHex(coordinator_id)){
			console.log("(23) Device id and coordinator id successfully validated.");
			//make sure that the certification actually belongs to the requesting device
			let cert = req.socket.getPeerCertificate();

			const Devices = await DatabaseInterface.getCollection("Devices");

			const coordinator = await Devices.find({device_id: new ObjectID(coordinator_id)}).toArray().catch(err => {console.log(err)});
			if (coordinator.length === 0) {
				console.log("(31) Coordinator id length is 0.");
				return res.sendStatus(401);
			}

			let fingerprint = coordinator[0].fingerprint;

			// compare the fingerprint in the db to the devices fingerprint
			if (fingerprint === cert.fingerprint256) {
				// fingerprint is right. Check that this device actually has this coordinator.

				const device = await Devices.find({device_id: new ObjectID(device_id)}).toArray();
				if (device.length === 0) {
					console.log("(43) Device id length is 0.");
					return res.sendStatus(401)
				}

				// These are different types so can't use ===
				if (device[0].coordinator_id == coordinator_id) {
					// success!
					next()
				}
				else {
					console.log("(52) Coordinator id in request body does not match for the device id.");
					console.log("Coordinator id in request body: ", coordinator_id);
					console.log("Coordinator id for the device id: ", device[0].coordinator_id);
					
					return res.sendStatus(401)
				}
			}
			else{
				console.log("(57) Db fingerprint does not match devices fingerprint.");
				return res.sendStatus(401);
			}
		}
		else  {
			console.log("(58) Device id and coordinator id NOT validated.");
			return res.sendStatus(401);
		}
	}
	catch(error) {
		console.log("(63) There was an error: ", error);
		return res.sendStatus(401);
	}
}
module.exports = function() {
	return authorized;
};