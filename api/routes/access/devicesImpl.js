/**
 * @module access/devices
 */

const DeviceDatabase = require('../../database/models/device');
const DeviceDataDatabase = require('../../database/models/deviceData');
const NetworkDatabase = require("../../database/models/network");

/**
 * Retrieves devices from the database by user and sends them as the http response.
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getDevices(req, res) {
	try {
		let devices = await DeviceDatabase.getByUser(req.apiUser);
		res.send({devices: devices})
	}
	catch (error) {
		res.sendStatus(404);
	}
}

/**
 * Retrieve a specific devices data from the database and sends it as the http response.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getDevice(req, res) {
	
	const device_id = req.params.device;
	
	try {

		const device = DeviceDatabase.get(device_id);

		// check permissions by the network
		if (await NetworkDatabase.checkPermissions(device.network, ['view'], req.apiUser)) {
			res.json({device: device})
		}
		else {
			res.sendStatus(404);
		}
	}
	catch (error) {
		res.sendStatus(404);
	}
}

/**
 * Deletes a device and sends a success http status code if successful.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function deleteDevice(req, res) {
	
	try {
		let device = await DeviceDatabase.get(req.body.device_id);

		if (await DeviceDatabase.checkPermissions(req.body.device_id, ['edit'], req.apiUser)){

			await DeviceDatabase.del(req.body.device_id);
			await NetworkDatabase.removeDevice(device.network, req.body.device_id);
			res.sendStatus(200);
		}
		else {
			res.sendStatus(404);
		}
	}
	catch (error) {
		// send bad status
		res.sendStatus(404);
	}
}

/**
 * Creates a new device and sends an http response with the devices authentication information.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function createDevice(req, res) {
	if (await NetworkDatabase.checkPermissions(req.body.network_id, ['edit'], req.apiUser)){

		const network = await NetworkDatabase.get(req.body.network_id);

		let coordinator_id = null;

		for (let device in network.devices) {
			if (device.coordinator) {
				coordinator_id = device.device_id
			}
		}

		const newDeviceInfo = await DeviceDatabase.create(req.body.name, coordinator_id, req.apiUser, req.body.network_id);

		await NetworkDatabase.addDevice(req.body.network_id, newDeviceInfo.device_id);

		res.send(newDeviceInfo);
	}
	else {
		res.sendStatus(404);
	}
}

/**
 * Retrieves the data of a device from the database and sends the data as the http response.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getDeviceData(req, res) {
	const device_id = req.params.device;
	try {
		if (await DeviceDatabase.checkPermissions(device_id, ['view'], req.apiUser)) {
			const datas = await DeviceDataDatabase.getByDevice(device_id);
			res.send({data: datas});
		}
		else {
			res.sendStatus(404);
		}
	}
	catch (error) {
		res.sendStatus(404);
	}
}

module.exports = {
	getDevices: getDevices,
	getDevice: getDevice,
	deleteDevice: deleteDevice,
	createDevice: createDevice,
	getDeviceData: getDeviceData
};