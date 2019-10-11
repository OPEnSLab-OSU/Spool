
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoURI = "mongodb://mongo:27017";
let _client;

async function useClient() {
	/**
	 * Returns the MongoDB client as a promise
	 */
	console.log("Attempting to connect to mongodb");
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

/**
 * Defines an interface for database management classes to implement/inherit from.
 *
 * @interface DatabaseInterface
 */
class DatabaseInterface {

	/**
	 * Retrieves the loom database to work with.
	 * @returns {Object}
	 */
	static async getDatabase() {
		const client = await useClient().catch(error => {console.log(error)});
		const db = client.db("Loom");
		return db;
	}

	/**
	 * Get a collection from the Loom database. Override this method in children classes to retrieve the specific collection(s) they operate on.
	 * @param {string} name - The name of the collection.
	 * @returns {Object}
	 */
	static async getCollection(name) {
		const db =  await this.getDatabase().catch(error => {console.log(error)});
		const collection = db.collection(name.toString());
		return collection;
	}

	static async owns(id, user) {
		return false;
	}

	static async create(){};

	static async del(id){};

	static async get(id){};

	static async update(id){};

	static async asUser(id, user, fn) {
		const owns = await this.checkOwnership(id, user);
		
		return fn;
	}

	/**
	 * Checks whether or not a user owns a type of object with the id. This method calls the owns method of the child that calls it, so ownership is determined by each model.
	 *
	 * @param {string} id - The id of the object (which id will depend on the type of object).
	 * @param {Object} user - The user to check for ownership.
	 * @throws If the user doesn't own the object.
	 * 
	 *  @example
	 * function myDatabaseMethod() {
	 *      this.checkOwnership(id, user)
	 *
	 *      // my method code if the user owns the object.
	 * }
	 */
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

