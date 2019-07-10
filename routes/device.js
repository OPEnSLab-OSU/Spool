/**
 * Created by eliwinkelman on 7/9/19.
 */

var express = require('express');
var router = express.Router();
var mongoClient = require('../javascript/db.js');

router.get('/data', function(req, res){
	/*
	API Endpoint to retrieve all data for a specific device.

	Request should look like

	parameters:
	 device_id = <device id>
	 data_run = <data run> (optional)
	 */

	//Add user authentication
	console.log("hello");

	if (req.query.device_id) {
		console.log(req.query.device_id);
		var device_id = req.query.device_id;
		mongoClient( (err, client) => {
			if (err) {
				throw err;
			}
			else {
				const db = client.db("Loom");
				const Devices = db.collection("devices");

				Devices.find({device_id: device_id}).toArray((err, result) => {
					if (err) throw err;
					else {
						console.log(result);
						const device_type = result[0].device_type;

						const DeviceData = db.collection(device_type);
						if (!req.query.data_run) {
							DeviceData.find({device_id: device_id}).toArray((err, results) => {
								if (err) throw err;
								else {
									console.log(results);
									res.send(results);
								}
							});
						}
						else {
							var data_run = req.query.data_run;
							const data_points = DeviceData.find({device_id: device_id, datarun_id: data_run}).toArray((err, results) => {
								if (err) throw err;
								else {
									console.log("Hello!!");
									res.send(results);
								}
							})
						}

					}
				})



			}
		})
	}
	else {
		res.send("No Device Specified.")
	}
});

router.post('/data', function(req, res) {

	/*
	API Endpoint to save a new device datapoint into the database.

	 Request should look like
	 {
	 "Device ID": <Device ID> (specific to each piece of hardware reporting data)
	 "Data Run ID": <Data run ID> (specific to each set of data collection)
	 "Data" : <json data provide from loom Manager.package()>
	 }
	 */

	var test_data = {
		"device_type": 'eGreenhouse',
		"device_id": '12345',
		"datarun_id": '54321',
		"data": {
			"type": "data",
			"timestamp": {
				"Date": "2019/7/8",
				"Time": "11:29:26"
			},
			"contents": [
				{
					"module": "TLS2561",
					"data": {
						"IR": 212,
						"Full": 1672,
						"Lux": 719
					}
				},
				{
					"module": "SHT31D",
					"data": {
						"Temp": 24.57542,
						"Humid": 48.22004
					}
				},
				{
					"module": "K30",
					"data": {
						"C02": 654
					}
				}
			]
		}
	};

	mongoClient((err, client) => {
		if (err) {
			console.log(err);
			res.send(err);
		}
		else {

			const db = client.db('Loom');

			//IMPLEMENT data validation
			//check that device type exists and data matches
			//check that device id was registered

			const DeviceData = db.collection(test_data.device_type);
			DeviceData.insertOne(test_data, (err, result) => {
				if (err) throw err;
				else {
					res.send(result);
				}
			})
		}
	});
});

module.exports = router;