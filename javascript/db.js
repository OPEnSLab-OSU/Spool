/**
 * Created by eliwinkelman on 7/9/19.
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoURI = "mongodb://localhost:27017";
let _client;


function useClient(callback) {
	if (_client) {
		callback(null, _client)
	}
		
	else {
		MongoClient.connect(mongoURI, function(err, client) {
			if (err) {
				callback(err, null)
			}
			else {
				_client = client;
				callback(null, client)
			}
		})
	}
}

module.exports = useClient;
