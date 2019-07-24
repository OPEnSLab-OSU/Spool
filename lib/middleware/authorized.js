/**
 * Created by eliwinkelman on 7/17/19.
 */
var mongoClient = require('../../javascript/db.js');
var pem = require('pem');
const ObjectID = require('mongodb').ObjectID;

module.exports = function() {
	return function authorized(req, res, next) {
		//reject if not authorized
		
		if (!req.client.authorized) {
			
			return res.status(401).send('Device is not authorized');
		}

		var device_id = req.body.device_id;

		if (!device_id) {
			return res.status(401).send('Device is not authorized');
		}
		else  {
			next();
			
			//make sure that the certification actually belongs to the requesting device
			var cert = req.socket.getPeerCertificate();

			mongoClient((err, client) => {
				if (err) {return next(err);}

				const db = client.db("Loom");
				const Devices = db.collection("Devices");

				Devices.find({device_id: new ObjectID(device_id)}).toArray((err, device) => {
					if (err) {return next(err);}
					
					if (device.length == 0) {
						return res.status(401).send('Device is not authorized')
					}
					
					var fingerprint = device[0].fingerprint;

					// compare the fingerprint in the db to the devices fingerprint
					if (fingerprint === cert.fingerprint) {
						next()
					}
					else{
						return res.status(401).send('Device is not authorized');
					}

				})

			});
		}
	}
};