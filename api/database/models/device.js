/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;

const ObjectID = require('mongodb').ObjectID;
const ClientCertFactory = require('../../lib/ClientCertFactory');
const pem = require('pem');
const getKeys = require("../../lib/manageKeys");
const Permissions = require("../permissions");
const DataRun = require("../DataRun.js");

/**
 * Model for Device object, used to create new Device
 * @class
 */
class DeviceModel {
	constructor(deviceData) {
		this.name = deviceData.name;
		this.device_id = deviceData.device_id;
		this.fingerprint = deviceData.fingerprint;
		this.owner = deviceData.owner;
		this.coordinator = deviceData.coordinator;
		this.coordinator_id = deviceData.coordinator_id;
		this.network = deviceData.network;
		//adding dataRun to the constructor
		this.num_dataRuns = deviceData.num_dataRuns;
		this.permissions = deviceData.permissions || {};
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
		if (user.role === "user") {

			const deviceArray = user.devices.map(device => {
				return ObjectID(device)
			});

			usersDevices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
				throw err;
			});
		}

		else if (user.role === "admin") {
			usersDevices = await Devices.find({}).toArray().catch(err => {
				throw err;
			});
		}

		return usersDevices;
	}

	static async getMany(list) {
		const deviceArray = list.map(device => {
			return ObjectID(device)
		});

		const Devices = await this.getCollection();
		
		const devices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
			throw err;
		});
		
		return devices;
	}
	
	/**
	 * Gets the device with id.
	 * @param {string} id - The id of the device.
	 * @param {Object} user - The user requesting the device.
	 * @returns {Object} A device object from the MongoDB.
	 *
	 * @throws User must own the device.
	 */
	static async get(id) {

		const Devices = await this.getCollection();

		const devices = await Devices.find({device_id: new ObjectID(id)}).toArray().catch(err => {
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
	static async update(id, update) {

		const Devices = await this.getCollection();

		let device = {};

		device = await Devices.updateOne({device_id: new ObjectID(id)}, update);

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
	static async del(id) {

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
	 * @param {string} name - The name of the device.
	 * @param {Object} coordinator_id - The id of the coordinator these device is under.
	 * @param {Object} user - The user creating the device.
	 * @param {string} network_id - The id of the network where the device will be added.
	 * @returns {{device_id: string, certificate: string?, private_key: string?}} An object containing the authentication information for the device.
	 */

	static async create(name, coordinator_id, user, network_id) {
		let coordinator = false;

		let device_id = new ObjectID();
		if (coordinator_id === null) {
			// then this is a coordinator
			coordinator = true;
			coordinator_id = device_id;
		}

		const device_permissions = new Permissions();
		const device_data_run = new DataRun();
		const device_num_data_runs = device_data_run.num_dataRuns;

		device_permissions.add('view', user._id);
		device_permissions.add('edit', user._id);
		device_permissions.add('delete', user._id);

		let new_device = new DeviceModel({
			name: name,
			device_id: device_id,
			owner: user._id,
			coordinator: coordinator,
			coordinator_id: coordinator_id,
			network: network_id,
			num_dataRuns: device_num_data_runs,
			permissions: device_permissions.permissions
		});

		console.log("Created new device: ", new_device);

		const Devices = await this.getCollection();

		let response = {
			device_id: device_id
		};
		
		if (coordinator) {

			//======= Generate Client Certificate =======//
			// get the certificate authority keys
			const keys = await getKeys();

			// generate a client certificate
			const certFactory = new ClientCertFactory(process.env.OPENSSL_BINARY_PATH, keys.ca.certificate);
			const clientCert = await certFactory.create_cert(keys.ca.key, "Spool Client", false).catch((err) => {
				throw err
			});

			//======= Add the new device to the database =======//
			response.certificate = clientCert.certificate;
			response.private_key = clientCert.key;
			new_device.fingerprint = clientCert.fingerprint;
		}

		let devices = await Devices.insertOne(new_device).catch(err => {
			throw err;
		});

		//add device to user array
		const Users = await super.getCollection("Users");
		user.devices.push(device_id.toString());

		let userUpdate = Users.updateOne({_id: new ObjectID(user._id)}, {$set: {devices: user.devices}}).catch(err => {
			throw err
		});

		return response;
	}
}

module.exports = DeviceDatabase;
