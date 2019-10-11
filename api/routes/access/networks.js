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

	const result = await databaseWrap(res, next, NetworkDatabase.createWithUser(req.apiUser));

	return (result ? res.sendStatus(200) : null);

}));

router.get("/", secured, wrapAsync(async (req, res, next) => {
	try {
		const result = await NetworkDatabase.getByUser(req.apiUser);

		res.send(result)
	}
	catch(error) {
		res.sendStatus(401);
		console.log(error)
	}
}));

router.get("/:network_id", secured, wrapAsync (async (req, res, next) => {

	let fn = await databaseWrap(res, next, NetworkDatabase.get(req.params.network_id));
	let result = await fn();
	res.send(result)

}));

router.post("/add_device/", secured, wrapAsync (async (req, res, next) => {

	const result = await databaseWrap(res, next, NetworkDatabase.asUser(req.body.network_id, req.apiUser, NetworkDatabase.addDevice(req.body.network_id, req.body.device_id)));

	res.send(result);

}));

router.post("/remove_device/", secured, wrapAsync (async (req, res, next) => {

	const result = await databaseWrap(res, next, NetworkDatabase.removeDevice(req.body.network_id, req.body.device_id));

	res.send(result)

}));

router.post("/update/", secured, wrapAsync (async (req, res, next) => {

	const result = await databaseWrap(res, next, NetworkDatabase.updateWithUser(req.body.network_id, req.apiUser));

	res.send(result)

}));

module.exports = router;