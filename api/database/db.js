
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
		_client = await MongoClient.connect(mongoURI).catch(err => {throw(err);});
		return _client
	}
}

class DatabaseInterface {
	
	static async getDatabase() {
		const client = await useClient().catch(error => {console.log(error)});
		const db = client.db("Loom");
		return db;
	}

	static async getCollection(name) {
		const db =  await this.getDatabase().catch(error => {console.log(error)});
		const collection = db.collection(name);
		return collection;
	}

	static async owns(id, user) {
		return false;
	}

	static async checkOwnership(id, user) {
		if (user != null) {
			let owns = await this.owns(id, user).catch(error => {console.log(error)});

			if (!owns) {
				throw new Error("Unauthorized Database Request");
			}
		}
	}
}

module.exports = {
	useClient: useClient,
	DatabaseInterface: DatabaseInterface
};

