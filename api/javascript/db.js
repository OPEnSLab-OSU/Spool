/**
 * Created by eliwinkelman on 7/9/19.
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoURI = "mongodb://localhost:27017";
let _client;

async function useClient() {
	/**
	 * Returns the MongoDB client as a promise
	 */

	// check if we already have the client and return it if we do.
	if (_client) {
			return _client
	}
	else {

		// otherwise connect to the client and return it
		_client = MongoClient.connect(mongoURI).catch(err => {throw(err);});
		return _client
	}
}

module.exports = useClient;
