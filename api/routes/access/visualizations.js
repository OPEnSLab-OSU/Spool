/**
 * @module access/visualization
 */

var express = require('express');
var router = express.Router();
var secured = require('../../lib/middleware/secured');
var wrapAsync = require('../../lib/middleware/asyncWrap');
const {VisualizationDatabase, DeviceDatabase} = require('../../database/models');

/**
 * API Endpoint to create a new visualization object for the passed device.
 * @function newVisualization
 *
 * @swagger
 * /access/visualization/new:
 *      post:
 *          description: Creates a new visualization.
 *          tags:
 *              - access
 *              - visualization
 *          requestBody:
 *              required: true
 *              content:
 *                  'application/json':
 *                      schema:
 *                          type: object
 *                          required:
 *                              - device_id
 *                          properties:
 *                              device_id:
 *                                  type: string
 *                                  description: The id of the device given by spool during registration. 
 *                          example:
 *                              device_id: asdg034kajd024lc94
 *                              
 */
router.post('/new', wrapAsync(async (req, res) => {

	let visualizationData = req.body;

	//get the device id
	const device_id = req.body.device_id;

	try {
		if	(await DeviceDatabase.checkPermissions(device_id, ['edit'], req.apiKey)) {

			const _ = await VisualizationDatabase.create(visualizationData, device_id, req.apiUser);
			res.sendStatus(200);
        }
        else {
			res.sendStatus(404);
        }

	}
	catch(error) {
		console.log(error);
		res.sendStatus(404);
	}
}));

/**
 * API Endpoint to retrieve all the visualizations for a device.
 * @function getVisualizations
 *
 * @swagger
 * /access/visualization/{device_id}:
 *      get:
 *          description: Creates a new visualization.
 *          tags:
 *              - access
 *              - visualization
 *          parameters:
 *              - in: path
 *                name: device
 *                schema:
 *                  type: string
 *                required: true
 *                description: The id of the device to get visualizations for.
 */
router.get('/:device_id', secured, wrapAsync(async (req, res) => {

	const device_id = req.params.device_id;

	try {
		if (await DeviceDatabase.checkPermissions(device_id, ['view'], req.apiUser)) {
			const visualizations = await VisualizationDatabase.getByDevice(device_id, req.apiUser);
			res.send(visualizations);
		}
		else {
			res.sendStatus(404);
		}

	}
	catch (error) {
		console.error(error);
		res.sendStatus(404);
	}
}));

/**
 * API Endpoint to update a visualization.
 * @function updateVisualization
 *
 * @swagger
 *  /access/visualization/{device_id}:
 *      post:
 *          description: Updates a visualization.
 *          tags:
 *              - access
 *              - visualization
 *         
 */
router.post('/update/', secured, wrapAsync(async (req, res) => {

	const visualization_id = req.body.visualization_id;

	try {
		if (await VisualizationDatabase.checkPermissions(visualization_id, ['edit'], req.apiUser)) {
			await VisualizationDatabase.update(visualization_id, req.body);
			res.sendStatus(200);
		}
		else {
			res.send(404);
		}

	}
	catch(error) {
		res.sendStatus(401);
		/* TODO: Add an APIErrorResponseHandler class/function to deal with different types of errors and send meaningful messages to the client. */
	}
}));

/**
 * API Endpoint to delete a visualization.
 * @function deleteVisualization
 * 
 * @swagger
 * /access/visualization/:
 *      post:
 *          description: Deletes a visualization.
 *          tags:
 *              - access
 *              - visualization
 *          requestBody:
 *              required: true
 *              content:
 *                  'application/json':
 *                      schema:
 *                          type: object
 *                          required:
 *                              - device_id
 *                          properties:
 *                              device_id:
 *                                  type: string
 *                                  description: The id of the device given by spool during registration.
 *                          example:
 *                              device_id: asdg034kajd024lc94
 */
router.post('/delete/', secured, wrapAsync(async (req, res) => {

	const visualization_id = req.body.visualization_id;

	try {
		if (await VisualizationDatabase.checkPermissions(visualization_id, ['edit'], req.apiUser)) {
			VisualizationDatabase.del(visualization_id, req.apiUser);
			res.sendStatus(200);
		}
		else {
			res.sendStatus(404);
		}
	}
	catch(error) {
		res.sendStatus(401);
	}
}));

module.exports = router;