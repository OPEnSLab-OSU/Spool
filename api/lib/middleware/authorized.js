
var {useClient }= require('../../database/db.js');
var pem = require('pem');
const ObjectID = require('mongodb').ObjectID;


function authorized(req, res, next) {
	//reject if not authorized

	//make sure that the certification actually belongs to the requesting device
	let cert = req.socket.getPeerCertificate();

	console.log(cert);

	if (!req.client.authorized) {
		return res.status(401).send('Device is not authorized 1');
	}

	let device_id = req.body.device_id;
	let coordinator_id = req.body.coordinator_id;
	
	if (!device_id) {
		return res.status(401).send('Device is not authorized 2');
	}
	else  {
		//next();

		//make sure that the certification actually belongs to the requesting device
		let cert = req.socket.getPeerCertificate();
		
		useClient((err, client) => {
			if (err) {return next(err);}

			const db = client.db("Loom");
			const Devices = db.collection("Devices");

			Devices.find({device_id: new ObjectID(coordinator_id)}).toArray((err, coordinator) => {
				if (err) {return next(err);}

				if (coordinator.length == 0) {
					return res.status(401).send('Device is not authorized 3')
				}

				var fingerprint = coordinator[0].fingerprint;

				// compare the fingerprint in the db to the devices fingerprint
				if (fingerprint === cert.fingerprint) {
					// fingerprint is right. Check that this device actually has this coordinator.
					Devices.find({device_id: new ObjectID(device_id)}).toArray((err, device) => {
						if (device.length == 0) {
							return res.sendStatus(401)
						}
						if (device[0].coordinator == coordinator_id) {
							// success!
							next()
						}
						else {
							return res.sendStatus(401)
						}
					})
					
				}
				else{
					return res.status(401).send('Device is not authorized 4');
				}

			})

		});
	}
}
module.exports = function() {
	return authorized;
};