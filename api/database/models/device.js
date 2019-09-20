/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;
const ObjectID = require('mongodb').ObjectID;
var ClientCertFactory = require('../../lib/ClientCertFactory');
var pem = require('pem');
var getKeys = require("../../lib/manageKeys");

class DeviceModel {
	constructor(name, device_id, fingerprint, owner) {
		this.name = name;
		this.device_id = device_id;
		this.fingerprint = fingerprint;
		this.owner = owner;
	}
}

class DeviceDatabase extends DatabaseInterface {

	static async getCollection() {
		const collection = await super.getCollection("Devices");
		return collection;
	}
	
	static async getByUser(user) {

		// check which user role we have to handle
		let usersDevices = [];
		const Devices = await this.getCollection();
		if (user.role == "user") {

			const deviceArray = user.devices.map(device => {
				return ObjectID(device)
			});

			usersDevices = await Devices.find({device_id: {$in: deviceArray}}).toArray().catch(err => {
				throw err;
			});
		}

		else if (user.role == "admin") {
			usersDevices = await Devices.find({}).toArray().catch(err => {
				throw err;
			});
		}

		return usersDevices;
	}

	static async owns(id, user) {
		
		return user.devices.includes(id.toString())
	}

	static async get(id, user) {
		
		
		this.checkOwnership(id, user);

		const Devices = await this.getCollection();

		var devices = await Devices.find({device_id: new ObjectID(id)}).toArray().catch(err => {
			throw err
		});
		
		return devices[0];
		
	}

	static async update(id, update, user) {

		this.checkOwnership(id, user);

		const Devices = await this.getCollection();

		let device = {};
		if (this.owns(id, user)) {
			device = await Devices.updateOne({device_id: new ObjectID(id)}, update)
		}
		return device;
	}

	static async del(id, user) {
		this.checkOwnership(id, user);

		const Devices = await this.getCollection();

		// delete the device
		Devices.deleteOne({device_id: new ObjectID(id)});

		//delete the device data
		const DeviceData = await super.getCollection(id.toString());
		DeviceData.deleteOne({device_id: new ObjectID(id)});
		
		return true;
	}
	
	static async create(type, name, user) {
		
		//generate a device_id
		const device_id = new ObjectID();

		//======= Generate Client Certificate =======//
		// get the certificate authority keys
		const keys = await getKeys();

		// generate a client certificate
		const certFactory = new ClientCertFactory(process.env.OPENSSL_BINARY_PATH, keys.ca.certificate);
		const clientCert = await certFactory.create_cert(keys.ca.key, "Spool Client " + device_id, false).catch((err) => {
			throw err
		});

		//======= Add the new device to the database =======//

		const Devices = await this.getCollection();
		
		const new_device = {
			type: type,
			name: name,
			device_id: device_id,
			fingerprint: clientCert.fingerprint,
			owner: user._id
		};

		let devices = await Devices.insertOne(new_device).catch(err => {
			throw err;
		});

		//add device to user array
		const Users = await super.getCollection("Users");
		user.devices.push(device_id.toString());

		let userUpdate = Users.updateOne({_id: new ObjectID(user._id)}, {$set: {devices: user.devices}}).catch(err => {
			throw err
		});

		return {
			device_id: device_id,
			certificate: clientCert.certificate,
			private_key: clientCert.key
		}
	}
}

module.exports = DeviceDatabase;
