/**
 * Created by eliwinkelman on 9/13/19.
 */



var express = require('express');
var router = express.Router();
var secured = require('../../lib/middleware/secured');
var wrapAsync = require('../../lib/middleware/asyncWrap');
const {VisualizationModel} = require('../../javascript/models');

//MongoDB
var mongoClient = require('../../javascript/db');
const ObjectID = require('mongodb').ObjectID;

router.post('/new', wrapAsync(async (req, res) => {

	//generate a device_id
	const visualization_id = new ObjectID();
	//get the device id
	const device_id = req.body.device_id;

	if (req.apiUser.devices.includes(device_id)) {
		let client = await mongoClient().catch(err => {
			throw err;
		});

		const db = client.db('Loom');

		const VisualizationCollection = db.collection("Visualization");

		let visualizationData = req.body;
		visualizationData.visualization_id = visualization_id.toString();
		visualizationData.owner = req.apiUser._id;

		let analysis = new VisualizationModel(visualizationData);

		let _ = await VisualizationCollection.insertOne(analysis).catch((err) => {next(err)});

		res.sendStatus(200);
	}
	else {
		res.sendStatus(401);
	}
}));

router.get('/:device_id', secured, wrapAsync(async (req, res) => {

	const device_id = req.params.device_id;

	if (req.apiUser.devices.includes(device_id)) {

		let client = await mongoClient().catch(err => {
			throw err;
		});

		const db = client.db('Loom');

		const VisualizationCollection = db.collection("Visualization");

		let visualizations = await VisualizationCollection.find({device_id: device_id}).toArray().catch((err) => {next(err)});
		console.log(visualizations);
		res.send(visualizations);
	}
	else {
		res.sendStatus(401);
	}
}));

router.post('/update/', secured, wrapAsync(async (req, res) => {

	const visualization_id = req.body.visualization_id;

	let client = await mongoClient().catch(err => {
		throw err;
	});

	const db = client.db('Loom');

	const VisualizationCollection = db.collection("Visualization");


	if (req.apiUser._id.toString() == req.body.owner.toString()) {

		let visualizationData = new VisualizationModel(req.body);
		console.log(visualizationData);
		let _ = await VisualizationCollection.replaceOne({visualization_id: visualization_id.toString()}, visualizationData).catch((err) => {throw(err)});
		console.log("updating");
		res.sendStatus(200);
	}
	else {
		res.sendStatus(401);
	}
}));

router.post('/delete/:visualization_id', secured, wrapAsync(async (req, res) => {

	const visualization_id = req.params.visualization_id;

	let client = await mongoClient().catch(err => {
		throw err;
	});

	const db = client.db('Loom');

	const VisualizationCollection = db.collection("Visualization");

	let visualization = await VisualizationCollection.findOne({visualization_id: visualization_id}).catch((err) => {next(err)});

	if (req.apiUser._id == visualization.owner) {

		let visualizationData = VisualizationModel(req.body.visualizationData);

		let _ = await VisualizationCollection.deleteOne({visualization_id: visualization_id}).catch((err) => {next(err)});

		res.sendStatus(200);
	}
	else {
		res.sendStatus(401);
	}
}));

module.exports = router;