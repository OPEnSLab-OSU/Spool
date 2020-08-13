/**
 * Created by eliwinkelman on 9/26/19.
 */


const { DatabaseInterface } = require("../db") ;
const DeviceDatabase = require("./device");
const ObjectID = require('mongodb').ObjectID;
const Permissions = require('../permissions');

class NetworkModel {
	constructor(networkData) {
		this._id = networkData._id;
		this.name = networkData.name;
		this.devices = networkData.devices || [];
		this.owner = networkData.owner;
		this.permissions = new Permissions(networkData.permissions);
	}
}

class NetworkDatabase extends DatabaseInterface {

	static async getCollection() {
		return super.getCollection("Networks")
	}

	static async owns(id, user) {
		const network = await this.get(id);

		return network.owner.toString() === user._id.toString();
	}

	static async get(id) {
		const Networks = await this.getCollection();

		const networks = await Networks.find({_id: new ObjectID(id.toString())}).toArray();

		return networks[0];
	}

	static async getByUser(user) {

		const Networks = await this.getCollection();
		let networkArray = [];
		if (user.networks !== undefined) {
			networkArray = user.networks.map(network => {
				return ObjectID(network)
			});
		}

		return await Networks.find({_id: {$in: networkArray}}).toArray();
	}

	static async createWithUser(name, user) {

		const network = new NetworkModel({owner: user._id, name: name});

		network.permissions.add('edit', user._id);
		network.permissions.add('view', user._id);
		network.permissions.add('delete', user._id);

		const Networks = await this.getCollection();
		
		const insertion = await Networks.insertOne(network);
		console.log(insertion);
		// make a coordinator device
		const coordinator = await DeviceDatabase.create("Coordinator", null, user, insertion.insertedId);

		// add the coordinator to the network
		const addedCoordinator = await this.addDevice(insertion.insertedId, coordinator.device_id);

		// add the network to the users owned networks list.
		if (user.networks === undefined) {
			user.networks = [];
		}

		user.networks.push(insertion.insertedId.toString());

		const Users = await super.getCollection("Users");

		let userUpdate = await Users.updateOne({_id: new ObjectID(user._id)}, {$set: {networks: user.networks}}).catch(err => {
			throw err
		});
		
		// return the coordinator info to the user
		return coordinator;
	}

	static async addDevice(id, device_id) {
		const Networks = await this.getCollection();
		const network = await this.get(id);

		let networkData = new NetworkModel(network);

		if (!networkData.devices.includes(device_id)) {
			networkData.devices.push(device_id)
		}
		
		Networks.updateOne({_id: network._id}, {$set: networkData});
		return true;
	}

	static async removeDevice(id, device_id) {
		const Networks = await this.getCollection();
		
		const network = await this.get(id);
		
		let networkData = new NetworkModel(network);
		
		let index = networkData.devices.indexOf(device_id);
		
		if (index > -1) {
			networkData.devices.splice(index, 1)
		}
		
		Networks.updateOne({_id: network._id}, {$set: networkData});
		return true;
	}
	
	static async update(id, update) {
		
		const Networks = await this.getCollection();
	
		const _ = await Networks.updateOne({_id: id}, update);
	
		return true
	}
	
	static async updateWithUser(id, update, user) {
	
		this.checkOwnership(id, user);
		
		this.update(id, update);
	}
	
	static async del(id) {
		const Networks = await this.getCollection();

		const deleted = await Networks.deleteOne({_id: id});
		return true;
	}
	
	static async delWithUser(id, user) {
		this.checkOwnership(id, user);
		this.del(id);

		// delete from the user object too
		const index = user.networks.indexOf(id);
		if (index > -1) {
			user.networks.splice(index, 1);
		}

		const Users = await super.getCollection("Users");

		let userUpdate = await Users.updateOne({_id: new ObjectID(user._id)}, {$set: {networks: user.networks}}).catch(err => {
			throw err
		});
	}
}

module.exports = NetworkDatabase;