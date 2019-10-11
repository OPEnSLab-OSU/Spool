/**
 * Created by eliwinkelman on 9/26/19.
 */


const { DatabaseInterface } = require("../db") ;

class NetworkModel {
	constructor(networkData) {
		this._id = networkData._id;
		this.name = networkData.name;
		this.devices = networkData.devices;
		this.owner = networkData.owner;
	}
}

class NetworkDatabase extends DatabaseInterface {

	static async getCollection() {
		return super.getCollection("Networks")
	}

	static async owns(id, user) {
		const network = await this.get(id);
		return network.owner === user._id;
	}

	static async get(id) {
		const Networks = await this.getCollection();
	
		const networks = await Networks.find({_id: id}).toArray();
	
		return networks[0];
	}

	static async getByUser(user) {

		const Networks = await this.getCollection();
		const userNetworks = user.networks;
		if (user.networks == undefined) {
			return [];
		}
		console.log(userNetworks);
		const networks = await Networks.find({_id: {$in: userNetworks}}).toArray();

		return networks;
	}
	
	static async createWithUser(user) {
		
		const network = NetworkModel({owner: user._id});
		
		const Networks = await this.getCollection();
		
		const insertion = await Networks.insertOne(network);
		
		return true;
		
	}

	static async addDevice(id, device_id) {
		const Networks = await this.getCollection();
		const network = await this.get(id);

		let networkData = new NetworkModel(network);

		if (! networkData.devices.includes(device_id)) {
			networkData.devices.push(device_id)
		}

		Networks.updateOne({_id: network._id}, networkData);
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

		Networks.updateOne({_id: network._id}, networkData);
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
		this.checkOwnership((id, user));
		this.del(id);
	}
}

module.exports = NetworkDatabase;