/**
 * @module access/networks
 */


var express = require('express');
var router = express.Router();
var secured = require('../../lib/middleware/secured');
var wrapAsync = require('../../lib/middleware/asyncWrap');
const NetworkDatabase = require('../../database/models/network');
const DeviceDatabase = require('../../database/models/device');

/**
 * API Endpoint to create a new network.
 * @function newNetwork
 * 
 */
router.post("/new/", secured, wrapAsync(async (req, res) => {
	
		
	
}));

router.post("/:network_id", secured, wrapAsync(async (req, res) => {
	
}));
