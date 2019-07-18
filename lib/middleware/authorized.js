/**
 * Created by eliwinkelman on 7/17/19.
 */
module.exports = function() {
	return function authorized(req, res, next) {
		//reject if not authorized
		if (!req.client.authorized) {
			return res.status(401).send('User is not authorized');
		}

		//make sure that the certification actually belongs to the requesting device
		var cert = req.socket.getPeerCertificate();
		if (cert.subject) {
			console.log(cert)
			console.log(cert.subject.CN);
		}
		next();
	}
};