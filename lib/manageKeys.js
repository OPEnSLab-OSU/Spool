/**
 * Created by eliwinkelman on 7/17/19.
 */
var fs = require('fs');
const serverPath = './.ec-certificates/server';
const caPath = './.ec-certificates/ca';
const keyPath = '-key.pem';
const certificatePath = '-crt.pem';
var pem = require('pem');

const readOptions = {
	encoding: "utf8"
};

module.exports = async function getKeys() {
	//update this function to regenerate only necessary pieces 
	// (i.e. csr and client 
	// key should always stay the same but service key
	// and certificate should get regenerated)
	if (fs.existsSync(caPath + keyPath) && fs.existsSync(caPath + certificatePath)) {
		//we have a certificate authority.

		var ca = {
			key: fs.readFileSync(caPath + keyPath, readOptions),
			certificate: fs.readFileSync(caPath + certificatePath, readOptions)
		};

		//check if we have keys for the client
		if (fs.existsSync(serverPath+keyPath) && fs.existsSync(serverPath+certificatePath)) {
			console.log("Loading keys from file system.");

			var keys = {
				key: fs.readFileSync(serverPath+keyPath, readOptions),
				certificate: fs.readFileSync(serverPath+certificatePath, readOptions),
				ca: ca
			};
			
			//check that certificate hasn't expired. renew them if they have.

			return keys
		}
		else {
			console.log("You must have server keys in '" + serverPath + "'.\n" +
			"Key should be named " + keyPath + " and certificate should be named " + certificatePath + "\n")
		}
	}
	else {
		console.log("You must have a certificate authority in ./.certificates/. \n" +
			"Key should be at ca-key.pem and certificate at ca-crt.pem. \n" +
			"These can be generated with: \n \n" +
			"       openssl req -new -x509 -days 365 -keyout ca-key.pem -out ca-crt.pem");
		throw new Error("No certificate authority");

	}
};