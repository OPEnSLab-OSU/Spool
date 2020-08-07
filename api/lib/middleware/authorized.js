
var {DatabaseInterface}= require('../../database/db.js');
var pem = require('pem');
const ObjectID = require('mongodb').ObjectID;


async function authorized(req, res, next) {
	//reject if not authorized

	try {
		//make sure that the certification actually belongs to the requesting device
		let cert = req.socket.getPeerCertificate();

		if (!req.client.authorized) {
			return res.sendStatus(401)
		}

		let device_id = req.body.device_id;
		let coordinator_id = req.body.coordinator_id;

		if (DatabaseInterface.validateObjectIdHex(device_id) && DatabaseInterface.validateObjectIdHex(coordinator_id)){
			//make sure that the certification actually belongs to the requesting device
			let cert = req.socket.getPeerCertificate();

			const Devices = await DatabaseInterface.getCollection("Devices");

			const coordinator = await Devices.find({device_id: new ObjectID(coordinator_id)}).toArray().catch(err => {console.log(err)});
			if (coordinator.length === 0) {
				return res.sendStatus(401);
			}

			let fingerprint = coordinator[0].fingerprint;

			// compare the fingerprint in the db to the devices fingerprint
			if (fingerprint === cert.fingerprint256) {
				// fingerprint is right. Check that this device actually has this coordinator.

				const device = await Devices.find({device_id: new ObjectID(device_id)}).toArray();
				if (device.length === 0) {
					return res.sendStatus(401)
				}

				if (device[0].coordinator_id === coordinator_id) {
					// success!
					next()
				}
				else {
					return res.sendStatus(401)
				}
			}
			else{
				return res.sendStatus(401);
			}
		}
		else  {
			return res.sendStatus(401);
		}
	}
	catch(error) {
		return res.sendStatus(401);
	}
}
module.exports = function() {
	return authorized;
};