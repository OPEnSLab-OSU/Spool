/**
 * @module database
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dotenv = require('dotenv');
const fs = require('fs');
const Permissions = require('./permissions');
dotenv.config();

let _client;

const readOptions = {
	encoding: "utf8"
};

async function useClient() {
	/**
	 * Returns the MongoDB client as a promise
	 */

	let uri;

	if (process.env.DEVELOPMENT) {
		uri = "mongodb://" + process.env.MONGO_ADDRESS;
	}
	else {
		const passKeyPath = "/run/secrets/mongopass.txt";
		const passKey = fs.readFileSync(passKeyPath, readOptions);
		uri= "mongodb+srv://" + process.env.MONGO_USERNAME + ":" + passKey + "@" + process.env.MONGO_ADDRESS;
	}

	// check if we already have the client and return it if we do.
	if (_client) {
			return _client
	}
	else {
		// otherwise connect to the client and return it
		_client = await MongoClient.connect(uri, {useNewUrlParser: true}).catch(err => {throw(err);});
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
	 * Retrieves the Loom database to work with.
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

    /**
	 * Adds a list of permissions to a user, possibly checking the permissions of the requesting user to do so
     * @param {string} id - the id of the object to change permissions for
     * @param {[string]} permission_names - an array of permission names to add to the user
     * @param {string} otherUserId - the id of the user to add the permissions for
     * @param {Object} user - the user requesting the permissions be added (for checking their permissions)
     * @param {bool} checkPermissions - a boolean describing whether the permissions of user allow them to add permissions. Defaults to true.
     * @returns {Promise.<void>}
     */
	static async addPermissions(id, permission_names, otherUserId, user, checkPermissions = true) {
		const object = await this.get(id);

		const permissions = new Permissions(object.permissions);

		if (!checkPermissions || permissions.check('edit', user._id)){
			for (let permission of permission_names) {
				permissions.add(permission, otherUserId);
			}
		}

		// actually update the object
		await this.update(id, {$set: {permissions: permissions.permissions}});
	}

    /**
	 * Removes a list of permissions from a user, possibly checking the permissions of the requesting user to do so
     * @param {string} id - the id of the object to change permissions for
     * @param {[string]} permission_names - an array of permission names to remove from the user
     * @param {string} otherUserId - the id of the user to remove the permissions from
     * @param {Object} user - the user requesting the permissions be removed (for checking their permissions)
     * @param {bool} checkPermissions - a boolean describing whether the permissions of user allow them to remove permissions. Defaults to true.
     * @returns {Promise.<void>}
     */
	static async removePermissions(id, permission_names, otherUserId, user, checkPermissions = true) {
		const object = await this.get(id);

		const permissions = new Permissions(object.permissions);

		if (!checkPermissions || permissions.check('edit', user._id)){
			for (let permission of permission_names) {
				permissions.remove(permission, otherUserId);
			}
		}

		// actually update the object
		await this.update(id, {$set: {permissions: permissions.permissions}});
	}

    /**
	 * Checks if a user has a set of permissions to an object in the database.
     * @param {string} id - the database id of the object to check permissions for
     * @param {[string]} permission_names - An array of permission names to look for
     * @param {Object} user - the user to check permissions for
     * @returns {Promise.<boolean>}
     */
	static async checkPermissions(id, permission_names, user) {
		const object = await this.get(id);

		const permissions = new Permissions(object.permissions);

		for (const permission of permission_names) {

			if (!permissions.check(permission, user._id)) {
				return false
			}
		}
		return true;
	}

    /**
	 * Checks if a user has any permissions to an object in the database.
     * @param {string} id - the id of the object in the database
     * @param {string} user_id - the id of the user to check has permissions
     * @returns {Promise.<boolean>}
     */
	static async hasAnyPermissions(id, user_id) {
		const object = await this.get(id);

		const permissions = new Permissions(object.permissions);

		return permissions.has_permissions(user_id);
	}

	static async owns(id, user) {
		return false;
	}

	static async create(){};

	static async del(id){};

	static async get(id){};

	static async update(id, update){};

	static async asUser(id, user, fn) {
		const owns = await this.checkOwnership(id, user);
		
		return fn;
	}

	static validateObjectIdHex(id){
		return id.match(/^[0-9a-fA-F]{24}$/);
	}

}

module.exports = {
	useClient: useClient,
	DatabaseInterface: DatabaseInterface
};

