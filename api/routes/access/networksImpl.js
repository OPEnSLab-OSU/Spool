/**
 * @module access/networks
 */

const NetworkDatabase = require('../../database/models/network');
const DeviceDatabase = require('../../database/models/device');

/**
 * Retrieves all networks belonging to the requesting user and sends them in an http request response.
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getNetworks(req, res) {
    try {
		const result = await NetworkDatabase.getByUser(req.apiUser);
		res.send({networks: result});
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}

/**
 * Creates a new network for the current user and sends a http request to the user with the newly created network.
 *
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 *
 */
async function createNetwork(req, res) {
    try {
		const result = await NetworkDatabase.createWithUser(req.body.name, req.apiUser);
		res.send(result);
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}

/**
 * Gets a single network and returns it in the http response.
 *
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getNetwork(req, res){
    try {
    	if (await NetworkDatabase.checkPermissions(req.params.network_id, ['view'], req.apiUser)){
    		const result = await NetworkDatabase.get(req.params.network_id);

			res.send(result);
        }
		else {
    		res.sendStatus(401);
		}
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}

/**
 * Gets all the devices that belong to the specified network and returns them in the http response.
 *
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function getNetworkDevices(req, res) {
    try {

    	if (await NetworkDatabase.checkPermissions(req.params.network_id, ['view'], req.apiUser)){
    		const network = await NetworkDatabase.get(req.params.network_id);
			const devices = await DeviceDatabase.getMany(network.devices);

			res.send({devices: devices});
        }
		else {
			console.log("Missing permissions to see the network devices.");
    		res.sendStatus(401);
		}
	}
	catch(error) {
		res.sendStatus(401);
		console.log("Error: ", error);
	}
}

/**
 * Adds an existing device as a device in the network.
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function addNetworkDevice(req, res) {
	try {
		const result = await NetworkDatabase.ifHasPermissions(req.body.network_id, ['edit'], req.apiUser, NetworkDatabase.addDevice(req.body.network_id, req.body.device_id));
		res.send(result);
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}

/**
 * Removes an existing device as a device in the network. This function does not do anything to the actual device object, it just disassociates it from the network.
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function removeNetworkDevice(req, res) {
    try {
		const result = await NetworkDatabase.ifHasPermissions(req.body.network_id, ['edit'], req.apiUser, NetworkDatabase.removeDevice)(req.body.network_id, req.body.device_id);
		res.send(result);
	}
	catch (error) {
		res.sendStatus(401);
		console.log(error);
	}
}

/**
 * Deletes the network. Does not delete devices belonging to the network.
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 */
async function deleteNetwork(req, res) {
	try {
		if (await NetworkDatabase.checkPermissions(req.body.network_id, ['delete'], req.apiUser)){

			 const result = await NetworkDatabase.del(req.body.network_id);
			 res.send(result);
		}
		else {
			res.sendStatus(401);
		}

	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}

module.exports = {
	getNetworks: getNetworks,
	getNetwork: getNetwork,
	deleteNetwork: deleteNetwork,
	createNetwork: createNetwork,
	getNetworkDevices: getNetworkDevices,
    addNetworkDevice: addNetworkDevice,
    removeNetworkDevice: removeNetworkDevice
};