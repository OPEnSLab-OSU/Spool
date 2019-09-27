/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;
const DeviceDatabase = require("./device");
const { strMapToObj } = require("../../utils/utils");

const ObjectID = require('mongodb').ObjectID;

/**
 * Manages the database storage for DeviceData objects.
 * @class
 * @implements DatabaseInterface
 */
class DeviceDataDatabase extends DatabaseInterface {

	/**
	 * Helper function to get the collection of devices.
	 * @param {string} device_id - the id of the device whose data is being accessed.
	 * @returns {Object} The MongoDB collection for devices
	 */
	static async getCollection(device_id) {
		const collection = await super.getCollection(device_id.toString());
		return collection;
	}

	/**
	 * Determines if user owns the DeviceData with id
	 * @param {string} device_id - The id of the device to check for ownership.
	 * @param {Object} user - The user to check for ownership.
	 * @returns {boolean} True if the user does own the device, false otherwise.
	 */
	static async owns(device_id, user) {
		return DeviceDatabase.owns(device_id, user)
	}

	/**
	 * Retrieves all device data for a device.
	 * @param {string} device_id - The id of the device.
	 * @param {Object} user - The user requesting the device data.
	 * @returns {Object} The data belonging to the given device.
	 */
	static async getByDevice(device_id, user) {

		super.checkOwnership(device_id, user);
		
		const DeviceData = await this.getCollection(device_id);
		var deviceData = await DeviceData.find({device_id: device_id}).toArray().catch((err) => {
			throw err;
		});

		return this.__formatDeviceData(deviceData);
	}

	/**
	 * Creates a new device data object.
	 * @param {string} device_id - The id of the device the data belongs to.
	 * @param {Object} data - The data being reported by the device.
	 * @returns {Array}
	 */
	static async create(device_id, data) {

		// device data collections are named by their device ID
		const DeviceData = await this.getCollection(device_id);

		const insertedData = await DeviceData.insertOne(data).catch(err => {throw err;});
		return insertedData;
	}

	/**
	 * Formats arrays of device data to be more easily accessible
	 * 
	 * @param {Array} deviceData - An array of raw devicedata from the database.
	 * @returns {Array} Reformated device data.
	 * @private
	 */
	static __formatDeviceData(deviceData) {
		return deviceData.map((data, index) => {

			let formatted_device = new Map();

			formatted_device.set("Data_Run", data.data_run);
			formatted_device.set("Date", data.data.timestamp.Date);
			formatted_device.set("Time", data.data.timestamp.Time);

			data.data.contents.forEach((sensor) => {
				for (var key in sensor.data) {
					if (sensor.data.hasOwnProperty(key)) {
						formatted_device.set(String(key), sensor.data[key]);
					}
				}
			});
			return strMapToObj(formatted_device);
		});
	};
}

module.exports = DeviceDataDatabase;