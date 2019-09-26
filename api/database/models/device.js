/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;
const ObjectID = require('mongodb').ObjectID;
var ClientCertFactory = require('../../lib/ClientCertFactory');
var pem = require('pem');
var getKeys = require("../../lib/manageKeys");

class DeviceModel {
	constructor(name, device_id, fingerprint, owner) {
		this.name = name;
		this.device_id = device_id;
		this.fingerprint = fingerprint;
		this.owner = owner;
	}
}

/**
 * Manages database storage for Device objects
 * @implements DatabaseInterface
 * @class
 */
class DeviceDatabase extends DatabaseInterface {

	/**
	 * Helper function to get the collection of devices.
	 * @returns {Object} The MongoDB collection for devices
	 */
	static async getCollection() {
		const collection = await super.getCollection("Devices");
		return collection;
	}

	/**
	 * Determines if user owns the device with id
	 * @param {string} id - The id of the device to check for ownership.
	 * @param {Object} user - The user to check for ownership.
	 * @returns {boolean} True if the user does own the device, false otherwise.
	 */
	static async owns(id, user) {
		return user.devices.includes(id.toString())
	}

	/**
	 * Gets all the devices belonging to this user.
	 * @param {Object} user - A user object
	 * @returns {Array} An array of devices belonging to the user.
	 */
	static async getByUser(user) {

		// check which user role we have to handle
		let usersDevices = [];
		const Devices = await this.getCollection();
		if (user.role == "user") {

			const deviceArray = user.devices.map(device => {
				return ObjectID(device)
			});

			usersDevices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
				throw err;
			});
		}

		else if (user.role == "admin") {
			usersDevices = await Devices.find({}).toArray().catch(err => {
				throw err;
			});
		}

		return usersDevices;
	}

	/**
	 * Gets the device with id.
	 * @param {string} id - The id of the device.
	 * @param {Object} user - The user requesting the device.
	 * @returns {Object} A device object from the MongoDB.
	 *
	 * @throws User must own the device.
	 */
	static async get(id, user) {

		this.checkOwnership(id, user);

		const Devices = await this.getCollection();

		var devices = await Devices.find({device_id: new ObjectID(id)}).toArray().catch(err => {
			throw err
		});
		
		return devices[0];
	}

	/**
	 * Updates a device.
	 * @param {string} id - The id of the device to update.
	 * @param {Object} update - The update to apply.
	 * @param {Object} user - The user requesting the update.
	 * @returns {Object} The updated device.
	 *
	 * @throws User must own the device.
	 */
	static async update(id, update, user) {

		this.checkOwnership(id, user);

		const Devices = await this.getCollection();

		let device = {};
		if (this.owns(id, user)) {
			device = await Devices.updateOne({device_id: new ObjectID(id)}, update)
		}
		return device;
	}

	/**
	 * Deletes a device.
	 * @param {string} id - The id of the device to delete.
	 * @param {Object} user - The user attempting to delete the device.
	 * @returns {boolean} True if the device was deleted.
	 *
	 * @throws User must own the device.
	 */
	static async del(id, user) {
		this.checkOwnership(id, user);

		const Devices = await this.getCollection();

		// delete the device
		Devices.deleteOne({device_id: new ObjectID(id)});

		//delete the device data
		const DeviceData = await super.getCollection(id.toString());
		DeviceData.deleteOne({device_id: new ObjectID(id)});
		
		return true;
	}

	/**
	 * Creates a new device in the database which belongs to user.
	 *
	 * 1. Generate a client certificate and device id for the new device.
	 * 2. Add the new device object to the MongoDB "Devices" collection.
	 * 
	 * @param {string} type - The type of the device.
	 * @param {string} name - The name of the device.
	 * @param {Object} user - The user creating the device.
	 * @returns {{device_id: string, certificate: string, private_key: string}} An object containing the authentication information for the device.
	 */
	static async create(type, name, user) {
		
		//generate a device_id
		const device_id = new ObjectID();

		//======= Generate Client Certificate =======//
		// get the certificate authority keys
		const keys = await getKeys();

		// generate a client certificate
		const certFactory = new ClientCertFactory(process.env.OPENSSL_BINARY_PATH, keys.ca.certificate);
		const clientCert = await certFactory.create_cert(keys.ca.key, "Spool Client " + device_id, false).catch((err) => {
			throw err
		});

		//======= Add the new device to the database =======//

		const Devices = await this.getCollection();
		
		const new_device = {
			type: type,
			name: name,
			device_id: device_id,
			fingerprint: clientCert.fingerprint,
			owner: user._id
		};

		let devices = await Devices.insertOne(new_device).catch(err => {
			throw err;
		});

		//add device to user array
		const Users = await super.getCollection("Users");
		user.devices.push(device_id.toString());

		let userUpdate = Users.updateOne({_id: new ObjectID(user._id)}, {$set: {devices: user.devices}}).catch(err => {
			throw err
		});

		return {
			device_id: device_id,
			certificate: clientCert.certificate,
			private_key: clientCert.key
		}
	}
}

module.exports = DeviceDatabase;
