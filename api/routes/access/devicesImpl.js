/**
 * Created by eliwinkelman on 9/19/19.
 */

//MongoDB
var {useClient} = require('../../database/db');
const ObjectID = require('mongodb').ObjectID;
const DeviceDatabase = require('../../database/models/device');
const DeviceDataDatabase = require('../../database/models/deviceData');

async function getDevices(req, res) {
	try {
		let devices = await DeviceDatabase.getByUser(req.apiUser);
		res.send({devices: devices})
	}
	catch (error) {
		res.sendStatus(401);
	}
}

async function getDevice(req, res) {
	/***
	 * Endpoint to view a device and its data.
	 *
	 * Authentication: User must be logged in.
	 */
	
	var device_id = req.params.device;
	
	try {
		let device = await DeviceDatabase.get(device_id, req.apiUser);
		
		res.json({device: device})
	}
	catch (error) {
			res.sendStatus(401);		
	}
}

async function deleteDevice(req, res) {
	/**
	 *  Deletes a device the user owns.
	 *  Authentication: User must be logged in.
	 */

	try {
		DeviceDatabase.del(req.params.device, req.apiUser);
		res.sendStatus(200);
	}
	catch (error) {
		// send bad status
		res.sendStatus(401);
	}
}

async function createDevice(req, res) {
	/*
	 Endpoint to register a new device for data collection.

	 Request format:
	 {
	 “type”: <string - device type>
	 “name”: <string - device name>
	 }

	 Function:
	 1. Generate a client certificate and device id for the new device.
	 2. Add the new device object to the MongoDB "Devices" collection.
	 Note: The owner of the device is set as the currently logged in user.

	 Response: If successful, render a page with the new device id and authentication info and a button to download the JSON as a file.
	 */

	const newDeviceInfo = await DeviceDatabase.create(req.body.type, req.body.name, req.apiUser);
	res.send(newDeviceInfo);
}

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