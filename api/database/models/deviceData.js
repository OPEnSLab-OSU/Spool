/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;
const DeviceDatabase = require("./device");
const { strMapToObj } = require("../../utils/utils");

const ObjectID = require('mongodb').ObjectID;

class DeviceDataDatabase extends DatabaseInterface {

	static async getCollection(device_id) {
		const collection = await super.getCollection(device_id.toString());
		return collection;
	}

	static async owns(device_id, user) {
		return DeviceDatabase.owns(device_id, user)
	}
	
	static async getByDevice(device_id, user) {

		super.checkOwnership(device_id, user);
		
		const DeviceData = await this.getCollection(device_id);
		var deviceData = await DeviceData.find({device_id: device_id}).toArray().catch((err) => {
			throw err;
		});

		return this.__formatDeviceData(deviceData);
	}

	static async create(device_id, data, user) {

		super.checkOwnership(device_id, user);
		
		// device data collections are named by their device ID
		const DeviceData = await this.getCollection(device_id);

		return await DeviceData.insertOne(data).catch(err => {throw err;});
	}

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