
var {useClient }= require('../../database/db.js');
var pem = require('pem');
const ObjectID = require('mongodb').ObjectID;


function authorized(req, res, next) {
	//reject if not authorized

	if (!req.client.authorized) {
		return res.status(401).send('Device is not authorized 1');
	}

	var device_id = req.body.device_id;

	if (!device_id) {
		return res.status(401).send('Device is not authorized 2');
	}
	else  {
		next();

		//make sure that the certification actually belongs to the requesting device
		var cert = req.socket.getPeerCertificate();
		
		useClient((err, client) => {
			if (err) {return next(err);}

			const db = client.db("Loom");
			const Devices = db.collection("Devices");

			Devices.find({device_id: new ObjectID(device_id)}).toArray((err, device) => {
				if (err) {return next(err);}

				if (device.length == 0) {
					return res.status(401).send('Device is not authorized 3')
				}

				var fingerprint = device[0].fingerprint;

				// compare the fingerprint in the db to the devices fingerprint
				if (fingerprint === cert.fingerprint) {
					next()
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