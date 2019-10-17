/**
 * @module access/networks
 */


var express = require('express');
var router = express.Router();
var secured = require('../../lib/middleware/secured');
var {wrapAsync, databaseWrap }  = require('../../lib/middleware/middleware');
const NetworkDatabase = require('../../database/models/network');
const DeviceDatabase = require('../../database/models/device');

/**
 * API Endpoint to create a new network.
 * @function newNetwork
 * 
 */
router.post("/new/", secured, wrapAsync(async (req, res, next) => {
	try {
		const result = await NetworkDatabase.createWithUser(req.body.name, req.apiUser);
		res.send(result);
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}

}));

router.get("/", secured, wrapAsync(async (req, res, next) => {
	try {
		const result = await NetworkDatabase.getByUser(req.apiUser);
		console.log(result);
		res.send({networks: result});
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error)
	}
}));

router.get("/view/:network_id", secured, wrapAsync (async (req, res, next) => {
	try {
		const result = await NetworkDatabase.asUser(req.params.network_id, req.apiUser, NetworkDatabase.get(req.params.network_id));
		console.log(result);
		res.send(result);
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}));

router.get("/devices/:network_id", secured, wrapAsync (async (req, res, next) => {
	try {
		const network = await NetworkDatabase.asUser(req.params.network_id, req.apiUser, NetworkDatabase.get(req.params.network_id));
		const devices = await DeviceDatabase.getMany(network.devices);
		res.send({devices: devices})
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}));

router.post("/add_device/", secured, wrapAsync (async (req, res, next) => {

	try {
		const result = await NetworkDatabase.asUser(req.body.network_id, req.apiUser, NetworkDatabase.addDevice(req.body.network_id, req.body.device_id))
		res.send(result);
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}

}));

router.post("/remove_device/", secured, wrapAsync (async (req, res, next) => {

	try {
		const result = await NetworkDatabase.asUser(req.body.network_id, req.apiUser, NetworkDatabase.removeDevice(req.body.network_id, req.body.device_id))
		
		res.send(result);
	}
	catch (error) {
		res.sendStatus(401);
		console.log(error);
	}
}));

router.post("/delete/", secured, wrapAsync (async (req, res, next) => {

	try {
		const result = await NetworkDatabase.asUser(req.body.network_id, req.apiUser, NetworkDatabase.delWithUser(req.body.network_id, req.apiUser));
		res.send(result);
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error);
	}
}));

module.exports = router;