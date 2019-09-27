/**
 * @module manageKeys
 */

var fs = require('fs');
const caPath = './api/temp/ca';
const keyPath = '.key';
const certificatePath = '.crt';
var pem = require('pem');

const readOptions = {
	encoding: "utf8"
};

/**
 * Retrieves the relevant TLS certificates and keys.
 * @function getKeys
 * @returns {Promise<Object, any>} A promise that will eventually return an object containing the servers key, certificate and the device certificate authority certificate and key.
 */
module.exports = async function getKeys() {

	const caKeyPath = "/run/secrets/ca.key";
	const caCertPath = "/run/secrets/ca.crt";
	const serverKeyPath = "/run/secrets/server.key";
	const serverCertPath = "/run/secrets/server.crt";

	if (fs.existsSync(caKeyPath) && fs.existsSync(caCertPath)) {
		//we have a certificate authority.

		var ca = {
			key: fs.readFileSync(caKeyPath, readOptions),
			certificate: fs.readFileSync(caCertPath, readOptions)
		};

		//check if we have keys for the client
		if (fs.existsSync(serverKeyPath) && fs.existsSync(serverCertPath)) {
			console.log("Loading keys from file system.");

			var keys = {
				key: fs.readFileSync(serverKeyPath, readOptions),
				certificate: fs.readFileSync(serverCertPath, readOptions),
				ca: ca
			};
			
			//check that certificate hasn't expired. renew them if they have.
			return keys
		}
		else {
			console.log("You must have server certificate at " + serverCertPath + " and a server key at " + serverKeyPath + "./n")
		}
	}
	else {
		console.log("You must have a certificate authority at " + caCertPath + " and a certificate authority key at " + caKeyPath + "./n")

		throw new Error("No certificate authority");
	}
};
