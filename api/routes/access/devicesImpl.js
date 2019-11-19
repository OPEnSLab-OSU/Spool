/**
 * @module access/devices
 */

//MongoDB
var {useClient} = require('../../database/db');
const ObjectID = require('mongodb').ObjectID;
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
		res.sendStatus(401);
	}
}

/**
 * Retrieve a specific devices data from the database and sends it as the http response.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getDevice(req, res) {
	
	var device_id = req.params.device;
	
	try {
		let device = await DeviceDatabase.get(device_id, req.apiUser);
		
		res.json({device: device})
	}
	catch (error) {
			res.sendStatus(401);		
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

		const device = DeviceDatabase.get(req.body.device_id, req.apiUser);
		DeviceDatabase.del(req.body.device_id, req.apiUser);
		NetworkDatabase.removeDevice(device.network, req.body.device_id);

		res.sendStatus(200);
	}
	catch (error) {
		// send bad status
		res.sendStatus(401);
	}
}

/**
 * Creates a new device and sends an http response with the devices authentication information.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function createDevice(req, res) {

	const newDeviceInfo = await DeviceDatabase.create(req.body.name, false, req.apiUser, req.body.network_id);

	NetworkDatabase.addDevice(req.body.network_id, newDeviceInfo.device_id);

	res.send(newDeviceInfo);
}

/**
 * Retrieves the data of a device from the database and sends the data as the http response.
 * 
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getDeviceData(req, res) {

	var device_id = req.params.device;

	try {
		const datas = await DeviceDataDatabase.getByDevice(device_id, req.apiUser);
		res.send({data: datas});
	}
	catch (error) {
		res.sendStatus(401);
	}
}

module.exports = {
	getDevices: getDevices,
	getDevice: getDevice,
	deleteDevice: deleteDevice,
	createDevice: createDevice,
	getDeviceData: getDeviceData
};