/**
 * @module access/networks
 */

const NetworkDatabase = require('../../database/models/network');
const DeviceDatabase = require('../../database/models/device');
const Auth0UserManager = require('../../database/models/user');

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
    		res.sendStatus(404);
		}
	}
	catch(error) {
		res.sendStatus(500);
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
		if (await NetworkDatabase.checkPermissions(req.params.network_id, ['edit'], req.apiUser)) {
			const result = await NetworkDatabase.addDevice(req.body.network_id, req.body.device_id)
			res.send(result);
		}
		else {
			res.sendStatus(404);
		}
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
    	if (await NetworkDatabase.checkPermissions(req.params.network_id, ['edit'], req.apiUser)) {
        	const result = await NetworkDatabase.removeDevice(req.body.network_id, req.body.device_id);
			res.send(result);
        }
		else {
    		res.sendStatus(404);
		}
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
		console.error(error);
	}
}

/**
 * Updates permissions to view and edit a network.
 * @param {Object} req - An Express request object.
 * @param {Object} res - An Express response object.
 * @returns {Promise.<void>}
 */
async function updateNetworkPermissions(req, res) {
	try {
		const network_id = req.body.network_id;

		if (await NetworkDatabase.checkPermissions(network_id, ['edit'], req.apiUser)) {

			const network = await NetworkDatabase.get(network_id);
			const owner = network.owner;

			for (const [key, value] of Object.entries(req.body.permissions)) {

				// don't modify owner permissions
				if (key.toString() !== owner.toString()) {

					// check if the user already has permissions
					if (network.permissions.hasOwnProperty(key)) {
							// get the added permissions, only allow adding view and edit
						const addPermissions = value.filter((el) => !network.permissions[key].includes(el) && (el === 'view' || el === 'edit'));

						console.log(value);
						// get the removed permissions
						const removedPermissions = network.permissions[key].filter((el) => !value.includes(el));
						console.log(addPermissions);
						console.log(removedPermissions);
						// add permissions
						await NetworkDatabase.addPermissions(network_id, addPermissions, key, req.apiUser, false);

						// remove permissions
						await NetworkDatabase.removePermissions(network_id, removedPermissions, key, req.apiUser, false);

					}
					else {

						// if the user doesn't have any permissions, add the specified ones (but only view and edit)
						const addPermissions = value.filter((el) => (el === 'view' || el === 'edit'));

						// add permissions
						await NetworkDatabase.addPermissions(network_id, addPermissions, key, req.apiUser, false);
					}

					// if the user has permissions, make sure
					if (await NetworkDatabase.hasAnyPermissions(network_id, key)) {
						await Auth0UserManager.addNetworkToUser(key, network_id);
					}
					else {
						await Auth0UserManager.removeNetworkFromUser(key, network_id);
					}
				}
			}
			res.sendStatus(200);
		}
		else {
			res.sendStatus(404);
		}
	}
	catch(error) {
		console.error(error);
		res.sendStatus(404);
	}
}

module.exports = {
	getNetworks: getNetworks,
	getNetwork: getNetwork,
	deleteNetwork: deleteNetwork,
	createNetwork: createNetwork,
	getNetworkDevices: getNetworkDevices,
    addNetworkDevice: addNetworkDevice,
    removeNetworkDevice: removeNetworkDevice,
	updateNetworkPermissions: updateNetworkPermissions
};